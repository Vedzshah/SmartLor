import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: number;
  name: string;
  description: string;
}

interface ProgressStepperProps {
  steps: Step[];
  currentStep: number;
}

export function ProgressStepper({ steps, currentStep }: ProgressStepperProps) {
  return (
    <nav aria-label="Progress" className="w-full">
      <ol className="flex items-center justify-between gap-2">
        {steps.map((step, stepIdx) => (
          <li key={step.id} className={cn(
            "flex-1",
            stepIdx !== steps.length - 1 && "relative"
          )}>
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center w-full">
                <div className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-md border-2 transition-all",
                  step.id < currentStep && "border-primary bg-primary text-primary-foreground",
                  step.id === currentStep && "border-primary bg-background text-primary",
                  step.id > currentStep && "border-border bg-background text-muted-foreground"
                )} data-testid={`step-indicator-${step.id}`}>
                  {step.id < currentStep ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span className="text-sm font-semibold">{step.id}</span>
                  )}
                </div>
                
                {stepIdx !== steps.length - 1 && (
                  <div className={cn(
                    "flex-1 h-0.5 mx-2 transition-all",
                    step.id < currentStep ? "bg-primary" : "bg-border"
                  )} />
                )}
              </div>
              
              <div className="text-center">
                <p className={cn(
                  "text-xs font-medium transition-colors",
                  step.id === currentStep && "text-foreground",
                  step.id !== currentStep && "text-muted-foreground"
                )}>
                  {step.name}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}
