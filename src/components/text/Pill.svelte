<script>
	import IntersectionObserver from "svelte-intersection-observer";
	import {fly, fade} from 'svelte/transition';

	export let short;
	export let long;
	
	let element, intersecting, width, window, opened;

	const more = 'Read more'

	$:mobile = window < 778;

	const open = () => {
		opened = !opened;
	}

</script>
<svelte:window bind:innerWidth={window}/>

<section>
	<IntersectionObserver {element} bind:intersecting threshold=1>
		<div class="pill-location" bind:this={element}></div>
	</IntersectionObserver>
	{#if intersecting}
		{#if mobile}
		<div class="pill-wrapper" bind:clientWidth={width} transition:fly="{{ x: width, duration: 600 }}">
			<div class="pill {opened ? 'pill--opened' : 'pill--closed'}" on:click={open}>
				<p>{@html short}</p>
				{#if opened}
				<p transition:fade={{duration:600}}>{@html long}</p>
				{/if}
				<div class="icon {opened ? 'opened' : 'closed'}"></div>
			</div>
		</div>
		{:else}
		<div class="pill-wrapper" bind:clientWidth={width} transition:fly="{{ x: width, duration: 600 }}">
			<div class="pill">
				<p>{@html long}</p>
			</div>
		</div>
		{/if}
	{/if}
</section>

<style>
	.pill-location {
		width:0;
		height:0;
		top: 30vh;
		position:absolute;
	}

	.pill-wrapper {
		position:fixed;
		bottom:1.5rem;
		width:100%;
		z-index:1000;
	}

	.pill {
		margin:0 auto;
		width: calc(100% - 2rem);
		background-color: #1E1E1E;
		color: #FFF;
		padding:.5rem 0;
		border-radius: .5rem;
		box-shadow: 0 0 1.5rem #00000011;
		transition:all .6s;
		overflow-y: scroll;
	}

	.pill--opened {
		height:12rem;
	}
	.pill--closed {
		height:4rem;
	}

	.pill p {
		font-size: 1.1rem;
		font-weight: 500;
	}

	.icon {
		position: absolute;
		width: 2rem;
		height:2rem;
		top: 1rem;
		right: 2rem;
		background-image: url('../img/open.svg');
		background-size: 2rem 2rem;
		border:none;
		transition: transform .6s;
	}

	.opened {
		transform: rotate(180deg);
	}

	.closed {
		transform: rotate(0deg);
	}

	@media screen and (min-width: 48rem) {
		.pill {
			padding:.5rem 2rem;
			max-width: 20rem;
			background-color: #FFFFFFCC;
			color: #000;
		}
		.pill-wrapper {
			right:1.5rem;
			width:inherit;
		}
		.pill p {
			font-weight: 300;
		}

	}
</style>