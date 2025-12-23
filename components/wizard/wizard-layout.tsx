'use client'

import React from 'react'
import { useWizardStore, WizardStep } from '@/lib/store'
import { StepProjectInfo } from './step-project-info'
import { StepRawRequirements } from './step-raw-requirements'
import { StepVisuals } from './step-visuals'
import { StepTechContext } from './step-tech-context'
import { StepGeneration } from './step-generation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export function WizardLayout() {
  const { currentStep, steps, nextStep, prevStep } = useWizardStore()

  const renderStep = () => {
    switch (steps[currentStep]) {
      case 'project-info': return <StepProjectInfo />
      case 'raw-requirements': return <StepRawRequirements />
      case 'visuals': return <StepVisuals />
      case 'tech-context': return <StepTechContext />
      case 'generation': return <StepGeneration />
      default: return null
    }
  }

  const stepsLabels: Record<WizardStep, string> = {
    'project-info': '初始化',
    'raw-requirements': '原始需求',
    'visuals': '视觉交互',
    'tech-context': '技术背景',
    'generation': '生成'
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Sidebar / Stepper */}
      <aside className="w-full md:w-64 border-r bg-muted/10 p-6 flex flex-col gap-8">
        <div className="flex items-center gap-2 font-bold text-xl px-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
            D
          </div>
          DeepPRD
        </div>

        <nav className="space-y-1">
          {steps.map((step, index) => {
            const isActive = index === currentStep
            const isCompleted = index < currentStep
            return (
              <div
                key={step}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium",
                  isActive ? "bg-primary/10 text-primary" : "text-muted-foreground",
                  isCompleted && "text-foreground"
                )}
              >
                <div className={cn(
                  "h-6 w-6 rounded-full border flex items-center justify-center text-xs transition-colors",
                  isActive ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30",
                  isCompleted && "bg-muted text-foreground border-transparent"
                )}>
                  {index + 1}
                </div>
                {stepsLabels[step]}
              </div>
            )
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <div className="flex-1 p-8 overflow-y-auto">
          {renderStep()}
        </div>

        {/* Footer Navigation */}
        <div className="border-t p-6 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" /> 上一步
            </Button>

            {steps[currentStep] !== 'generation' && (
              <Button onClick={nextStep} className="gap-2">
                下一步 <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}








