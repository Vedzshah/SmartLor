import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateLOR } from "./openai";
import multer from "multer";
import { lorGenerationRequestSchema, type StudentProfile } from "@shared/schema";
import { ZodError } from "zod";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.'));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all faculty
  app.get("/api/faculty", async (req, res) => {
    try {
      const faculty = await storage.getAllFaculty();
      res.json(faculty);
    } catch (error) {
      console.error("Error fetching faculty:", error);
      res.status(500).json({ message: "Failed to fetch faculty" });
    }
  });

  // Get single faculty member
  app.get("/api/faculty/:id", async (req, res) => {
    try {
      const faculty = await storage.getFaculty(req.params.id);
      if (!faculty) {
        return res.status(404).json({ message: "Faculty not found" });
      }
      res.json(faculty);
    } catch (error) {
      console.error("Error fetching faculty:", error);
      res.status(500).json({ message: "Failed to fetch faculty" });
    }
  });

  // Parse resume (extract text)
  app.post("/api/parse-resume", upload.single("resume"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // For now, return basic extracted data
      // In a production app, you would use libraries like pdf-parse or mammoth
      // to extract text from PDF/DOCX files
      const resumeData = {
        rawText: req.file.buffer.toString('utf-8').substring(0, 5000), // Basic text extraction
        cgpa: undefined,
        courses: [],
        projects: [],
        internships: [],
        technicalSkills: [],
        achievements: [],
        awards: [],
        extracurricular: [],
      };

      res.json(resumeData);
    } catch (error) {
      console.error("Error parsing resume:", error);
      res.status(500).json({ message: "Failed to parse resume" });
    }
  });

  // Generate LOR
  app.post("/api/generate-lor", async (req, res) => {
    try {
      const validatedData = lorGenerationRequestSchema.parse(req.body);
      const { studentProfile, facultyId } = validatedData;

      const faculty = await storage.getFaculty(facultyId);
      if (!faculty) {
        return res.status(404).json({ message: "Faculty not found" });
      }

      // Generate the LOR using OpenAI
      const lorContent = await generateLOR(studentProfile, faculty);

      // Save to storage
      await storage.createLOR({
        studentName: studentProfile.name,
        studentEmail: studentProfile.email || null,
        facultyId,
        lorContent,
        studentProfile: studentProfile as any,
      });

      res.json({ lorContent });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Invalid request data",
          errors: error.errors 
        });
      }
      
      console.error("Error generating LOR:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to generate LOR" 
      });
    }
  });

  // Download LOR (placeholder - would need PDF/DOCX generation libraries)
  app.post("/api/download-lor", async (req, res) => {
    try {
      const { lorContent, faculty, studentName } = req.body;
      const format = req.query.format as string;

      if (!lorContent || !faculty) {
        return res.status(400).json({ message: "Missing required data" });
      }

      // Create full LOR with letterhead
      const fullLOR = `
K J Somaiya College of Engineering
(Autonomous college affiliated to the University of Mumbai)

LETTER OF RECOMMENDATION

${lorContent}

${faculty.name}
${faculty.designation}
${faculty.department}
K.J. Somaiya College of Engineering
${faculty.email}
      `.trim();

      if (format === 'pdf' || format === 'docx') {
        // For MVP, return as text file
        // In production, use libraries like jsPDF or docx to generate proper files
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', `attachment; filename="LOR_${studentName.replace(/\s+/g, '_')}.txt"`);
        res.send(fullLOR);
      } else {
        res.status(400).json({ message: "Invalid format" });
      }
    } catch (error) {
      console.error("Error downloading LOR:", error);
      res.status(500).json({ message: "Failed to download LOR" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
