
import {
    Project,
    Risk,
    User,
    Department,
    Competency,
    Standard,
} from '../types';

class AIService {
    async suggestActionPlan(description: string): Promise<string> {
        console.log('AI: Suggesting action plan for:', description);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return `Based on "${description}", a suggested action is to review related documentation and consult with the process owner.`;
    }

    async suggestRootCause(
        description: string,
        notes: string
    ): Promise<string> {
        console.log(
            'AI: Suggesting root cause for:',
            description,
            'with notes:',
            notes
        );
        await new Promise(resolve => setTimeout(resolve, 1200));
        return `Potential root cause for "${description}": Lack of clear instructions or inadequate training. Notes: ${notes}`;
    }

    async generatePolicyFromStandard(
        standard: Standard,
        language: 'en' | 'ar'
    ): Promise<string> {
        console.log(
            `AI: Generating policy for standard ${standard.standardId} in ${language}`
        );
        await new Promise(resolve => setTimeout(resolve, 1500));
        return `Policy for ${standard.description} (${language}): All personnel must adhere to the established procedures...`;
    }

    async improveWriting(text: string, language: 'en' | 'ar'): Promise<string> {
        console.log(`AI: Improving writing for text in ${language}:`, text);
        await new Promise(resolve => setTimeout(resolve, 800));
        return `Improved text (${language}): ${text.replace(
            /\b(is|are|am)\b/g,
            'is/are'
        )} (clarified).`;
    }

    async translateText(text: string, language: 'en' | 'ar'): Promise<string> {
        console.log(`AI: Translating text to ${language}:`, text);
        await new Promise(resolve => setTimeout(resolve, 900));
        return `Translated to ${language}: ${text}`;
    }

    async generateQualityBriefing(
        projects: Project[],
        risks: Risk[],
        users: User[],
        departments: Department[],
        competencies: Competency[]
    ): Promise<string> {
        console.log('AI: Generating comprehensive quality briefing...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        return `
      ## AI-Generated Quality & Compliance Briefing

      **Executive Summary:**
      - **Overall Project Health:** Mixed. ${projects.filter(p => p.status === 'At Risk').length
            } projects are at risk.
      - **Top Systemic Risk:** ${risks.sort((a, b) => b.impact * b.likelihood - a.impact * a.likelihood)[0]
                ?.description.en
            }.
      - **Key Competency Gap:** The most needed competency is "${competencies[0]?.name.en
            }".

      **Actionable Insights:**
      1.  **High-Risk Projects:** Prioritize intervention for projects: ${projects
                .filter(p => p.status === 'At Risk')
                .map(p => p.name)
                .join(', ')}.
      2.  **Risk Mitigation:** Form a task force to address the top systemic risk.
      3.  **Targeted Training:** Launch a training initiative for the key competency gap.
    `;
    }
}

export const aiService = new AIService();