import { GoogleGenAI, Type, Chat } from '@google/genai';
import type { SurveyResponses, StrategicReport } from '../types';
import { SURVEY_STEPS } from '../constants.tsx';

// This must be available as an environment variable.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const reportSchema = {
  type: Type.OBJECT,
  properties: {
    executiveSummary: { type: Type.STRING, description: "A high-level overview for a C-suite audience. It must synthesize the client's current situation, the core challenge/opportunity, and the key strategic recommendation. Should be concise, professional, and impactful." },
    readiness: {
      type: Type.OBJECT,
      description: "A detailed AI readiness assessment, including an overall score, a breakdown, and a maturity level classification.",
      properties: {
        overallScore: { type: Type.INTEGER, description: "The final, weighted AI readiness score from 1 to 100." },
        scoreBreakdown: {
          type: Type.OBJECT,
          description: "A breakdown of readiness scores (1-100) for specific areas.",
          properties: {
            strategy: { type: Type.INTEGER, description: "Score for clarity of goals and AI alignment." },
            data: { type: Type.INTEGER, description: "Score for data quality, infrastructure, and governance." },
            team: { type: Type.INTEGER, description: "Score for team skills, culture, and sponsorship." },
            process: { type: Type.INTEGER, description: "Score for process maturity and potential for AI optimization." }
          },
           required: ["strategy", "data", "team", "process"]
        },
        maturityLevel: {
            type: Type.STRING,
            description: "The client's AI Maturity Level, classified as one of: 'Nascent', 'Developing', 'Maturing', or 'Leading'."
        }
      },
      required: ["overallScore", "scoreBreakdown", "maturityLevel"]
    },
    swotAnalysis: {
      type: Type.OBJECT,
      description: "A comprehensive SWOT analysis (Strengths, Weaknesses, Opportunities, Threats) based on the client's input.",
      properties: {
        strengths: { type: Type.ARRAY, description: "Internal attributes that give the business an advantage. Provide 3-5 points.", items: { type: Type.STRING } },
        weaknesses: { type: Type.ARRAY, description: "Internal attributes that place the business at a disadvantage. Provide 3-5 points.", items: { type: Type.STRING } },
        opportunities: { type: Type.ARRAY, description: "External factors that the business could exploit to its advantage. Provide 3-5 points.", items: { type: Type.STRING } },
        threats: { type: Type.ARRAY, description: "External factors that could cause trouble for the business. Provide 3-5 points.", items: { type: Type.STRING } },
      },
      required: ["strengths", "weaknesses", "opportunities", "threats"]
    },
    recommendedInitiatives: {
      type: Type.ARRAY,
      description: "A list of 3 prioritized, actionable AI initiatives.",
      items: {
        type: Type.OBJECT,
        required: ["initiativeName", "initiativeType", "description", "potentialImpact", "effortLevel", "firstSteps", "justification", "linkedSwotItems", "kpisToTrack", "requiredResources", "timelineEstimate"],
        properties: {
          initiativeName: { type: Type.STRING, description: "A catchy, descriptive name for the project." },
          initiativeType: { type: Type.STRING, description: "Categorize as 'Quick Win', 'Foundational', or 'Transformational'."},
          description: { type: Type.STRING, description: "A detailed explanation of the project, what it does, and the value it creates." },
          potentialImpact: { type: Type.STRING, description: "Estimated business impact (High, Medium, or Low)." },
          effortLevel: { type: Type.STRING, description: "Estimated implementation effort (High, Medium, or Low)." },
          firstSteps: { type: Type.STRING, description: "The immediate, concrete first steps (1-3) to start this initiative." },
          justification: { type: Type.STRING, description: "A clear rationale explaining WHY this initiative is recommended, linking it to a business goal or SWOT item." },
          linkedSwotItems: {
              type: Type.ARRAY,
              description: "An array of 1-2 specific points from the SWOT analysis (verbatim text) that this initiative directly addresses.",
              items: { type: Type.STRING }
          },
          kpisToTrack: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List 2-3 specific, measurable KPIs to evaluate the success of this initiative."},
          requiredResources: { type: Type.STRING, description: "List the key people, teams, or technology needed (e.g., '2 Data Scientists, 1 Product Manager, access to AWS SageMaker')."},
          timelineEstimate: { type: Type.STRING, description: "A realistic time estimate for seeing initial value (e.g., '3-6 months')."}
        }
      }
    },
    implementationRoadmap: {
        type: Type.OBJECT,
        description: "A phased, strategic roadmap for implementing the recommended initiatives.",
        properties: {
            phase1_title: { type: Type.STRING, description: "Title for Phase 1 (e.g., 'Phase 1: Foundation & Quick Wins')." },
            phase1_initiatives: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Array of initiative names to be implemented in this phase."},
            phase1_duration: { type: Type.STRING, description: "Duration for this phase (e.g., 'Months 0-6')."},
            phase2_title: { type: Type.STRING, description: "Title for Phase 2 (e.g., 'Phase 2: Scaling & Capability Building')." },
            phase2_initiatives: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Array of initiative names to be implemented in this phase."},
            phase2_duration: { type: Type.STRING, description: "Duration for this phase (e.g., 'Months 6-12')."},
            phase3_title: { type: Type.STRING, description: "Title for Phase 3 (e.g., 'Phase 3: Transformation & Market Leadership')." },
            phase3_initiatives: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Array of initiative names to be implemented in this phase."},
            phase3_duration: { type: Type.STRING, description: "Duration for this phase (e.g., 'Months 12+')."}
        },
        required: ["phase1_title", "phase1_initiatives", "phase1_duration", "phase2_title", "phase2_initiatives", "phase2_duration", "phase3_title", "phase3_initiatives", "phase3_duration"]
    },
    riskAnalysis: {
      type: Type.OBJECT,
      description: "A brief analysis of potential risks associated with the AI strategy.",
      properties: {
        technicalRisks: { type: Type.STRING, description: "Potential technical hurdles (e.g., data integration, model accuracy)." },
        operationalRisks: { type: Type.STRING, description: "Risks related to team adoption, process changes, change management." },
        marketRisks: { type: Type.STRING, description: "External or competitive risks to consider (e.g., new regulations, competitor moves)." }
      },
       required: ["technicalRisks", "operationalRisks", "marketRisks"]
    },
    conclusion: { type: Type.STRING, description: "Concluding remarks that summarize the strategic imperative and call to action." }
  },
  required: ["executiveSummary", "readiness", "swotAnalysis", "recommendedInitiatives", "implementationRoadmap", "riskAnalysis", "conclusion"]
};


