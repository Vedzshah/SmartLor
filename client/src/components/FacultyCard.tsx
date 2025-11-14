import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, GraduationCap } from "lucide-react";
import type { Faculty } from "@shared/schema";

interface FacultyCardProps {
  faculty: Faculty;
  onSelect?: (faculty: Faculty) => void;
  isSelected?: boolean;
}

export function FacultyCard({ faculty, onSelect, isSelected }: FacultyCardProps) {
  const initials = faculty.name
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className={cn(
      "transition-all hover-elevate",
      isSelected && "border-primary"
    )} data-testid={`faculty-card-${faculty.id}`}>
      <CardHeader className="gap-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={faculty.profileImage || undefined} alt={faculty.name} />
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg">{faculty.name}</CardTitle>
            <CardDescription className="text-sm mt-1">
              {faculty.designation}
            </CardDescription>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
              <GraduationCap className="h-3.5 w-3.5" />
              <span>{faculty.department}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Mail className="h-3.5 w-3.5" />
          <span className="truncate">{faculty.email}</span>
        </div>
        
        {faculty.coursesTaught && faculty.coursesTaught.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Courses Taught</p>
            <div className="flex flex-wrap gap-1.5">
              {faculty.coursesTaught.slice(0, 3).map((course, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {course}
                </Badge>
              ))}
              {faculty.coursesTaught.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{faculty.coursesTaught.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}
        
        {onSelect && (
          <Button
            onClick={() => onSelect(faculty)}
            variant={isSelected ? "default" : "outline"}
            className="w-full"
            data-testid={`button-select-faculty-${faculty.id}`}
          >
            {isSelected ? "Selected" : "Select Professor"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
