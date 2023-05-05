import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { apiKey1 } from './globals';

const prePromptMap: Record<string, string> = {
	addCitations: `You are a college tutor in an academic setting.

Provide a list of improvements that add cited quotations from published sources in APA format.

Use this JSON template:

{
"improvements": [
{
"original_text": "",
"edited_text_with_cited_quotation": "",
"works_cited_in_apa_format": ""
}
]
}`,
	rewrite: `You are a college tutor in an academic setting.

Provide a list of improvements in one of these categories: Grammar, Word Choice, Meaning, Clarity, Spelling. Ask clarification questions. Fix spelling to be {CULTURE}.

Use this JSON template:

{
  "improvements": [
    {
      "category": "",
      "description": "",
      "clarification_questions": [],
      "original_text": "",
      "improved_text": ""
    }
  ]
}`
};

export const POST = (async ({ url, request }) => {
	const { mode, culture, model, originalValue } = (await request.json()) as {
		mode: { key: string; value: string };
		culture: { value: string; internalValue: string };
		model: string;
		originalValue: string;
	};

	try {
		const response = await fetch('https://api.openai.com/v1/chat/completions', {
			method: 'POST',
			body: JSON.stringify({
				model: model,
				messages: [
					{
						role: 'system',
						content: prePromptMap[mode.key].replaceAll('{CULTURE}', culture.internalValue)
					},
					{
						role: 'user',
						content: originalValue
					}
				],
				temperature: 0,
				max_tokens: 2048,
				top_p: 1,
				frequency_penalty: 0.5,
				presence_penalty: 0.3
			}),
			headers: {
				Authorization: `Bearer ${apiKey1}`,
				'content-type': 'application/json'
			}
		});

		const completions = await response.json();

		return json({
			completions
		});
	} catch (error: any) {
		return json({
			error: error.message
		});
	}
}) satisfies RequestHandler;
