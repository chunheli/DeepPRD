import { create } from 'zustand'

export type WizardStep = 'project-info' | 'raw-requirements' | 'visuals' | 'tech-context' | 'generation'

export interface ProjectData {
  theme: string
  rawRequirements: File[]
  visuals: File[]
  techContext: File[]
}

interface WizardState {
  currentStep: number
  steps: WizardStep[]
  projectData: ProjectData
  nextStep: () => void
  prevStep: () => void
  goToStep: (step: number) => void
  updateProjectData: (data: Partial<ProjectData>) => void
  resetWizard: () => void
}

const initialProjectData: ProjectData = {
  theme: '',
  rawRequirements: [],
  visuals: [],
  techContext: [],
}

export const useWizardStore = create<WizardState>((set) => ({
  currentStep: 0,
  steps: ['project-info', 'raw-requirements', 'visuals', 'tech-context', 'generation'],
  projectData: initialProjectData,

  nextStep: () => set((state) => ({
    currentStep: Math.min(state.currentStep + 1, state.steps.length - 1)
  })),

  prevStep: () => set((state) => ({
    currentStep: Math.max(state.currentStep - 1, 0)
  })),

  goToStep: (step: number) => set((state) => ({
    currentStep: Math.max(0, Math.min(step, state.steps.length - 1))
  })),

  updateProjectData: (data: Partial<ProjectData>) => set((state) => ({
    projectData: { ...state.projectData, ...data }
  })),

  resetWizard: () => set({
    currentStep: 0,
    projectData: initialProjectData,
  }),
}))