const buildPrompt = (responses: SurveyResponses): string => {
  let prompt = "Please analyze the following client business profile from a detailed questionnaire and generate a comprehensive AI Strategic Readiness Report. The client has provided granular answers to specific questions within broader categories.\n\n--- CLIENT DATA ---\n";
  
  SURVEY_STEPS.forEach(step => {
    prompt += `\n## Category: ${step.title}\n`;
    step.questions.forEach(question => {
        const response = responses[question.id] || "No answer provided.";
        prompt += `### ${question.text}\n${response}\n`;
    });
  });

  prompt += "\n--- END CLIENT DATA ---";
  return prompt;
};


export const generateStrategicReport = async (responses: SurveyResponses): Promise<StrategicReport> => {
  const prompt = buildPrompt(responses);
  const systemInstruction = `You are 'Strategos AI', an elite AI strategy consultant from AIWinLab, with a background from McKinsey, BCG, and Bain. Your purpose is to provide analysis that rivals or exceeds top-tier human consultants. You are an expert in business strategy, digital transformation, and practical AI implementation. Your analysis must be deep, insightful, data-driven, and supremely actionable.

Your Task:
Analyze the provided 'CLIENT DATA' and generate a 'Strategic AI Roadmap' in JSON format. Your response MUST strictly adhere to the provided JSON schema.

Your Analytical Process (Follow Rigorously):
1.  **Holistic Synthesis:** Do not treat each answer in isolation. Connect the dots across categories. For instance, link the 'strategic business goals' (from Strategy) with the 'data quality' (from Data) and 'team skills' (from Team) to identify critical enablers or blockers. The core of your value is in this synthesis.
2.  **AI Maturity Assessment:** Based on the client's answers, classify them into one of four AI Maturity Levels and calculate readiness scores.
    *   **Maturity Rubric:**
        *   **Nascent (Score 1-25):** Ad-hoc processes, poor data, no AI skills, unclear strategy.
        *   **Developing (Score 26-50):** Some data infrastructure, siloed experiments, growing awareness but limited skills.
        *   **Maturing (Score 51-75):** Centralized data, defined strategy, some successful AI projects, dedicated team members.
        *   **Leading (Score 76-100):** AI is core to strategy, robust data ecosystem, strong AI talent, C-level sponsorship, continuous innovation.
    *   **Score Calculation:** The 'overallScore' must be a weighted average of the breakdown scores. Be realistic and justify the scores implicitly through your analysis.
3.  **Rigorous SWOT Analysis:** Based on the client's full profile, identify their internal Strengths/Weaknesses and external Opportunities/Threats. Be specific and insightful. Avoid generic statements.
4.  **Formulate Prioritized, Justified Initiatives:** Recommend 3 strategic initiatives.
    *   **Prioritize & Categorize:** The initiatives must be a logical sequence. Start with a 'Quick Win' (High Impact, Low/Medium Effort) or a 'Foundational' project (e.g., data cleanup) if necessary. Then, propose more 'Transformational' initiatives.
    *   **Justify:** The 'justification' field is CRITICAL. Explicitly state WHY it's being recommended. Link it directly back to a stated business goal (e.g., 'to reduce customer churn by 15%') or a SWOT element.
    *   **Actionability:** 'First Steps' must be concrete actions. 'KPIs to Track' must be measurable. 'Required Resources' and 'Timeline' must be realistic.
    *   **Linkage:** Critically, you MUST populate the 'linkedSwotItems' array with the exact, verbatim text of the SWOT point(s) that the initiative addresses. This creates a direct, data-driven link between analysis and action.
5.  **Develop a Strategic Roadmap:** Arrange the 3 recommended initiatives into a logical, 3-phase implementation roadmap. Phase 1 should contain the first initiative(s) to build momentum. Subsequent phases build on the first.

Tone: Your tone is that of a highly experienced, professional, and trusted advisor. It is authoritative, credible, and direct, but also encouraging. You are a partner in their success. Address the client directly in your narrative sections.`;

  try {
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: reportSchema,
        temperature: 0.3,
        systemInstruction: systemInstruction,
      }
    });
    
    const jsonText = result.text;
    const reportData = JSON.parse(jsonText);

    return reportData as StrategicReport;

  } catch (error) {
    console.error("Error generating report with Gemini:", error);
    // Rethrow a more specific error to be caught by the UI
    throw new Error("The AI model failed to generate a report. This could be due to a network issue or invalid input. Please check your answers and try again.");
  }
};

