export const load = async ({ fetch }) => {
	const response = await fetch('/rewrite/models');

	const models = await response.json();

	const fakeData = {
		comments: [
			{
				category: 'Grammar',
				original_text: '...tokens comprising...',
				improvement: "Add 'on' after 'covering' to make it grammatically correct.",
				questions: ['What is grammar?'],
				suggested_sentences: ['tokens including']
			},
			{
				category: 'Tone',
				original_text:
					'There is an argument to be made that the gender and race of a person’s identity directly impact their ability to be vulnerable in the workplace; hence, a need for current culture to ‘set the stage’ so that all demographics see equal effects to vulnerability, then seen as an asset.',
				improvement: "Use more inclusive language instead of 'all demographics'.",
				questions: [],
				suggested_sentences: [
					'There is an argument to be made that the gender and race of a person’s identity directly impact their ability to be vulnerable in the workplace; hence, a need for current culture to ‘set the stage’ so that everyone sees equal effects to vulnerability, then seen as an asset.'
				]
			},
			{
				category: 'Word Choice',
				original_text: '...he shares a story that takes place in the early 1990s...',
				improvement: "'Shares' can be replaced with 'narrates'.",
				questions: [],
				suggested_sentences: ['...he narrates a story that takes place in the early 1990s...']
			},
			{
				category: 'Meaning',
				original_text:
					'It is important to critically analyze vulnerability in the workplace by defining it, assess its differing affects towards a diverse group, and discuss a way to cultivate a healthy environment for vulnerability; that is equal towards all.',
				improvement:
					"Reword this sentence for clarity. It's unclear what you mean by 'that is equal towards all'.",
				questions: [
					"What do you mean by 'that is equal towards all'? Do you mean a way to cultivate a healthy environment that is equally beneficial for everyone?"
				],
				suggested_sentences: []
			}
		]
	};

	return {
		models: models.data,
		fakeData
	};
};
