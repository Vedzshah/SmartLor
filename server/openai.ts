import OpenAI from "openai";
import type { StudentProfile, Faculty } from "@shared/schema";

// Validate API key exists
if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable is not set");
}

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

const LOR_SYSTEM_PROMPT = `You are an Expert University Professor who has written thousands of highly effective Letters of Recommendation (LORs) for top universities worldwide.

Your job is to transform structured student details, teacher details, and questionnaire answers into a polished, compelling, highly personalized LOR that sounds authentically written by a professor — NOT by the student.

STRICT RULES FOR GENERATION:

1. Do NOT copy sentences or phrases from the input.  
   Rewrite everything professionally, expand ideas, and add depth.

2. Convert short inputs into rich narratives:
   - Turn bullet points into descriptive paragraphs.
   - Turn simple achievements into strong stories.
   - Add context, reasoning, and the professor's perspective.

3. Maintain a natural professor's voice:
   - Confident but not exaggerated
   - Balanced between technical evaluation + personal traits
   - Formal academic tone

4. Add missing details logically:
   If the student provides limited info, infer reasonable examples such as:
   - Class performance
   - Project contributions
   - Work ethic
   - Analytical ability
   - Collaboration style

5. Structure the LOR professionally:
   - Paragraph 1: Introduce yourself (professor), credibility, relationship, course taught, duration  
   - Paragraph 2: Student's academic abilities, technical competence, classroom behavior  
   - Paragraph 3: Project work, research potential, examples of problem-solving  
   - Paragraph 4: Personal qualities—leadership, responsibility, teamwork, communication  
   - Paragraph 5: Strong comparison ("top X% students I have taught")  
   - Paragraph 6: Clear and enthusiastic recommendation  

6. Write a strong conclusion:
   - Invite the admissions committee to contact you  
   - Do NOT include professor's email or designation (these will be added separately)
   - End with formal closing  

7. Refine language to match top university expectations:
   - Use academic vocabulary  
   - Be specific, confident, and outcome-focused  
   - Avoid clichés, informal tone, repetition, and generic statements  

8. NEVER reveal or mention:
   - That the letter is AI-generated  
   - That this is based on student inputs  
   - That details were inferred  

OUTPUT REQUIREMENTS:

- Produce a complete, polished LOR of 450–550 words.
- Maintain consistent professor-first-person perspective.
- Ensure coherence, narrative flow, and professional academic tone.
- Ensure the output stands alone as a genuine professor-written recommendation.
- Return ONLY the letter content without any preamble or metadata.
- Do NOT include signature block (name, email, designation) - these will be added separately.`;

export async function generateLOR(
  studentProfile: StudentProfile,
  faculty: Faculty
): Promise<string> {
  const { name, email, questionnaire, resumeData } = studentProfile;

  // Build a comprehensive context for the AI
  const studentContext = buildStudentContext(name, email, questionnaire, resumeData);
  const facultyContext = buildFacultyContext(faculty, questionnaire.courseName);

  const userPrompt = `${facultyContext}

${studentContext}

Generate a professional, authentic Letter of Recommendation following all the rules and structure outlined in your instructions.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: LOR_SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      max_completion_tokens: 2048,
    });

    const lorContent = response.choices[0].message.content?.trim() || "";
    
    if (!lorContent) {
      throw new Error("Failed to generate LOR content");
    }

    return lorContent;
  } catch (error) {
    console.error("Error generating LOR:", error);
    throw new Error("Failed to generate Letter of Recommendation");
  }
}

function buildFacultyContext(faculty: Faculty, courseName: string): string {
  return `PROFESSOR DETAILS:
Name: ${faculty.name}
Designation: ${faculty.designation}
Department: ${faculty.department}
Email: ${faculty.email}
Course Taught to Student: ${courseName}
Years of Experience: ${faculty.yearsOfExperience || "Multiple years"}
Other Courses: ${faculty.coursesTaught?.join(", ") || "Various Computer Engineering courses"}`;
}

function buildStudentContext(
  name: string,
  email: string | undefined,
  questionnaire: any,
  resumeData: any
): string {
  let context = `STUDENT DETAILS:
Name: ${name}
${email ? `Email: ${email}` : ""}

RELATIONSHIP WITH PROFESSOR:
${questionnaire.relationshipDetails}
Course: ${questionnaire.courseName}
${questionnaire.semester ? `Semester: ${questionnaire.semester}` : ""}
${questionnaire.interactionDuration ? `Duration: ${questionnaire.interactionDuration}` : ""}

KEY SKILLS TO HIGHLIGHT:
${questionnaire.keySkills.join(", ")}

WORKING STYLE:
${questionnaire.workingStyle.join(", ")}

CHALLENGE OVERCOME:
${questionnaire.challengeDescription}

${questionnaire.additionalAchievements ? `ADDITIONAL ACHIEVEMENTS:\n${questionnaire.additionalAchievements}\n` : ""}

${questionnaire.inCouncil && questionnaire.councilName ? `LEADERSHIP ROLE:\nPosition: ${questionnaire.councilPost} at ${questionnaire.councilName}\n` : ""}

PURPOSE OF LOR:
${questionnaire.lorPurpose}
${questionnaire.targetCountry ? `Target Country: ${questionnaire.targetCountry}` : ""}
${questionnaire.universityType ? `University Type: ${questionnaire.universityType}` : ""}

${questionnaire.personalStory ? `PERSONAL STORY:\n${questionnaire.personalStory}\n` : ""}

${questionnaire.otherDetails ? `OTHER DETAILS:\n${questionnaire.otherDetails}\n` : ""}`;

  // Add resume data if available
  if (resumeData) {
    if (resumeData.cgpa) {
      context += `\n\nACADEMIC PERFORMANCE:\nCGPA: ${resumeData.cgpa}`;
    }

    if (resumeData.courses && resumeData.courses.length > 0) {
      context += `\n\nRELEVANT COURSES:\n${resumeData.courses.map((c: any) => `- ${c.name}${c.grade ? ` (Grade: ${c.grade})` : ""}`).join("\n")}`;
    }

    if (resumeData.projects && resumeData.projects.length > 0) {
      context += `\n\nPROJECTS:\n${resumeData.projects.map((p: any) => `- ${p.name}: ${p.description}${p.role ? ` (Role: ${p.role})` : ""}`).join("\n")}`;
    }

    if (resumeData.internships && resumeData.internships.length > 0) {
      context += `\n\nINTERNSHIPS:\n${resumeData.internships.map((i: any) => `- ${i.role} at ${i.company} (${i.duration})${i.impact ? `: ${i.impact}` : ""}`).join("\n")}`;
    }

    if (resumeData.technicalSkills && resumeData.technicalSkills.length > 0) {
      context += `\n\nTECHNICAL SKILLS:\n${resumeData.technicalSkills.join(", ")}`;
    }

    if (resumeData.achievements && resumeData.achievements.length > 0) {
      context += `\n\nACHIEVEMENTS:\n${resumeData.achievements.map((a: string) => `- ${a}`).join("\n")}`;
    }

    if (resumeData.awards && resumeData.awards.length > 0) {
      context += `\n\nAWARDS:\n${resumeData.awards.map((a: string) => `- ${a}`).join("\n")}`;
    }

    if (resumeData.extracurricular && resumeData.extracurricular.length > 0) {
      context += `\n\nEXTRACURRICULAR ACTIVITIES:\n${resumeData.extracurricular.map((e: string) => `- ${e}`).join("\n")}`;
    }
  }

  return context;
}
