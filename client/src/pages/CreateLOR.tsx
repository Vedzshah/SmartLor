import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ProgressStepper } from "@/components/ProgressStepper";
import { FacultyCard } from "@/components/FacultyCard";
import { ResumeUpload } from "@/components/ResumeUpload";
import { LORPreview } from "@/components/LORPreview";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { FileText, ArrowLeft, ArrowRight, Download, Loader2 } from "lucide-react";
import { questionnaireSchema, studentProfileSchema, type Faculty, type QuestionnaireResponse, type StudentProfile, type ResumeData } from "@shared/schema";
import { z } from "zod";

const STEPS = [
  { id: 1, name: "Student Info", description: "Basic information" },
  { id: 2, name: "Questionnaire", description: "Academic details" },
  { id: 3, name: "Resume", description: "Upload resume" },
  { id: 4, name: "Faculty", description: "Select professor" },
  { id: 5, name: "Review", description: "Generate LOR" },
];

const SKILLS_OPTIONS = [
  "Leadership",
  "Teamwork",
  "Technical Skills",
  "Communication",
  "Problem Solving",
  "Creativity",
  "Research",
  "Analytical Thinking",
];

const WORKING_STYLE_OPTIONS = [
  "Analytical",
  "Detail-oriented",
  "Team-first",
  "Fast learner",
  "Resilient",
  "Self-motivated",
  "Collaborative",
  "Innovative",
];

