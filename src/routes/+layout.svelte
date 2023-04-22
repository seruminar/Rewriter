<main>
	<slot />
</main>

<style>
	:global(html, body) {
		margin: 0;
	}

	:global(.group) {
		display: flex;
	}

	:global(.column) {
		flex-direction: column;
	}

	:global(.item) {
		flex: 1;
	}

	main {
		position: absolute;
		width: 100%;
		height: 100%;
		background-color: rgb(191 200 255);
		font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial,
			sans-serif;
		overflow-y: auto;
	}

	:global(section) {
		width: 80%;
		padding: 1em;
		margin: 0 auto;
		margin: 1em;
		border-radius: 1em;
		margin: 1em auto 0;
	}
</style>
