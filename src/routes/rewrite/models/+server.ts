import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { apiKey1 } from '../globals';

export const GET = (async () => {
	const response = await fetch('https://api.openai.com/v1/models', {
		headers: {
			Authorization: `Bearer ${apiKey1}`
		}
	});

	const models = await response.json();

	return json(models);
}) satisfies RequestHandler;
