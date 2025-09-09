import React from 'react';
import type { SurveyStep } from './types';

// --- Icon Components for Survey Steps ---

const Briefcase = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
  </svg>
);

const Database = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
    </svg>
);

const Users = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
);

const Cog = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"></path>
        <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"></path>
        <path d="M12 2v2"></path><path d="M12 22v-2"></path>
        <path d="m17 20.66-1-1.73"></path><path d="m7 4.66 1 1.73"></path>
        <path d="m20.66 17-1.73-1"></path><path d="m4.66 7 1.73 1"></path>
        <path d="m22 12-2 0"></path><path d="m4 12 2 0"></path>
        <path d="m20.66 7-1.73 1"></path><path d="m4.66 17 1.73-1"></path>
        <path d="m17 3.34-1 1.73"></path><path d="m7 19.34 1-1.73"></path>
    </svg>
);

const Target = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10"></circle>
        <circle cx="12" cy="12" r="6"></circle>
        <circle cx="12" cy="12" r="2"></circle>
    </svg>
);


export const SURVEY_STEPS: SurveyStep[] = [
  {
    id: 'strategy',
    title: 'Business Objectives & Strategy',
    icon: Briefcase,
    questions: [
        {
            id: 'q_goals',
            text: 'What are your top 3 strategic business goals for the next 1-3 years?',
            placeholder: 'e.g., 1. Increase market share in the SMB sector by 20%. 2. Reduce customer churn by 15%. 3. Improve operational efficiency to achieve 10% cost savings in logistics.'
        },
        {
            id: 'q_kpis',
            text: 'How do you currently measure success for these goals? What are the key KPIs?',
            placeholder: 'e.g., For Goal 1: Net new customer acquisition rate. For Goal 2: Monthly Recurring Revenue (MRR) churn rate. For Goal 3: Cost per delivery, warehouse processing time.'
        },
        {
            id: 'q_challenges',
            text: 'What are the primary challenges or obstacles preventing you from achieving these goals today?',
            placeholder: 'e.g., Intense price competition, inability to personalize customer offers at scale, high manual overhead in our supply chain, legacy IT systems slowing down new product launches.'
        }
    ]
  },
  {
    id: 'data',
    title: 'Data & Technical Infrastructure',
    icon: Database,
    questions: [
        {
            id: 'q_datasources',
            text: 'What are your primary data sources and systems of record?',
            placeholder: 'List your key systems. e.g., CRM: Salesforce; ERP: SAP; Web Analytics: Google Analytics; Customer Support: Zendesk; Databases: PostgreSQL, MongoDB; Cloud: AWS (S3, Redshift).'
        },
        {
            id: 'q_dataquality',
            text: 'How would you assess the quality, accessibility, and completeness of your data?',
            placeholder: 'Be honest. e.g., "Our CRM data is fairly clean but siloed from our web data." or "Data is highly fragmented across departments in various spreadsheets, quality is inconsistent." or "We have a centralized data warehouse with well-defined data governance."'
        },
        {
            id: 'q_datagovernance',
            text: 'Is there a clear data governance policy or data ownership model in place?',
            placeholder: 'e.g., "No formal policy exists." or "Yes, our central BI team manages data definitions and access controls." or "Each department head is responsible for their own data."'
        }
    ]
  },
  {
    id: 'team',
    title: 'Team & Organizational Readiness',
    icon: Users,
    questions: [
        {
            id: 'q_teamskills',
            text: 'What technical and data-related skills exist within your team today?',
            placeholder: 'e.g., "We have several business analysts proficient in SQL and Tableau. Our engineering team is strong in Python and Java but has no direct ML experience. We have an IT team managing infrastructure."'
        },
        {
            id: 'q_culture',
            text: 'Describe your company’s culture regarding technology adoption and innovation.',
            placeholder: 'e.g., "Fast-moving and experimental, we encourage trying new tools." or "More conservative and risk-averse, new technology requires a strong business case and goes through lengthy approvals." or "There is excitement at the leadership level but resistance from frontline staff."'
        },
        {
            id: 'q_sponsorship',
            text: 'Who is the executive sponsor or key champion for this AI initiative? How involved are they?',
            placeholder: 'e.g., "Our CTO is the primary sponsor and is actively involved in weekly check-ins." or "The Head of Marketing is championing this, but we need to secure buy-in from the CFO."'
        }
    ]
  },
  {
    id: 'processes',
    title: 'Current Processes & Workflows',
    icon: Cog,
    questions: [
        {
            id: 'q_inefficiencies',
            text: 'Identify 2-3 critical business processes that are highly manual, repetitive, or inefficient.',
            placeholder: 'Be specific. e.g., "1. Onboarding a new client requires manually creating accounts in 5 different systems." "2. Our accounts payable team manually matches thousands of invoices to purchase orders each month." "3. Sales reps spend hours researching leads before making contact."'
        },
        {
            id: 'q_decisionmaking',
            text: 'How are key operational or strategic decisions made today? What data is used?',
            placeholder: 'e.g., "Mostly based on historical reports from our BI tool and the gut-feel of experienced managers." or "We run A/B tests for marketing campaigns, but strategic decisions are less data-driven."'
        },
        {
            id: 'q_tooling',
            text: 'What tools are currently used in these processes? Are they integrated?',
            placeholder: 'e.g., "The sales process relies on Salesforce, Outlook, and LinkedIn Sales Navigator. They are not deeply integrated, requiring a lot of copy-pasting."'
        }
    ]
  },
  {
    id: 'market',
    title: 'Market Landscape & Competition',
    icon: Target,
    questions: [
        {
            id: 'q_competitors',
            text: 'Who are your top 2-3 competitors, and how are they leveraging technology or AI?',
            placeholder: 'e.g., "Competitor A has a powerful recommendation engine on their website. Competitor B just announced an AI-powered chatbot for customer service. We haven\'t seen Competitor C do much with AI publicly."'
        },
        {
            id: 'q_trends',
            text: 'What major industry trends (technological, economic, or customer behavior) are impacting your business?',
            placeholder: 'e.g., "The shift to subscription models." "Increasing customer demand for 24/7 support." "Supply chain volatility." "The rise of generative AI in content creation."'
        },
        {
            id: 'q_differentiation',
            text: 'What is your unique value proposition? Where could AI create a sustainable competitive advantage for you?',
            placeholder: 'e.g., "We pride ourselves on superior customer service. AI could help us be even more proactive. Our unique advantage could be using our proprietary data to offer predictive insights that no competitor can match."'
        }
    ]
  },
];
