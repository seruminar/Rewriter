<script lang="ts">
	import { onMount } from 'svelte';
	import { clsx } from 'clsx';

	type Improvement = {
		category: string;
		description: string;
		clarification_questions: string[];
		original_text: string | undefined;
		improved_text: string | undefined;
		edited_text_with_cited_quotation: string | undefined;
		works_cited_in_apa_format: string | undefined;
		searchValue: string | undefined;
		replacementValue: string | undefined;
		id: number;
		class: string;
	};

	type RewriteData = {
		improvements: Improvement[];
		categories: Record<string, string>;
	};

	export let data: {
		models: Record<string, any>[];
		modes: Record<string, { key: string; value: string }>;
		cultures: Record<string, { value: string; internalValue: string }>;
		fakeValue: string;
		fakeData: RewriteData;
	};

	let model = 'gpt-3.5-turbo';
	let mode: string = Object.entries(data.modes)[0][0];
	let culture: string = Object.entries(data.cultures)[0][0];

	let originalValue = '';

	let isLoading = false;
	let hasError = false;

	let rewriteResponse: any = {};
	let rewriteData: RewriteData | null = null;

	let highlightArea: HTMLDivElement;
	let highlightedimprovement: Improvement | null;

	let supportingArea: HTMLDivElement;

	onMount(async () => {
		// originalValue = data.fakeValue;
		// rewriteData = data.fakeData;
		// mode = 'rewrite';

		parseData();
	});

	function reset() {
		hasError = false;
		rewriteData = null;

		highlightArea.textContent = '';
		supportingArea.textContent = '';
	}

	function processMode(selectedMode: string) {
		return () => process(selectedMode);
	}

	async function process(selectedMode: string) {
		reset();

		isLoading = true;
		mode = selectedMode;

		try {
			const originalValues = originalValue.split('\n');

			for (const originalValue of originalValues) {
				try {
					if (originalValue.length) {
						const response = await fetch('/rewrite', {
							method: 'POST',
							body: JSON.stringify({
								mode: data.modes[mode],
								culture: data.cultures[culture],
								model,
								originalValue
							}),
							headers: {
								'content-type': 'application/json'
							}
						});

						rewriteResponse = await response.json();

						console.log(rewriteResponse);

						if (rewriteResponse.completions.choices) {
							const content = rewriteResponse.completions.choices[0].message.content;

							const contentArray = content.split('{');

							contentArray.shift();

							const newRewriteData = JSON.parse(`{${contentArray.join('{')}`);

							if (rewriteData === null) {
								rewriteData = newRewriteData;
							} else {
								for (const improvements of newRewriteData.improvements) {
									rewriteData.improvements.push(improvements);
								}
							}
						}
					}
				} catch (error) {
					console.error(error);
				}
			}

			parseData();

			console.log(rewriteData, originalValue);
		} catch (error) {
			hasError = true;

			console.error(error);
		} finally {
			isLoading = false;
		}
	}

	async function parseData() {
		if (rewriteData) {
			let id = 0;
			let newValue = originalValue;

			rewriteData.categories = {};

			switch (mode) {
				case 'addCitations':
					let citationsValue = '';
					let citations = new Set();

					for (const improvement of rewriteData.improvements) {
						if (
							improvement.original_text === undefined ||
							improvement.edited_text_with_cited_quotation === undefined ||
							improvement.works_cited_in_apa_format === undefined
						) {
							continue;
						}

						const searchValue = improvement.original_text.replaceAll(/(^\.*)|(\.*$)|([<>]*)/g, '');
						const replacementValue = improvement.edited_text_with_cited_quotation.replaceAll(
							/(^\.*)|(\.*$)|([<>]*)/g,
							''
						);

						improvement.id = id;
						improvement.searchValue = searchValue;
						improvement.replacementValue = replacementValue;

						newValue = newValue.replace(
							searchValue,
							`<span class="highlight" data-id=${id++}>${replacementValue}</span>`
						);

						const citationValue = improvement.works_cited_in_apa_format.replaceAll(
							/(^\.*)|(\.*$)|([<>]*)/g,
							''
						);

						citations.add(citationValue);
					}

					for (const citationValue of citations) {
						citationsValue = citationsValue + `<li>${citationValue}</li>`;
					}

					citationsValue = `<ul>${citationsValue}</ul>`;

					supportingArea.innerHTML = citationsValue;

					break;

				case 'rewrite':
					for (const improvement of rewriteData.improvements) {
						if (improvement.category.length == 0 || improvement.original_text === undefined) {
							continue;
						}

						const searchValue = improvement.original_text.replaceAll(/(^\.*)|(\.*$)|([<>]*)/g, '');
						const improvementClass = improvement.category.replaceAll(/([ <>]*)/g, '').toLowerCase();
						const category = improvement.category.replaceAll(/([<>]*)/g, '');

						improvement.id = id;
						improvement.class = improvementClass;
						improvement.category = category;

						rewriteData.categories[improvementClass] = improvement.category;

						newValue = newValue.replace(
							searchValue,
							`<span class="highlight ${improvementClass}" data-id=${id++}>${searchValue}</span>`
						);
					}

					break;
			}

			newValue.replaceAll('\n', `<br/>`);

			highlightArea.innerHTML = newValue;

			switch (mode) {
				case 'addCitations':
					for (const childElement of highlightArea.children) {
						(<HTMLSpanElement>childElement).addEventListener('click', swapSentence);
					}

					break;

				case 'rewrite':
					for (const childElement of highlightArea.children) {
						(<HTMLSpanElement>childElement).addEventListener('mouseover', highlightIn);
						(<HTMLSpanElement>childElement).addEventListener('mouseout', highlightOut);
					}

					break;
			}
		}

		console.log(rewriteData);
	}

	function highlightIn(this: HTMLSpanElement, event: MouseEvent) {
		if (rewriteData) {
			const id = new Number(this.dataset.id);

			const foundImprovement = rewriteData.improvements.find((improvement) => improvement.id == id);

			if (foundImprovement) {
				highlightedimprovement = foundImprovement;
			}
		}
	}

	function highlightOut(this: HTMLSpanElement, event: MouseEvent) {
		highlightedimprovement = null;
	}

	function swapSentence(this: HTMLSpanElement, event: MouseEvent) {
		if (rewriteData) {
			const id = new Number(this.dataset.id);

			const foundImprovement = rewriteData.improvements.find((improvement) => improvement.id == id);

			if (foundImprovement) {
				highlightedimprovement = foundImprovement;

				if (
					this.textContent === highlightedimprovement.searchValue &&
					highlightedimprovement.replacementValue !== undefined
				) {
					this.textContent = highlightedimprovement.replacementValue;
				} else if (highlightedimprovement.searchValue !== undefined) {
					this.textContent = highlightedimprovement.searchValue;
				}
			}
		}
	}
