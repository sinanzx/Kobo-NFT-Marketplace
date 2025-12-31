import React from 'react';
import { motion } from 'framer-motion';
import { Check, Circle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

interface OnboardingProgressProps {
  steps: OnboardingStep[];
  currentStepIndex: number;
  onStepClick?: (stepIndex: number) => void;
}

export const OnboardingProgress: React.FC<OnboardingProgressProps> = ({
  steps,
  currentStepIndex,
  onStepClick,
}) => {
  const completedSteps = steps.filter((step) => step.completed).length;
  const progressPercentage = (completedSteps / steps.length) * 100;

  return (
    <Card className="p-6 border-border/50">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Getting Started</h3>
          <p className="text-sm text-muted-foreground">
            Complete these steps to unlock the full potential of KoboNFT
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">
              {completedSteps} of {steps.length} completed
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        <div className="space-y-3 mt-6">
          {steps.map((step, index) => {
            const isActive = index === currentStepIndex;
            const isCompleted = step.completed;
            const isClickable = onStepClick && (isCompleted || isActive);

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary/10 border border-primary/30'
                    : isCompleted
                    ? 'bg-muted/50'
                    : 'bg-background'
                } ${isClickable ? 'cursor-pointer hover:bg-accent' : ''}`}
                onClick={() => isClickable && onStepClick(index)}
                role={isClickable ? 'button' : undefined}
                tabIndex={isClickable ? 0 : undefined}
                onKeyDown={(e) => {
                  if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    onStepClick(index);
                  }
                }}
                aria-label={`${step.title}: ${
                  isCompleted ? 'Completed' : isActive ? 'Current step' : 'Not started'
                }`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {isCompleted ? (
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary-foreground" aria-hidden="true" />
                    </div>
                  ) : (
                    <Circle
                      className={`w-5 h-5 ${
                        isActive ? 'text-primary fill-primary/20' : 'text-muted-foreground'
                      }`}
                      aria-hidden="true"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4
                    className={`text-sm font-medium ${
                      isActive ? 'text-foreground' : isCompleted ? 'text-foreground/80' : 'text-muted-foreground'
                    }`}
                  >
                    {step.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};
