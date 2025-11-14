import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold">LOR Generator</h1>
          </div>
          
          <nav className="flex items-center gap-4">
            <Link href="/faculty">
              <Button variant="ghost" data-testid="link-faculty-directory">
                <Users className="h-4 w-4 mr-2" />
                Faculty Directory
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 md:py-20">
        <section className="max-w-4xl mx-auto text-center space-y-6 mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary/10 text-primary text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            AI-Powered Letter Generation
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Generate Professional Academic
            <br />
            <span className="text-primary">Letters of Recommendation</span>
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transform your achievements into compelling, authentic professor-written recommendations 
            in minutes. Powered by advanced AI technology.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/create">
              <Button size="lg" className="gap-2" data-testid="button-create-lor">
                Create New LOR
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            
            <Link href="/faculty">
              <Button size="lg" variant="outline" data-testid="button-view-faculty">
                View Faculty Directory
              </Button>
            </Link>
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
          <Card className="hover-elevate">
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 mb-4">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Multi-Step Wizard</CardTitle>
              <CardDescription>
                Easy-to-follow questionnaire that captures all necessary details about your academic journey
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover-elevate">
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 mb-4">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">AI-Powered Generation</CardTitle>
              <CardDescription>
                Advanced AI transforms your inputs into authentic, professor-voice recommendations
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover-elevate">
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Faculty Directory</CardTitle>
              <CardDescription>
                Select from verified faculty profiles to personalize your recommendation letter
              </CardDescription>
            </CardHeader>
          </Card>
        </section>

        <section className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">How It Works</CardTitle>
              <CardDescription>
                Generate your professional LOR in four simple steps
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                {
                  step: "1",
                  title: "Answer Questionnaire",
                  description: "Provide details about your relationship with the professor, achievements, and goals"
                },
                {
                  step: "2",
                  title: "Upload Resume",
                  description: "Our AI extracts relevant academic details, projects, and accomplishments"
                },
                {
                  step: "3",
                  title: "Select Faculty",
                  description: "Choose the professor who will be recommending you from our directory"
                },
                {
                  step: "4",
                  title: "Generate & Download",
                  description: "Get your professionally formatted LOR in PDF or DOCX format"
                }
              ].map((item) => (
                <div key={item.step} className="flex gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md border-2 border-primary bg-background text-primary font-semibold">
                    {item.step}
                  </div>
                  <div className="space-y-1 pt-1">
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="border-t mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <span className="font-semibold">LOR Generator</span>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Professional academic recommendation letters powered by AI
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