const CHAT_SYSTEM_INSTRUCTION = `You are 'Strategos AI', an elite AI strategy consultant from AIWinLab, with a background from McKinsey, BCG, and Bain. You have already provided the client with a comprehensive 'Strategic AI Roadmap' based on their survey responses. Your current task is to answer follow-up questions about that specific report.

Your Guiding Principles:
1.  **Maintain Persona:** You are an experienced, professional, and trusted advisor. Your tone is authoritative, credible, and direct.
2.  **Context is King:** Your knowledge is strictly limited to the initial survey data and the strategic report you generated. Do NOT invent new information or initiatives. All your answers must be grounded in the existing report.
3.  **Clarify and Elaborate:** Your primary goal is to help the user understand the report more deeply. You can elaborate on the justification for an initiative, explain a SWOT point's relevance, or detail the reasoning behind the risk analysis.
4.  **Be Concise:** Provide direct answers to the user's questions. Avoid repeating large sections of the report verbatim unless asked. Use formatting like markdown lists if it improves clarity.
5.  **Refer to the Report:** When appropriate, refer to sections of the report, e.g., "As mentioned in the 'Recommended Initiatives' section..." or "The reasoning for this is tied to the 'Weakness' we identified in the SWOT analysis...".`;

export const createChat = (responses: SurveyResponses, report: StrategicReport): Chat => {
  const initialPrompt = buildPrompt(responses);
  const initialReport = JSON.stringify(report, null, 2);

  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: CHAT_SYSTEM_INSTRUCTION,
      temperature: 0.5,
    },
    history: [
      { role: 'user', parts: [{ text: initialPrompt }] },
      { role: 'model', parts: [{ text: initialReport }] }
    ]
  });

  return chat;
};
