<script>
	import Video from '../multimedia/Video.svelte'
	import IntersectionObserver from "svelte-intersection-observer";
	import {fly, fade} from 'svelte/transition';

	export let tag;
	export let kicker;
	export let stories;
	export let lang;
	
	let element, intersecting, width, window, opened;

	const more = 'Read more'

	$:mobile = window < 1008;

	const open = () => {
		opened = !opened;
	}

</script>
<svelte:window bind:innerWidth={window}/>

<section>
	<IntersectionObserver {element} bind:intersecting threshold=1 rootMargin='100%'>
		<div class="pill-location" bind:this={element}></div>
	</IntersectionObserver>
	{#if intersecting}
		{#if mobile}
		<div class="pill-wrapper" bind:clientWidth={width} transition:fly="{{ x: width, duration: 600 }}">
			<div class="pill {opened ? 'pill--opened' : 'pill--closed'}" on:click={open}>
				<p>{@html kicker}</p>
				{#if opened}
				<div class='pill-content-wrapper' transition:fade={{duration:600}}>
					<ul>
						{#each stories as story}
							<li><a href="{story.link}?lang={lang.toUpperCase()}">{story.item}</a></li>
						{/each}
					</ul>
				</div>
				{/if}
				<div class="icon {opened ? 'opened' : 'closed'}"></div>
			</div>
		</div>
		{:else}
		<div class="pill-wrapper" bind:clientWidth={width} transition:fly="{{ x: width, duration: 600 }}">
			<div class="pill">
				<div class='pill-content-wrapper'>
					<Video
						src='video/header'
						poster=''
						layout='third'
					/>
					<p class="tag">{@html tag}</p>
					<p class="header">{@html kicker}</p>
					<ul>
						{#each stories as story}
							<li><a href="{story.link}?lang={lang.toUpperCase()}">{story.item}</a></li>
						{/each}
					</ul>
				</div>
			</div>
		</div>
		{/if}
	{/if}
</section>

<style>
	.tag {
		font-weight: 600!important;
		font-size: 1rem;
		text-align: center;
		margin-top:0;
	}
	.header {
		font-size: 1rem;
		text-align: center;
		margin-bottom:-1rem;
	}
	.pill-location {
		width:0;
		height:0;
		top: 100vh;
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
		box-shadow: 0 0 3rem #00000022;
		transition:all .6s;
		overflow-y: scroll;
	}

	.pill--opened {
		height:12rem;
	}
	.pill--closed {
		height:4rem;
	}

	p {
		font-weight: 500;
	}
	p, ul {
		font-size:1.1rem;
		width:100%;
		text-align: center;
	}

	ul {
		list-style-type: none;
		margin: 0;
		padding: 1rem 0;

	}

	li {
		display: inline-block;
		font-size: 1rem;
	}

	li:not(:last-child)::after {
		content: '|';
		padding: 0 .6rem;
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
			background-color: #f9f9f9;
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
<!-- 
<script>
	import Video from '../multimedia/Video.svelte'
	export let tag
	export let stories;
</script>

<section class="col-text">
    <Video
			src='video/header.mp4'
			poster=''
			layout='third'
		/>
	<p>{@html tag}</p>
	<ul>
		{#each stories as story}
			<li><a href="{story.link}">{story.item}</a></li>
		{/each}
	</ul>
</section>

<style>
	p {
		font-weight: 500;
	}
	p, ul {
		width:100%;
		font-size:1.1rem;
	}

	ul {
		list-style-type: none;
		margin: 0;
		padding: 1rem 0;

	}

	li {
		display: inline-block;
	}

	li:not(:last-child)::after {
		content: '|';
		padding: 0 .6rem;
	}

	@media screen and (min-width: 48rem) {
		p, ul {
			width:24rem;
		}
	}
</style> -->