</script>

<section>
	{#if isLoading}
		<div class="overlay">
			<div class="group">THINKING SLOWLY</div>
		</div>
	{/if}
	<div class="item">
		<div class="group">
			<div class="item">
				<textarea
					class="gradient"
					disabled={isLoading}
					bind:value={originalValue}
					placeholder="Write something here . . ."
				/>
			</div>
			<div class="group column actions">
				<div class="selector">
					<select disabled value={model}>
						{#each data.models as model}
							<option value={model.id}>{model.id}</option>
						{/each}
					</select>
				</div>
				<div class="selector">
					<select value={culture}>
						{#each Object.entries(data.cultures) as [cultureKey, culture]}
							<option value={cultureKey}>{culture.value}</option>
						{/each}
					</select>
				</div>
				<div class="item" />
				{#if originalValue.length}
					<div class="button">
						<button on:click={processMode('addCitations')}>Cite for me</button>
					</div>
					<div class="button">
						<button on:click={processMode('rewrite')}>Fix my grammar</button>
					</div>
				{/if}
			</div>
		</div>
	</div>
	<div class="item">
		<div class="group column">
			{#if rewriteData && !isLoading}
				<h2>Rewritten</h2>
				<div class="item">
					<div class="group">
						{#each Object.entries(rewriteData.categories) as [improvementsClass, category]}
							<div class={clsx('pill', 'box', improvementsClass)}>{category}</div>
						{/each}
					</div>
				</div>
			{/if}
			<div
				class:highlightArea={rewriteData && !isLoading}
				class="item gradient"
				bind:this={highlightArea}
			/>
			<div class:output={rewriteData && !isLoading} class="item" bind:this={supportingArea} />
			{#if highlightedimprovement}
				<div class={clsx('item', 'improvements', 'box', highlightedimprovement.class)}>
					<div class="group column">
						<div class="item">
							<div class="group column">
								<div class="item">
									<h3>{highlightedimprovement.category}</h3>
									{#if highlightedimprovement.description}
										<p>{highlightedimprovement.description}</p>
									{/if}
								</div>
								<div class="item">
									<div class="group">
										{#if highlightedimprovement.clarification_questions && highlightedimprovement.clarification_questions.length}
											<div class="item">
												<h4>Questions</h4>
												<ul>
													{#each highlightedimprovement.clarification_questions as question}
														<li>{question}</li>
													{/each}
												</ul>
											</div>
										{/if}
										{#if highlightedimprovement.improved_text}
											<div class="item">
												<h4>Suggested Sentence</h4>
												<ul>
													<li>{highlightedimprovement.improved_text}</li>
												</ul>
											</div>
										{/if}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			{/if}
		</div>
		{#if hasError}
			<h2>Error?</h2>
			<textarea disabled>{JSON.stringify(rewriteResponse, null, 4)}</textarea>
		{/if}
	</div>
</section>

<style lang="scss">
	section {
		width: 80em;
		background-color: #e2e2e2;
		// box-shadow: 0 0 5em 0em rgb(255, 255, 255);
		position: relative;

		.overlay {
			position: absolute;
			background: rgba(73, 99, 32, 0.712);
			color: white;
			width: 100%;
			height: 100%;
			left: 0;
			top: 0;
			display: flex;
			align-items: center;
			justify-content: center;
			font-family: 'Genos', sans-serif;
			font-weight: 600;
			border-radius: 1em;
			z-index: 1000;

			> * {
				font-size: 4em;
			}
		}

		.pill {
			font-weight: 900;
			padding: 0.2em 0.6em;
			border-radius: 0.2em;
			line-height: 1.4em;
			text-transform: uppercase;

			&:not(:last-child) {
				margin: 0 0.5em 0 0;
			}
		}

		textarea {
			padding: 1em;
			width: calc(100% - 2em);
			height: 20em;
			border-radius: 1em;
			resize: none;
			border: none;
			font-weight: 300;
			font-family: 'Work Sans', sans-serif;
			color: white;
			font-size: 1em;
			line-height: 1.4em;
			margin: 0 0 -4px 0;

			&:focus {
				background: rgb(57 137 172);
				border: none;
				outline: none;
			}

			&::placeholder {
				font-weight: bold;
				color: white;
			}
		}

		.actions {
			margin: 0 0 0 0.5em;

			*:not(:last-child) {
				margin: 0 0 0.5em;
			}

			.selector {
				select {
					color: white;
					font-weight: bold;
					height: 4em;
					width: 100%;
					padding: 0.5em 1em;
					border-radius: 1em;
					border: none;
					font-weight: 200;
					font-family: 'Work Sans', sans-serif;
					background: rgb(135 30 132);

					&:focus {
						background: rgb(57 137 172);
					}
				}
			}

			.button {
				button {
					height: 2em;
					width: 100%;
					padding: 0.2em 0.4em;
					font-size: 1.4em;
					font-variant: small-caps;
					font-family: 'Work Sans', sans-serif;
					font-weight: 200;
					border-radius: 1em;
					border: none;
					color: white;
					background: rgb(135 30 132);

					&:hover {
						cursor: pointer;
						background: rgb(57 137 172);
					}
				}
			}
		}

		.highlightArea {
			margin: 0.5em 0 1em 0;
			border-radius: 1em;
			padding: 1em;
			font-size: 1em;
			line-height: 1.4em;

			:global(.highlight) {
				cursor: default;
			}

			:global(.highlight:hover) {
				border-bottom: 2px solid greenyellow !important;
			}
		}

		:global(.clarity) {
			border-bottom: 2px solid #89ffd2;

			&.box {
				border: none;
				background: #89ffd2;
			}
		}

		:global(.grammar) {
			border-bottom: 2px solid #89d9ff;

			&.box {
				border: none;
				background: #89d9ff;
			}
		}

		:global(.spelling) {
			border-bottom: 2px solid #edff89;

			&.box {
				border: none;
				background: #edff89;
			}
		}

		:global(.wordchoice) {
			border-bottom: 2px solid #ff89f9;

			&.box {
				border: none;
				background: #ff89f9;
			}
		}

		:global(.meaning) {
			border-bottom: 2px solid #ff8989;

			&.box {
				border: none;
				background: #ff8989;
			}
		}

		:global(.improvements) {
			border-radius: 1em;
			padding: 1em;
			margin: 0 0 1em 0;
		}

		h3 {
			margin: 0;
		}
	}
</style>
