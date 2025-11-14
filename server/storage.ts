import { 
  type Faculty, 
  type InsertFaculty, 
  type GeneratedLOR, 
  type InsertGeneratedLOR 
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Faculty operations
  getFaculty(id: string): Promise<Faculty | undefined>;
  getAllFaculty(): Promise<Faculty[]>;
  createFaculty(faculty: InsertFaculty): Promise<Faculty>;
  
  // LOR operations
  getLOR(id: string): Promise<GeneratedLOR | undefined>;
  createLOR(lor: InsertGeneratedLOR): Promise<GeneratedLOR>;
  getAllLORs(): Promise<GeneratedLOR[]>;
}

export class MemStorage implements IStorage {
  private faculty: Map<string, Faculty>;
  private lors: Map<string, GeneratedLOR>;

  constructor() {
    this.faculty = new Map();
    this.lors = new Map();
    
    // Seed with sample faculty data
    this.seedFacultyData();
  }

  private seedFacultyData() {
    const sampleFaculty: InsertFaculty[] = [
      {
        name: "Dr. S M",
        designation: "Assistant Professor",
        department: "Computer Engineering Department",
        email: "s.m@somaiya.edu",
        coursesTaught: ["Data Structures", "Algorithms", "Artificial Intelligence"],
        yearsOfExperience: "8 years",
        profileImage: undefined,
      },
      {
        name: "Prof. Rajesh Kumar",
        designation: "Associate Professor",
        department: "Computer Engineering Department",
        email: "rajesh.kumar@somaiya.edu",
        coursesTaught: ["Database Management", "Software Engineering", "Web Technologies"],
        yearsOfExperience: "12 years",
        profileImage: undefined,
      },
      {
        name: "Dr. Priya Sharma",
        designation: "Assistant Professor",
        department: "Computer Engineering Department",
        email: "priya.sharma@somaiya.edu",
        coursesTaught: ["Machine Learning", "Computer Networks", "Operating Systems"],
        yearsOfExperience: "6 years",
        profileImage: undefined,
      },
      {
        name: "Prof. Amit Patel",
        designation: "Professor",
        department: "Computer Engineering Department",
        email: "amit.patel@somaiya.edu",
        coursesTaught: ["Computer Architecture", "Compiler Design", "Theory of Computation"],
        yearsOfExperience: "15 years",
        profileImage: undefined,
      },
    ];

    sampleFaculty.forEach((f) => {
      const id = randomUUID();
      const faculty: Faculty = { ...f, id };
      this.faculty.set(id, faculty);
    });
  }

  async getFaculty(id: string): Promise<Faculty | undefined> {
    return this.faculty.get(id);
  }

  async getAllFaculty(): Promise<Faculty[]> {
    return Array.from(this.faculty.values());
  }

  async createFaculty(insertFaculty: InsertFaculty): Promise<Faculty> {
    const id = randomUUID();
    const faculty: Faculty = { ...insertFaculty, id };
    this.faculty.set(id, faculty);
    return faculty;
  }

  async getLOR(id: string): Promise<GeneratedLOR | undefined> {
    return this.lors.get(id);
  }

  async createLOR(insertLOR: InsertGeneratedLOR): Promise<GeneratedLOR> {
    const id = randomUUID();
    const lor: GeneratedLOR = {
      ...insertLOR,
      id,
      createdAt: new Date(),
    };
    this.lors.set(id, lor);
    return lor;
  }

  async getAllLORs(): Promise<GeneratedLOR[]> {
    return Array.from(this.lors.values());
  }
}

export const storage = new MemStorage();
