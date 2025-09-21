import { GoogleGenAI, Type } from '@google/genai';
import { Standard, Language, AIQualityBriefing, Project, Risk, User, Department, Competency } from '@/types';

const API_KEY = process.env.API_KEY;

class AIService {
    private _ai: GoogleGenAI | null = null;

    constructor() {
        if (API_KEY) {
            this._ai = new GoogleGenAI({ apiKey: API_KEY });
        } else {
            console.warn("API_KEY environment variable not set. AI features will be disabled.");
        }
    }

    async suggestActionPlan(standardDescription: string): Promise<string> {
        if (!this._ai) throw new Error("AI Service not initialized.");
        const prompt = `Based on the following non-compliant healthcare accreditation standard, suggest a concise, professional, and actionable plan with 3-4 numbered steps to achieve compliance. Standard: "${standardDescription}"`;
        const response = await this._ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        return response.text;
    }

    async suggestRootCause(standardDescription: string, notes: string): Promise<string> {
        if (!this._ai) throw new Error("AI Service not initialized.");
        const prompt = `A healthcare accreditation standard was found to be non-compliant. Analyze the standard and the auditor's notes to suggest potential root causes. Provide a structured response with 2-3 likely root causes, categorized if possible (e.g., Process Failure, Human Error, Training Gap, System Issue).
        
        Standard: "${standardDescription}"
        Auditor's Notes: "${notes}"
        
        Provide your analysis below:`;
        const response = await this._ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        return response.text;
    }

    async generatePolicyFromStandard(standard: Standard, lang: Language): Promise<string> {
        if (!this._ai) throw new Error("AI Service not initialized.");
        const prompt = `Generate a formal, well-structured policy document based on this healthcare accreditation standard. Include sections for Purpose, Scope, Policy, and Procedure. Standard ID: ${standard.standardId}. Description: "${standard.description}". Respond in ${lang === 'en' ? 'English' : 'Arabic'}.`;
        const response = await this._ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        return response.text;
    }

    async improveWriting(text: string, lang: Language): Promise<string> {
        if (!this._ai) throw new Error("AI Service not initialized.");
        const prompt = `Improve the following text for clarity, conciseness, and professionalism, suitable for a formal healthcare policy document. Text: "${text}". Respond in ${lang === 'en' ? 'English' : 'Arabic'}.`;
        const response = await this._ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        return response.text;
    }

    async translateText(text: string, targetLang: Language): Promise<string> {
        if (!this._ai) throw new Error("AI Service not initialized.");
        const prompt = `Translate the following text to ${targetLang === 'en' ? 'English' : 'Arabic'}. Text: "${text}"`;
        const response = await this._ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        return response.text;
    }
    
    async generateQualityBriefing(
      projects: Project[],
      risks: Risk[],
      users: User[],
      departments: Department[],
      competencies: Competency[]
    ): Promise<AIQualityBriefing> {
        if (!this._ai) {
          throw new Error("AI Service not initialized.");
        }
    
        const totalProjects = projects.length;
        const avgCompliance = projects.length > 0 ? projects.reduce((acc, p) => acc + p.progress, 0) / projects.length : 0;
        const openCapas = projects.flatMap(p => p.capaReports).filter(c => c.status === 'Open').length;
        const closedCapas = projects.flatMap(p => p.capaReports).filter(c => c.status === 'Closed').length;
        const highRisks = risks.filter(r => r.likelihood * r.impact >= 15 && r.status === 'Open').length;
        
        const rootCauseCounts = [...projects.flatMap(p => p.capaReports), ...risks]
          .reduce((acc, issue) => {
            if (issue.rootCauseCategory) {
              acc[issue.rootCauseCategory] = (acc[issue.rootCauseCategory] || 0) + 1;
            }
            return acc;
          }, {} as Record<string, number>);
        
        const competencyGaps = departments
          .filter(d => d.requiredCompetencyIds?.length)
          .flatMap(dept => {
            const usersInDept = users.filter(u => u.departmentId === dept.id);
            if (usersInDept.length === 0) return [];
            return dept.requiredCompetencyIds!.map(reqCompId => {
              const usersWithCompetency = usersInDept.filter(u => u.competencies?.some(c => c.competencyId === reqCompId)).length;
              const gap = usersInDept.length - usersWithCompetency;
              return { department: dept.name.en, gap };
            });
          }).filter(g => g.gap > 0);
    
        const dataSummary = `
          - Total Projects: ${totalProjects}
          - Average Project Compliance: ${avgCompliance.toFixed(1)}%
          - Open CAPAs: ${openCapas}
          - Closed CAPAs: ${closedCapas}
          - High-Priority Open Risks: ${highRisks}
          - Root Cause Frequencies: ${JSON.stringify(rootCauseCounts)}
          - Competency Gaps: ${JSON.stringify(competencyGaps.slice(0, 3))}
        `;
    
        const schema: any = {
          type: Type.OBJECT,
          properties: {
            strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of 2-3 key strengths based on the data." },
            concerns: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of 2-3 primary areas of concern or potential risks." },
            recommendations: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, details: { type: Type.STRING } }, propertyOrdering: ["title", "details"] }, description: "List of 3 concrete, actionable recommendations to improve quality and compliance." }
          },
          propertyOrdering: ["strengths", "concerns", "recommendations"],
        };
    
        const prompt = `
          As a world-class healthcare quality management consultant, analyze the following summary of an organization's data.
          Provide a high-level executive briefing in JSON format.
          Focus on identifying patterns, highlighting significant risks, and offering actionable advice.
          Be concise and professional.
    
          Data Summary:
          ${dataSummary}
        `;
    
        const response = await this._ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { responseMimeType: "application/json", responseSchema: schema } });
        try {
          return JSON.parse(response.text.trim()) as AIQualityBriefing;
        } catch (e) {
          console.error("Failed to parse AI JSON response:", e, "Raw response:", response.text);
          throw new Error("Failed to get a valid briefing from the AI service.");
        }
      }
}

export const aiService = new AIService();
