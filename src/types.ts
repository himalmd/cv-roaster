export type RoastMode = 'friendly' | 'recruiter' | 'brutal'

export type RecruiterPersona =
  | 'friendly_recruiter'
  | 'senior_hr'
  | 'startup_founder'
  | 'corporate_hiring'
  | 'tech_lead'

export interface BeforeAfter {
  before: string
  after: string
}

export interface AtsBreakdown {
  keywordOptimization: number
  formattingCompatibility: number
  sectionCompleteness: number
}

export interface MissingKeyword {
  keyword: string
  reason: string
}

export interface RoastResult {
  roastScore: number
  atsScore: number
  roastLevel: string
  roastSummary: string
  recruiterReaction: string
  strengths: string[]
  weaknesses: string[]
  missingKeywords: MissingKeyword[]
  funnyObservations: string[]
  beforeAfterExamples: BeforeAfter[]
  suggestions: string[]
  finalVerdict: string
  atsBreakdown: AtsBreakdown
}
