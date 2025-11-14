import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Faculty Profile Schema
export const faculty = pgTable("faculty", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  designation: text("designation").notNull(),
  department: text("department").notNull(),
  email: text("email").notNull(),
  coursesTaught: text("courses_taught").array(),
  yearsOfExperience: text("years_of_experience"),
  profileImage: text("profile_image"),
});

export const insertFacultySchema = createInsertSchema(faculty).omit({
  id: true,
});

export type InsertFaculty = z.infer<typeof insertFacultySchema>;
export type Faculty = typeof faculty.$inferSelect;

// Questionnaire Response Schema
export const questionnaireSchema = z.object({
  // Relationship with professor
  relationshipDetails: z.string().min(10, "Please provide details about your relationship with the professor"),
  courseName: z.string().min(1, "Course name is required"),
  semester: z.string().optional(),
  interactionDuration: z.string().optional(),
  
  // Council/Leadership
  inCouncil: z.boolean().default(false),
  councilName: z.string().optional(),
  councilPost: z.string().optional(),
  
  // Skills and strengths
  keySkills: z.array(z.string()).min(1, "Please select at least one skill"),
  
  // Challenge and achievement
  challengeDescription: z.string().min(20, "Please describe a meaningful challenge"),
  
  // Achievements not on resume
  additionalAchievements: z.string().optional(),
  
  // Working style
  workingStyle: z.array(z.string()).min(1, "Please describe your working style"),
  
  // Purpose of LOR
  lorPurpose: z.string().min(1, "Purpose is required"),
  targetCountry: z.string().optional(),
  universityType: z.string().optional(),
  
  // Personal story
  personalStory: z.string().optional(),
  
  // Other details
  otherDetails: z.string().optional(),
});

export type QuestionnaireResponse = z.infer<typeof questionnaireSchema>;

// Resume Data Schema (parsed from uploaded file)
export const resumeDataSchema = z.object({
  // Academic details
  courses: z.array(z.object({
    name: z.string(),
    grade: z.string().optional(),
    semester: z.string().optional(),
  })).optional(),
  cgpa: z.string().optional(),
  
  // Projects
  projects: z.array(z.object({
    name: z.string(),
    description: z.string(),
    role: z.string().optional(),
    technologies: z.array(z.string()).optional(),
  })).optional(),
  
  // Internships
  internships: z.array(z.object({
    company: z.string(),
    role: z.string(),
    duration: z.string(),
    impact: z.string().optional(),
  })).optional(),
  
  // Skills
  technicalSkills: z.array(z.string()).optional(),
  
  // Achievements
  achievements: z.array(z.string()).optional(),
  awards: z.array(z.string()).optional(),
  
  // Extracurricular
  extracurricular: z.array(z.string()).optional(),
  
  // Raw extracted text
  rawText: z.string().optional(),
});

export type ResumeData = z.infer<typeof resumeDataSchema>;

// Student Profile (combines questionnaire + resume)
export const studentProfileSchema = z.object({
  name: z.string().min(1, "Student name is required"),
  email: z.string().email("Valid email is required").optional(),
  questionnaire: questionnaireSchema,
  resumeData: resumeDataSchema.optional(),
});

export type StudentProfile = z.infer<typeof studentProfileSchema>;

// Generated LOR Schema
export const generatedLOR = pgTable("generated_lors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentName: text("student_name").notNull(),
  studentEmail: text("student_email"),
  facultyId: varchar("faculty_id").references(() => faculty.id),
  lorContent: text("lor_content").notNull(),
  studentProfile: jsonb("student_profile").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertGeneratedLORSchema = createInsertSchema(generatedLOR).omit({
  id: true,
  createdAt: true,
});

export type InsertGeneratedLOR = z.infer<typeof insertGeneratedLORSchema>;
export type GeneratedLOR = typeof generatedLOR.$inferSelect;

// LOR Generation Request Schema
export const lorGenerationRequestSchema = z.object({
  studentProfile: studentProfileSchema,
  facultyId: z.string().min(1, "Faculty selection is required"),
});

export type LORGenerationRequest = z.infer<typeof lorGenerationRequestSchema>;
