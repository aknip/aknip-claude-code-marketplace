/**
 * Workflow Stepper Component
 * Wiederverwendbarer Stepper für mehrstufige Workflows
 */

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface WorkflowStep {
  id: string | number
  label: string
  description?: string
  status: 'completed' | 'current' | 'upcoming'
}

interface WorkflowStepperProps {
  steps: WorkflowStep[]
  currentStep: number
  onStepClick?: (stepId: string | number) => void
  orientation?: 'horizontal' | 'vertical'
  showDescriptions?: boolean
  variant?: 'default' | 'compact'
}

export function WorkflowStepper({
  steps,
  currentStep,
  onStepClick,
  orientation = 'horizontal',
  showDescriptions = false,
  variant = 'default',
}: WorkflowStepperProps) {
  const isHorizontal = orientation === 'horizontal'
  const isCompact = variant === 'compact'

  return (
    <div
      className={cn(
        'flex',
        isHorizontal ? 'flex-row items-center justify-between' : 'flex-col space-y-4'
      )}
    >
      {steps.map((step, index) => {
        const isCompleted = step.status === 'completed'
        const isCurrent = step.status === 'current'
        const isClickable = onStepClick && (isCompleted || isCurrent)
        const showConnector = index < steps.length - 1

        return (
          <div
            key={step.id}
            className={cn(
              'flex items-center',
              isHorizontal ? 'flex-1' : 'flex-row',
              !isHorizontal && 'w-full'
            )}
          >
            {/* Step Circle */}
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => isClickable && onStepClick?.(step.id)}
                disabled={!isClickable}
                className={cn(
                  'relative flex items-center justify-center rounded-full transition-all',
                  isCompact ? 'h-8 w-8' : 'h-10 w-10',
                  isCompleted && 'bg-primary text-primary-foreground',
                  isCurrent && 'border-2 border-primary bg-background text-primary',
                  !isCompleted && !isCurrent && 'border-2 border-muted bg-muted text-muted-foreground',
                  isClickable && 'cursor-pointer hover:scale-105',
                  !isClickable && 'cursor-not-allowed'
                )}
              >
                {isCompleted ? (
                  <Check className={cn('stroke-[3]', isCompact ? 'h-4 w-4' : 'h-5 w-5')} />
                ) : (
                  <span className={cn('font-semibold', isCompact ? 'text-sm' : 'text-base')}>
                    {index + 1}
                  </span>
                )}
              </button>

              {/* Step Label */}
              {!isCompact && (
                <div className={cn('ml-3', isHorizontal ? 'hidden sm:block' : '')}>
                  <p
                    className={cn(
                      'text-sm font-medium',
                      isCurrent && 'text-foreground',
                      isCompleted && 'text-foreground',
                      !isCompleted && !isCurrent && 'text-muted-foreground'
                    )}
                  >
                    {step.label}
                  </p>
                  {showDescriptions && step.description && (
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                  )}
                </div>
              )}
            </div>

            {/* Connector Line */}
            {showConnector && (
              <div
                className={cn(
                  'flex-1',
                  isHorizontal
                    ? 'mx-2 h-0.5 sm:mx-4'
                    : 'ml-4 h-8 w-0.5',
                  isCompleted ? 'bg-primary' : 'bg-muted'
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// Compact Dots Indicator (Alternative für kleine Bereiche)
interface WorkflowDotsProps {
  totalSteps: number
  currentStep: number
  completedSteps: number[]
  onDotClick?: (step: number) => void
}

export function WorkflowDots({
  totalSteps,
  currentStep,
  completedSteps,
  onDotClick,
}: WorkflowDotsProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: totalSteps }, (_, i) => {
        const stepNumber = i + 1
        const isCompleted = completedSteps.includes(stepNumber)
        const isCurrent = stepNumber === currentStep
        const isClickable = onDotClick && (isCompleted || isCurrent)

        return (
          <button
            key={stepNumber}
            type="button"
            onClick={() => isClickable && onDotClick?.(stepNumber)}
            disabled={!isClickable}
            className={cn(
              'h-2 rounded-full transition-all',
              isCurrent && 'w-8 bg-primary',
              isCompleted && !isCurrent && 'w-2 bg-primary',
              !isCompleted && !isCurrent && 'w-2 bg-muted',
              isClickable && 'cursor-pointer hover:scale-125',
              !isClickable && 'cursor-not-allowed'
            )}
            aria-label={`Schritt ${stepNumber}`}
          />
        )
      })}
    </div>
  )
}
