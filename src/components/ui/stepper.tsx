"use client";

import * as React from "react";
import { Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepperProps {
  steps: {
    id: string;
    title: string;
    description?: string;
    icon?: React.ReactNode;
  }[];
  currentStep: string;
  completedSteps: Set<string>;
  onStepClick?: (stepId: string) => void;
  className?: string;
}

export function Stepper({
  steps,
  currentStep,
  completedSteps,
  onStepClick,
  className,
}: StepperProps) {
  const currentIndex = steps.findIndex((step) => step.id === currentStep);

  return (
    <nav className={cn("w-full", className)}>
      <ol className="flex items-center justify-between w-full">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.has(step.id);
          const isCurrent = step.id === currentStep;
          const isClickable =
            onStepClick && (isCompleted || index <= currentIndex);

          return (
            <li key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <button
                  type="button"
                  onClick={() => isClickable && onStepClick?.(step.id)}
                  disabled={!isClickable}
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200",
                    {
                      "bg-primary border-primary text-primary-foreground":
                        isCompleted,
                      "border-primary bg-primary/10 text-primary":
                        isCurrent && !isCompleted,
                      "border-muted-foreground/30 bg-muted text-muted-foreground":
                        !isCurrent && !isCompleted,
                      "cursor-pointer hover:border-primary/60": isClickable,
                      "cursor-not-allowed": !isClickable,
                    }
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    step.icon || (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )
                  )}
                </button>

                <div className="mt-2 text-center">
                  <div
                    className={cn("text-sm font-medium", {
                      "text-primary": isCurrent || isCompleted,
                      "text-muted-foreground": !isCurrent && !isCompleted,
                    })}
                  >
                    {step.title}
                  </div>
                  {step.description && (
                    <div className="text-xs text-muted-foreground mt-1 hidden sm:block">
                      {step.description}
                    </div>
                  )}
                </div>
              </div>

              {index < steps.length - 1 && (
                <ChevronRight
                  className={cn("w-4 h-4 mx-2 flex-shrink-0", {
                    "text-primary": isCompleted,
                    "text-muted-foreground/30": !isCompleted,
                  })}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
