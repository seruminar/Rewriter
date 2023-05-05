export const load = async ({ fetch }) => {
	const response = await fetch('/rewrite/models');

	const models = await response.json();

	const fakeData = {
		improvements: [
			{
				category: 'Word Choice',
				description: "Replace 'yet' with 'however' for better clarity.",
				clarification_questions: [],
				original_text:
					'Gender equality is a fundamental principle of democratic societies, yet women continue to face significant barriers to achieving equal representation and opportunities.',
				improved_text:
					'Gender equality is a fundamental principle of democratic societies, however women continue to face significant barriers to achieving equal representation and opportunities.',
				id: 0,
				class: 'wordchoice'
			},
			{
				category: 'Meaning',
				description: "Clarify the meaning of 'decision-making bodies'.",
				clarification_questions: ['What specific decision-making bodies are being referred to?'],
				original_text:
					'Despite progress in recent decades, women remain underrepresented in elected office and decision-making bodies, and they often face discrimination and bias in the workplace and in society at large, especially women of color.',
				improved_text:
					'Despite progress in recent decades, women remain underrepresented in elected office as well as important decision-making bodies such as corporate boards or government committees. They often face discrimination and bias in the workplace and in society at large, especially women of color.',
				id: 1,
				class: 'meaning'
			},
			{
				category: 'Clarity',
				description: "'In this paper' can be replaced with 'This paper will'",
				clarification_questions: [],
				original_text:
					'In this paper, we will explore the ways in which democratic institutions and processes can be reformed to better promote gender equality. We will also consider the role of civil society organizations and grassroots movements in advocating for change, and we will analyze the impact of gender equality on the overall health and functioning of democratic societies.',
				improved_text:
					'This paper will explore the ways in which democratic institutions and processes can be reformed to better promote gender equality. It will also consider the role of civil society organizations and grassroots movements in advocating for change, and analyze the impact of gender equality on the overall health and functioning of democratic societies.',
				id: 2,
				class: 'clarity'
			},
			{
				category: 'Spelling',
				description: "Change 'color' to 'colour' to match British English spelling.",
				clarification_questions: [],
				original_text:
					'Despite progress in recent decades, women remain underrepresented in elected office and decision-making bodies, and they often face discrimination and bias in the workplace and in society at large, especially women of color.',
				improved_text:
					'Despite progress in recent decades, women remain underrepresented in elected office and decision-making bodies, and they often face discrimination and bias in the workplace and in society at large, especially women of colour.',
				id: 3,
				class: 'spelling'
			}
		],
		categories: {
			wordchoice: 'Word Choice',
			meaning: 'Meaning',
			clarity: 'Clarity',
			spelling: 'Spelling'
		}
	};

	return {
		models: models.data,
		modes: {
			addCitations: { key: 'addCitations', value: 'Add citations' },
			rewrite: { key: 'rewrite', value: 'Rewrite' }
		},
		cultures: {
			enUk: { value: 'UK English', internalValue: 'British English' },
			enUs: { value: 'US English', internalValue: 'US English' }
		},
		fakeData,
		fakeValue:
			'Gender equality is a fundamental principle of democratic societies, yet women continue to face significant barriers to achieving equal representation and opportunities. Despite progress in recent decades, women remain underrepresented in elected office and decision-making bodies, and they often face discrimination and bias in the workplace and in society at large, especially women of color. In this paper, we will explore the ways in which democratic institutions and processes can be reformed to better promote gender equality. We will also consider the role of civil society organizations and grassroots movements in advocating for change, and we will analyze the impact of gender equality on the overall health and functioning of democratic societies.'
	};
};
