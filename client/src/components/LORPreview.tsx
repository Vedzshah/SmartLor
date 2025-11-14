import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

interface LORPreviewProps {
  lorContent?: string;
  facultyName?: string;
  facultyDesignation?: string;
  facultyDepartment?: string;
  facultyEmail?: string;
  isGenerating?: boolean;
}

export function LORPreview({
  lorContent,
  facultyName,
  facultyDesignation,
  facultyDepartment,
  facultyEmail,
  isGenerating
}: LORPreviewProps) {
  if (isGenerating) {
    return (
      <Card className="p-8 space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Separator />
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </Card>
    );
  }

  if (!lorContent) {
    return (
      <Card className="p-8">
        <div className="text-center space-y-2 py-12">
          <p className="text-sm text-muted-foreground">
            Your generated Letter of Recommendation will appear here
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-8 md:p-12 bg-card" data-testid="lor-preview">
      <div className="max-w-3xl mx-auto space-y-8 font-serif">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-center">K J Somaiya College of Engineering</h1>
          <p className="text-sm text-center text-muted-foreground">
            (Autonomous college affiliated to the University of Mumbai)
          </p>
        </div>

        <Separator />

        <div className="text-center">
          <h2 className="text-xl font-semibold">LETTER OF RECOMMENDATION</h2>
        </div>

        <div className="space-y-6 text-base leading-relaxed whitespace-pre-wrap">
          {lorContent}
        </div>

        <Separator />

        <div className="space-y-1">
          <p className="font-semibold">{facultyName}</p>
          <p className="text-sm text-muted-foreground">{facultyDesignation}</p>
          <p className="text-sm text-muted-foreground">{facultyDepartment}</p>
          <p className="text-sm text-muted-foreground">K.J. Somaiya College of Engineering</p>
          <p className="text-sm text-muted-foreground">{facultyEmail}</p>
        </div>
      </div>
    </Card>
  );
}