export default function CreateLOR() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [questionnaireData, setQuestionnaireData] = useState<QuestionnaireResponse | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
  const [generatedLOR, setGeneratedLOR] = useState<string | null>(null);

  const { data: faculty, isLoading: facultyLoading } = useQuery<Faculty[]>({
    queryKey: ["/api/faculty"],
    enabled: currentStep === 4,
  });

  const uploadResumeMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("resume", file);
      
      const response = await fetch("/api/parse-resume", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("Failed to upload resume");
      }
      
      return response.json();
    },
    onSuccess: (data: ResumeData) => {
      setResumeData(data);
      toast({
        title: "Resume uploaded",
        description: "Your resume has been processed successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Upload failed",
        description: "Failed to process your resume. Please try again.",
        variant: "destructive",
      });
    },
  });

  const generateLORMutation = useMutation({
    mutationFn: async (data: { studentProfile: StudentProfile; facultyId: string }) => {
      return await apiRequest("POST", "/api/generate-lor", data);
    },
    onSuccess: (data: { lorContent: string }) => {
      setGeneratedLOR(data.lorContent);
      toast({
        title: "LOR Generated",
        description: "Your Letter of Recommendation has been created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Generation failed",
        description: "Failed to generate LOR. Please try again.",
        variant: "destructive",
      });
    },
  });

  const downloadMutation = useMutation({
    mutationFn: async (format: "pdf" | "docx") => {
      if (!generatedLOR || !selectedFaculty) return;
      
      const response = await fetch(`/api/download-lor?format=${format}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lorContent: generatedLOR,
          faculty: selectedFaculty,
          studentName,
        }),
      });
      
      if (!response.ok) throw new Error("Download failed");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `LOR_${studentName.replace(/\s+/g, "_")}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onSuccess: () => {
      toast({
        title: "Download started",
        description: "Your LOR is being downloaded.",
      });
    },
  });

  const handleFileSelect = (file: File) => {
    setResumeFile(file);
    uploadResumeMutation.mutate(file);
  };

  const handleRemoveResume = () => {
    setResumeFile(null);
    setResumeData(null);
  };

  const handleGenerateLOR = () => {
    if (!questionnaireData || !selectedFaculty) return;

    const studentProfile: StudentProfile = {
      name: studentName,
      email: studentEmail || undefined,
      questionnaire: questionnaireData,
      resumeData: resumeData || undefined,
    };

    generateLORMutation.mutate({
      studentProfile,
      facultyId: selectedFaculty.id,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" data-testid="button-back-home">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-semibold">Create New LOR</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <ProgressStepper steps={STEPS} currentStep={currentStep} />

          {currentStep === 1 && (
            <StepStudentInfo
              studentName={studentName}
              studentEmail={studentEmail}
              onNext={(name, email) => {
                setStudentName(name);
                setStudentEmail(email);
                setCurrentStep(2);
              }}
            />
          )}

          {currentStep === 2 && (
            <StepQuestionnaire
              initialData={questionnaireData}
              onNext={(data) => {
                setQuestionnaireData(data);
                setCurrentStep(3);
              }}
              onBack={() => setCurrentStep(1)}
            />
          )}

          {currentStep === 3 && (
            <StepResume
              resumeFile={resumeFile}
              isUploading={uploadResumeMutation.isPending}
              onFileSelect={handleFileSelect}
              onRemove={handleRemoveResume}
              onNext={() => setCurrentStep(4)}
              onBack={() => setCurrentStep(2)}
            />
          )}

          {currentStep === 4 && (
            <StepFacultySelection
              faculty={faculty || []}
              isLoading={facultyLoading}
              selectedFaculty={selectedFaculty}
              onSelect={(f) => setSelectedFaculty(f)}
              onNext={() => setCurrentStep(5)}
              onBack={() => setCurrentStep(3)}
            />
          )}

          {currentStep === 5 && (
            <StepReviewAndGenerate
              studentName={studentName}
              selectedFaculty={selectedFaculty}
              generatedLOR={generatedLOR}
              isGenerating={generateLORMutation.isPending}
              onGenerate={handleGenerateLOR}
              onDownload={(format) => downloadMutation.mutate(format)}
              isDownloading={downloadMutation.isPending}
              onBack={() => setCurrentStep(4)}
            />
          )}
        </div>
      </main>
    </div>
  );
}

function StepStudentInfo({
  studentName,
  studentEmail,
  onNext,
}: {
  studentName: string;
  studentEmail: string;
  onNext: (name: string, email: string) => void;
}) {
  const form = useForm<{ name: string; email: string }>({
    resolver: zodResolver(
      z.object({
        name: z.string().min(1, "Name is required"),
        email: z.string().email("Valid email is required").or(z.literal("")),
      })
    ),
    defaultValues: {
      name: studentName,
      email: studentEmail,
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Information</CardTitle>
        <CardDescription>Enter your basic details to get started</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) => onNext(data.name, data.email))}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your full name" {...field} data-testid="input-student-name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="your.email@example.com" type="email" {...field} data-testid="input-student-email" />
                  </FormControl>
                  <FormDescription>
                    Your email may be included in the LOR if provided
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit" data-testid="button-next-step">
                Next Step
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

function StepQuestionnaire({
  initialData,
  onNext,
  onBack,
}: {
  initialData: QuestionnaireResponse | null;
  onNext: (data: QuestionnaireResponse) => void;
  onBack: () => void;
}) {
  const form = useForm<QuestionnaireResponse>({
    resolver: zodResolver(questionnaireSchema),
    defaultValues: initialData || {
      relationshipDetails: "",
      courseName: "",
      semester: "",
      interactionDuration: "",
      inCouncil: false,
      councilName: "",
      councilPost: "",
      keySkills: [],
      challengeDescription: "",
      additionalAchievements: "",
      workingStyle: [],
      lorPurpose: "",
      targetCountry: "",
      universityType: "",
      personalStory: "",
      otherDetails: "",
    },
  });

  const inCouncil = form.watch("inCouncil");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Questionnaire</CardTitle>
        <CardDescription>
          Provide detailed information to help generate an authentic recommendation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onNext)} className="space-y-6">
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Relationship with Professor</h3>
                
                <FormField
                  control={form.control}
                  name="relationshipDetails"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>How do you know this professor?</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your relationship, interaction duration, and depth of connection..."
                          className="min-h-24"
                          {...field}
                          data-testid="input-relationship-details"
                        />
                      </FormControl>
                      <FormDescription>
                        Include course name, semester, and how long you've known them
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="courseName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Data Structures" {...field} data-testid="input-course-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="semester"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Semester (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Fall 2023" {...field} data-testid="input-semester" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Leadership & Extracurricular</h3>
                
                <FormField
                  control={form.control}
                  name="inCouncil"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-in-council"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>I have been part of a student council or organization</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                {inCouncil && (
                  <div className="grid sm:grid-cols-2 gap-4 ml-6">
                    <FormField
                      control={form.control}
                      name="councilName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Council/Organization Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Student Council" {...field} data-testid="input-council-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="councilPost"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Position</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., President" {...field} data-testid="input-council-post" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Skills & Strengths</h3>
                
                <FormField
                  control={form.control}
                  name="keySkills"
                  render={() => (
                    <FormItem>
                      <FormLabel>Select key skills to highlight</FormLabel>
                      <div className="grid sm:grid-cols-2 gap-3 mt-2">
                        {SKILLS_OPTIONS.map((skill) => (
                          <FormField
                            key={skill}
                            control={form.control}
                            name="keySkills"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(skill)}
                                    onCheckedChange={(checked) => {
                                      const updated = checked
                                        ? [...(field.value || []), skill]
                                        : field.value?.filter((v) => v !== skill) || [];
                                      field.onChange(updated);
                                    }}
                                    data-testid={`checkbox-skill-${skill.toLowerCase().replace(/\s+/g, "-")}`}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">{skill}</FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Challenges & Achievements</h3>
                
                <FormField
                  control={form.control}
                  name="challengeDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Describe a significant challenge you overcame</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Explain the challenge you faced and how you resolved it..."
                          className="min-h-32"
                          {...field}
                          data-testid="input-challenge-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="additionalAchievements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional achievements not on resume (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Mentoring juniors, club contributions, volunteering..."
                          className="min-h-24"
                          {...field}
                          data-testid="input-additional-achievements"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Working Style</h3>
                
                <FormField
                  control={form.control}
                  name="workingStyle"
                  render={() => (
                    <FormItem>
                      <FormLabel>How would you describe your working style?</FormLabel>
                      <div className="grid sm:grid-cols-2 gap-3 mt-2">
                        {WORKING_STYLE_OPTIONS.map((style) => (
                          <FormField
                            key={style}
                            control={form.control}
                            name="workingStyle"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(style)}
                                    onCheckedChange={(checked) => {
                                      const updated = checked
                                        ? [...(field.value || []), style]
                                        : field.value?.filter((v) => v !== style) || [];
                                      field.onChange(updated);
                                    }}
                                    data-testid={`checkbox-style-${style.toLowerCase().replace(/\s+/g, "-")}`}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">{style}</FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Purpose & Goals</h3>
                
                <FormField
                  control={form.control}
                  name="lorPurpose"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What is the purpose of this LOR?</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., MS in Computer Science" {...field} data-testid="input-lor-purpose" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="targetCountry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Country (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., USA" {...field} data-testid="input-target-country" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="universityType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>University Type (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Top-tier research" {...field} data-testid="input-university-type" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Additional Information</h3>
                
                <FormField
                  control={form.control}
                  name="personalStory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Personal story or anecdote (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any specific story the professor should mention..."
                          className="min-h-24"
                          {...field}
                          data-testid="input-personal-story"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="otherDetails"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Other details (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any other information you'd like to include..."
                          className="min-h-24"
                          {...field}
                          data-testid="input-other-details"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-between pt-6">
              <Button type="button" variant="outline" onClick={onBack} data-testid="button-back-step">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button type="submit" data-testid="button-next-step">
                Next Step
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

function StepResume({
  resumeFile,
  isUploading,
  onFileSelect,
  onRemove,
  onNext,
  onBack,
}: {
  resumeFile: File | null;
  isUploading: boolean;
  onFileSelect: (file: File) => void;
  onRemove: () => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Resume</CardTitle>
        <CardDescription>
          Upload your resume to help us extract relevant academic details (optional but recommended)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <ResumeUpload
          onFileSelect={onFileSelect}
          isUploading={isUploading}
          uploadedFileName={resumeFile?.name}
          onRemove={onRemove}
        />

        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={onBack} data-testid="button-back-step">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button onClick={onNext} data-testid="button-next-step">
            {resumeFile ? "Continue" : "Skip for now"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function StepFacultySelection({
  faculty,
  isLoading,
  selectedFaculty,
  onSelect,
  onNext,
  onBack,
}: {
  faculty: Faculty[];
  isLoading: boolean;
  selectedFaculty: Faculty | null;
  onSelect: (faculty: Faculty) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Faculty Member</CardTitle>
        <CardDescription>
          Choose the professor who will be recommending you
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-48 bg-muted animate-pulse rounded-md" />
            ))}
          </div>
        ) : faculty.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {faculty.map((f) => (
              <FacultyCard
                key={f.id}
                faculty={f}
                onSelect={onSelect}
                isSelected={selectedFaculty?.id === f.id}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No faculty members available</p>
          </div>
        )}

        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={onBack} data-testid="button-back-step">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button onClick={onNext} disabled={!selectedFaculty} data-testid="button-next-step">
            Review & Generate
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function StepReviewAndGenerate({
  studentName,
  selectedFaculty,
  generatedLOR,
  isGenerating,
  onGenerate,
  onDownload,
  isDownloading,
  onBack,
}: {
  studentName: string;
  selectedFaculty: Faculty | null;
  generatedLOR: string | null;
  isGenerating: boolean;
  onGenerate: () => void;
  onDownload: (format: "pdf" | "docx") => void;
  isDownloading: boolean;
  onBack: () => void;
}) {
  return (
    <div className="space-y-6">
      {!generatedLOR && (
        <Card>
          <CardHeader>
            <CardTitle>Review & Generate</CardTitle>
            <CardDescription>
              Review your selections and generate your Letter of Recommendation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Student Name</p>
              <p className="text-sm text-muted-foreground">{studentName}</p>
            </div>

            {selectedFaculty && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Selected Professor</p>
                <div className="flex items-center gap-3">
                  <div className="text-sm">
                    <p className="font-medium">{selectedFaculty.name}</p>
                    <p className="text-muted-foreground">{selectedFaculty.designation}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-6">
              <Button variant="outline" onClick={onBack} disabled={isGenerating} data-testid="button-back-step">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={onGenerate} disabled={isGenerating} data-testid="button-generate-lor">
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating LOR...
                  </>
                ) : (
                  <>
                    Generate LOR
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {(generatedLOR || isGenerating) && (
        <>
          <LORPreview
            lorContent={generatedLOR || undefined}
            facultyName={selectedFaculty?.name}
            facultyDesignation={selectedFaculty?.designation}
            facultyDepartment={selectedFaculty?.department}
            facultyEmail={selectedFaculty?.email}
            isGenerating={isGenerating}
          />

          {generatedLOR && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={() => onDownload("pdf")}
                    disabled={isDownloading}
                    className="flex-1"
                    data-testid="button-download-pdf"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                  <Button
                    onClick={() => onDownload("docx")}
                    disabled={isDownloading}
                    variant="outline"
                    className="flex-1"
                    data-testid="button-download-docx"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download DOCX
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
