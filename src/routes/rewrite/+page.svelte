<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { clsx } from 'clsx';

	export let data: any;

	let originalValue =
		'An alternative to sampling with temperature, ' +
		'called nucleus sampling, where the model considers ' +
		'the results of the tokens with top_p probability mass. ' +
		'So 0.1 means only the tokens comprising the top 10% ' +
		'probability mass are considered.';

	let model = 'gpt-3.5-turbo';

	let isLoading = false;
	let hasError = false;

	let rewriteResponse: any = {};
	let rewriteData: { comments: any[]; categories: { [key: string]: string } } | null = null;

	let highlightArea: HTMLDivElement;
	let highlightedComment: any;

	onMount(async () => {
		rewriteData = data.fakeData;

		parseData();
		// console.log(data);
	});

	async function process() {
		isLoading = true;
		hasError = false;
		rewriteData = null;
		highlightArea.textContent = '';

		try {
			const response = await fetch('/rewrite', {
				method: 'POST',
				body: JSON.stringify({
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
			highlightArea.textContent = '';

			let id = 0;
			let newValue = originalValue;

			rewriteData.categories = {};

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

			highlightArea.innerHTML = newValue;

			for (const childElement of highlightArea.children) {
				(<HTMLSpanElement>childElement).addEventListener('mouseover', highlightIn);
				(<HTMLSpanElement>childElement).addEventListener('mouseout', highlightOut);
			}
		}

		console.log(rewriteData);
	}

	function highlightIn(this: HTMLSpanElement, event: MouseEvent) {
		if (rewriteData) {
			highlightedComment = rewriteData.comments.find((comment) => comment.id == this.dataset.id);
		}

		console.log(highlightedComment);
	}

	function highlightOut(this: HTMLSpanElement, event: MouseEvent) {
		highlightedComment = null;
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
								<div>
									<select disabled value={model}>
										{#each data.models as model}
											<option value={model.id}>{model.id}</option>o
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
			<div class="item highlightArea" bind:this={highlightArea} />
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
			height: 30em;
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

		.highlightArea {
			margin: 0.5em 0 1em 0;

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
