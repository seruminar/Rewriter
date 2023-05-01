<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { clsx } from 'clsx';
	import { listen } from 'svelte/internal';

	export let data: any;

	let modes = [
		{ key: 'addCitations', value: 'Add citations' },
		{ key: 'rewrite', value: 'Rewrite' }
	];

	let model = 'gpt-3.5-turbo';
	let mode: string | null = modes[0].key;

	let originalValue = '';

	let isLoading = false;
	let hasError = false;

	let rewriteResponse: any = {};
	let rewriteData: { comments: any[]; categories: { [key: string]: string } } | null = null;

	let highlightArea: HTMLDivElement;
	let highlightedComment: any;

	let supportingArea: HTMLDivElement;

	onMount(async () => {
		// rewriteData = data.fakeData;

		parseData();
		// console.log(data);
	});

	function reset() {
		hasError = false;
		rewriteData = null;

		highlightArea.textContent = '';
		supportingArea.textContent = '';
	}

	async function process() {
		reset();

		isLoading = true;

		try {
			const response = await fetch('/rewrite', {
				method: 'POST',
				body: JSON.stringify({
					mode,
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
				rewriteData = JSON.parse(rewriteResponse.completions.choices[0].message.content);

				parseData();

				console.log(rewriteData, originalValue);
			}
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

					for (const comment of rewriteData.comments) {
						const searchValue = comment.original_text.replaceAll(/(^\.*)|(\.*$)|([<>]*)/g, '');
						const replacementValue = comment.edited_text_with_cited_quotation.replaceAll(
							/(^\.*)|(\.*$)|([<>]*)/g,
							''
						);

						comment.id = id;
						comment.searchValue = searchValue;
						comment.replacementValue = replacementValue;

						newValue = newValue.replace(
							searchValue,
							`<span class="highlight wordchoice" data-id=${id++}>${replacementValue}</span>`
						);

						const citationValue = comment.works_cited_in_apa_format.replaceAll(
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
					for (const comment of rewriteData.comments) {
						if (comment.category.length) {
							const searchValue = comment.original_text.replaceAll(/(^\.*)|(\.*$)|([<>]*)/g, '');
							const commentClass = comment.category.replaceAll(/([ <>]*)/g, '').toLowerCase();
							const category = comment.category.replaceAll(/([<>]*)/g, '');

							comment.id = id;
							comment.class = commentClass;
							comment.category = category;

							rewriteData.categories[commentClass] = comment.category;

							newValue = newValue.replace(
								searchValue,
								`<span class="highlight ${commentClass}" data-id=${id++}>${searchValue}</span>`
							);
						}
					}

					break;
			}

			highlightArea.innerHTML = newValue;

			for (const childElement of highlightArea.children) {
				(<HTMLSpanElement>childElement).addEventListener('mouseover', highlightIn);
				(<HTMLSpanElement>childElement).addEventListener('mouseout', highlightOut);
				(<HTMLSpanElement>childElement).addEventListener('click', swapSentence);
			}
		}

		console.log(rewriteData);
	}

	function highlightIn(this: HTMLSpanElement, event: MouseEvent) {
		if (rewriteData) {
			highlightedComment = rewriteData.comments.find((comment) => comment.id == this.dataset.id);
		}
	}

	function highlightOut(this: HTMLSpanElement, event: MouseEvent) {
		highlightedComment = null;
	}

	function swapSentence(this: HTMLSpanElement, event: MouseEvent) {
		if (rewriteData) {
			const highlightedComment = rewriteData.comments.find(
				(comment) => comment.id == this.dataset.id
			);

			if (this.textContent === highlightedComment.searchValue) {
				this.textContent = highlightedComment.replacementValue;
			} else {
				this.textContent = highlightedComment.searchValue;
			}
		}
	}
</script>

<svelte:head>
	<title>Rewriter</title>
</svelte:head>

<section>
	<div class="item">
		<div class="group column">
			<div class="item">
				<div class="group">
					<div class="item">
						<textarea disabled={isLoading} bind:value={originalValue} />
					</div>
				</div>
			</div>
			<div class="item actions">
				<div class="group column">
					{#if isLoading}
						<div class="item">
							<strong class="loading">Thinking...</strong>
						</div>
					{:else}
						<div class="item">
							<div class="group">
								<div class="selector">
									<select disabled value={model}>
										{#each data.models as model}
											<option value={model.id}>{model.id}</option>o
										{/each}
									</select>
								</div>
								<div class="selector">
									<select value={mode}>
										{#each modes as mode}
											<option value={mode.key}>{mode.value}</option>o
										{/each}
									</select>
								</div>
								<div class="item" />
								<div>
									<button on:click={process} disabled={!originalValue.length}>Rewrite</button>
								</div>
							</div>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
	<div class="item">
		<div class="group column">
			{#if rewriteData}
				<h2>Rewritten</h2>
				<div class="item">
					<div class="group">
						{#each Object.entries(rewriteData.categories) as [commentClass, category]}
							<div class={clsx('pill', commentClass)}>{category}</div>
						{/each}
					</div>
				</div>
			{/if}
			<div class="item output highlightArea" bind:this={highlightArea} />
			<div class="item output" bind:this={supportingArea} />
			{#if highlightedComment}
				<div class={clsx('item', 'comment', highlightedComment.class)}>
					<div class="group column">
						<div class="item">
							<div class="group column">
								<div class="item">
									<h3>{highlightedComment.category}</h3>
									{#if highlightedComment.improvement}
										<p>{highlightedComment.improvement}</p>
									{/if}
								</div>
								<div class="item">
									<div class="group">
										{#if highlightedComment.questions.length}
											<div class="item">
												<h4>Questions</h4>
												<ul>
													{#each highlightedComment.questions as question}
														<li>{question}</li>
													{/each}
												</ul>
											</div>
										{/if}
										{#if highlightedComment.suggested_sentences.length}
											<div class="item">
												<h4>Suggested Sentences</h4>
												<ul>
													{#each highlightedComment.suggested_sentences as suggestedSentence}
														<li>{suggestedSentence}</li>
													{/each}
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
		width: 50em;
		background-color: rgb(160 165 255);
		box-shadow: 0 0 5em 0em rgb(255, 255, 255);

		.pill {
			padding: 0.2em;
			border-radius: 0.2em;
			font-variant: all-petite-caps;

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
			font-size: 14px;
		}

		.actions {
			margin: 0.5em 0 0;

			> div:not(:last-child) {
				margin: 0 0.5em 0 0;
			}

			.loading {
				font-size: 3em;
			}

			.selector:not(:last-child) {
				margin: 0 0.1em;
			}

			select {
				height: 4em;
				padding: 0.5em 1em;
				border-radius: 1em;
				border: none;
			}

			button {
				height: 4em;
				padding: 0.5em 1em;
				font-weight: 600;
				border-radius: 1em;
				border: none;
				background: #172d9b;
				color: white;

				&:hover:not(:disabled) {
					cursor: pointer;
					background-color: white;
					color: #172d9b;
				}
			}
		}

		.output {
			margin: 0.5em 0 1em 0;
		}

		.highlightArea {
			:global(.highlight) {
				padding: 0.1em 0.3em 0.2em;
				margin: 0.1em -0.3em 0.2em;
				border-radius: 0.3em;
				cursor: default;
			}

			:global(.highlight:hover) {
				background: greenyellow !important;
			}
		}

		:global(.grammar) {
			background: #89d9ff;
		}

		:global(.tone) {
			background: #edff89;
		}

		:global(.wordchoice) {
			background: #ff89f9;
		}

		:global(.meaning) {
			background: #ff8989;
		}

		:global(.comment) {
			border-radius: 1em;
			padding: 1em;
			margin: 0 0 1em 0;
		}

		h3 {
			margin: 0;
		}
	}
</style>
