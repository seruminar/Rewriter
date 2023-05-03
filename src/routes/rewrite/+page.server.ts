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
		modes: [
			{ key: 'addCitations', value: 'Add citations' },
			{ key: 'rewrite', value: 'Rewrite' }
		],
		cultures: [
			{ key: 'enUk', value: 'UK English' },
			{ key: 'enUs', value: 'US English' }
		],
		fakeData,
		fakeValue:
			'Business professionals and respected people in academics have written a variety of viewpoints covering the topic of vulnerability within the workplace being an asset or liability. There is an argument to be made that the gender and race of a person’s identity directly impact their ability to be vulnerable in the workplace; hence, a need for current culture to ‘set the stage’ so that all demographics see equal effects to vulnerability, then seen as an asset. In Adam Grant’s book Originals, he shares a story that takes place in the early 1990s of CIA analyst Carmen Medina, a person with an idea ahead of her time in improving communication between intelligence agencies. Grant gives evidence to support the theory that one needs to establish status before having the power to be heard on ideas. He defined vulnerability as a liability when not establishing status first. Another perspective of vulnerability within the workplace is seen in the Harvard article, “Getting Serious About Diversity”. Harvard Business School Professor Robin J. Ely and Morehouse College President David A. Thomas, discuss vulnerability as an asset for the overall health of society’s norms, which they believe should be prioritized over immediate profits to cultivate better long-term success. But can anyone truly make an absolute assessment, when the temperature of cultural beliefs and values towards gender and race are in continual flux. It is important to critically analyze vulnerability in the workplace by defining it, assess its differing affects towards a diverse group, and discuss a way to cultivate a healthy environment for vulnerability; that is equal towards all.'
	};
};
