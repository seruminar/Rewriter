import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { apiKey1 } from './globals';

const prePromptMap: { [key: string]: string } = {
	addCitations_1: `You are a college tutor in an academic setting.

Provide a list of review comments that add citations in APA format.

Use this JSON template:

{
"comments": [
{
"original_text": "",
"text_with_citation": "",
"apa_format": ""
}
]
}`,
	addCitations: `You are a college tutor in an academic setting.

Provide a list of review comments that add cited quotations from published sources in APA format.

Use this JSON template:

{
"comments": [
{
"original_text": "",
"edited_text_with_cited_quotation": "",
"works_cited_in_apa_format": ""
}
]
}`,
	rewrite: `You are a college tutor in an academic setting.

Provide a list of review comments focusing on grammar, tone, word choice, or meaning. For each suggestion, say category, improvement, clarification questions, suggested sentences. 

Use this JSON template:

{
  "comments": [
    {
      "category": "",
      "original_text": "",
      "improvement": null,
      "questions": [],
      "suggested_sentences": []
    }
  ]
}`
};

export const POST = (async ({ url, request }) => {
	const { mode, model, originalValue } = (await request.json()) as {
		mode: string;
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
						content: prePromptMap[mode]
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
