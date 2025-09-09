import type { ReactNode } from 'react';

// New structure for granular questions within each step
export interface SurveyQuestion {
  id: string;
  text: string;
  placeholder: string;
}

export interface SurveyStep {
  id: string;
  title: string;
  icon: (props: { className?: string }) => ReactNode;
  questions: SurveyQuestion[];
}

export type SurveyResponses = {
  [key: string]: string; // key will be question.id
};

// New ChatMessage type for the interactive chat feature
export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

// Enhanced Initiative with more consulting-style details
export interface RecommendedInitiative {
  initiativeName: string;
  initiativeType: 'Quick Win' | 'Foundational' | 'Transformational';
  description: string;
  potentialImpact: 'High' | 'Medium' | 'Low';
  effortLevel: 'High' | 'Medium' | 'Low';
  firstSteps: string;
  justification: string;
  linkedSwotItems?: string[];
  kpisToTrack: string[];
  requiredResources: string;
  timelineEstimate: string;
}

export interface RiskAnalysis {
  technicalRisks: string;
  operationalRisks: string;
  marketRisks: string;
}

export interface SWOTAnalysis {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

// Added Maturity Level
export interface ReadinessAssessment {
  overallScore: number;
  scoreBreakdown: {
    data: number;
    team: number;
    strategy: number;
    process: number;
  };
  maturityLevel: 'Nascent' | 'Developing' | 'Maturing' | 'Leading';
}

// Added Roadmap
export interface ImplementationRoadmap {
    phase1_title: string;
    phase1_initiatives: string[]; // Names of initiatives in this phase
    phase1_duration:string;
    phase2_title: string;
    phase2_initiatives: string[];
    phase2_duration: string;
    phase3_title: string;
    phase3_initiatives: string[];
    phase3_duration: string;
}

export interface StrategicReport {
  executiveSummary: string;
  readiness: ReadinessAssessment;
  swotAnalysis: SWOTAnalysis;
  recommendedInitiatives: RecommendedInitiative[];
  implementationRoadmap: ImplementationRoadmap;
  riskAnalysis: RiskAnalysis;
  conclusion: string;
}
