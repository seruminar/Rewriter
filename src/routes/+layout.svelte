<svelte:head>
	<title>RewrAIter</title>
</svelte:head>

<header>
	<div class="logo">
		<h1>rewrAIter</h1>
	</div>
</header>

<main class="gradient">
	<slot />
</main>

<style lang="scss">
	@import url('https://fonts.googleapis.com/css2?family=Genos:wght@600&family=Work+Sans:wght@100;200;300&display=swap');

	:global(html) {
		width: 100%;
		height: 100%;
		font-family: 'Work Sans', sans-serif, 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande',
			'Lucida Sans', Arial, sans-serif;
	}

	:global(body) {
		margin: 0;
		display: flex;
		height: 100%;
		flex-direction: column;
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

	header {
		background: no-repeat center/100% url('$lib/../../headerBackground1.png');

		.logo {
			padding: 0.1em 0 0.2em 1em;

			h1 {
				margin: 0;
				font-size: 4em;
				letter-spacing: 0.1em;
				font-variant: small-caps;
				font-family: 'Genos', sans-serif;
				text-shadow: -0.05em 0 0em #02faec, 0.1em 0 0em #ff5809;
			}
		}
	}

	main {
		overflow-y: scroll;
		flex: 1;
	}

	:global(.gradient) {
		background: fixed
			linear-gradient(
				350deg,
				rgba(172, 72, 0, 1) 0%,
				rgba(121, 9, 98, 1) 35%,
				rgba(0, 255, 239, 1) 100%
			);
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
