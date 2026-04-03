import type { RecoveryMessage } from './core/index.ts';
import { addRule, addFact, addEpisode } from '../config/memory-store.ts';
import { buildConversationSummaryTranscript } from './conversation-summary.ts';

export async function extractAndStoreMemory(
  sessionId: string,
  messages: RecoveryMessage[],
  runCompletion: (prompt: string) => Promise<string | null>
): Promise<void> {
  if (messages.length === 0) return;

  const transcript = buildConversationSummaryTranscript(messages, {
    maxMessageChars: 1000,
    maxTranscriptChars: 20000
  });

  if (!transcript) return;

  const prompt = `Analyze the following conversation transcript.
Extract three types of information to update the user's long-term memory:
1. "rules": Technical preferences, coding styles, formatting habits, or system requirements explicitly requested or implicitly agreed upon. (e.g. "Always use TypeScript", "Prefer functional components"). Keep them concise.
2. "facts": Important facts about the user, their environment, their projects, or personal details (e.g. "User's name is Jaysen", "Working on a React Native app", "Using macOS").
3. "episodeSummary": A brief 1-2 sentence summary of what was accomplished in this session.

Return the result STRICTLY as a JSON object with this exact structure, and no other text or markdown formatting:
{
  "rules": ["rule 1", "rule 2"],
  "facts": ["fact 1", "fact 2"],
  "episodeSummary": "summary here"
}

Transcript:
${transcript}
`;

  try {
    const result = await runCompletion(prompt);
    if (!result) return;

    // Clean up markdown code blocks if any
    const cleanResult = result.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '').trim();
    const parsed = JSON.parse(cleanResult);

    if (parsed.episodeSummary && typeof parsed.episodeSummary === 'string') {
      addEpisode(sessionId, parsed.episodeSummary);
    }

    if (Array.isArray(parsed.rules)) {
      parsed.rules.forEach((rule: string) => {
        if (typeof rule === 'string' && rule.trim().length > 0) {
          addRule(rule.trim());
        }
      });
    }

    if (Array.isArray(parsed.facts)) {
      parsed.facts.forEach((fact: string) => {
        if (typeof fact === 'string' && fact.trim().length > 0) {
          addFact(fact.trim());
        }
      });
    }

  } catch (error) {
    console.error('[Memory Extraction] Failed to extract memory:', error);
  }
}
