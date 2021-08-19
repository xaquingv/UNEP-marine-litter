<script>
	import Intro from './components/text/Intro.svelte'
	import Text from './components/text/Text.svelte'
	import Footer from './components/text/Footer.svelte'
	import ChapterHeader from './components/text/ChapterHeader.svelte'
	import ScrollerGallery from './components/text/ScrollerGallery.svelte'
	import ScrollerBigText from './components/text/ScrollerBigText.svelte'
	import Illo from './components/img/Illo.svelte'
	import TopNav from './components/nav/TopNav.svelte'
	import ScrollerDiagram from './components/text/ScrollerDiagram.svelte'
	import Pill from './components/text/Pill.svelte'
	import locale from '@reuters-graphics/d3-locale';
	import BigText from './components/text/BigText.svelte';
	import SmallImage from './components/img/SmallImage.svelte';
	import Download from './components/text/Download.svelte';
	import VideoScrolly from './components/multimedia/VideoScrolly.svelte'

  	export let content, intro, meta;

    const loc = new locale('en');
    const format = {
      x: loc.formatTime('%Y'),
      y: loc.format('.2%'),
    }

</script>
<TopNav />
<main>
  <article>
    {#each content as block}
		{#if block.type === 'header' || block.type === 'intro'}
		<ChapterHeader {...block} />
		{:else if block.type === 'series'}
		<Intro {...block}/>
		{:else if block.type === 'pill'}
		<Pill {...block}/>
		{:else if block.type === 'illo'}
    	<Illo {...block}/>
		{:else if block.type === 'gallery'}
		<ScrollerGallery {...block}/>
		{:else if block.type === 'scrolly-data'}
		<ScrollerBigText {...block} src='video/{block.video}.mp4'/>
		{:else if block.type === 'scrolly-video'}
    	<ScrollerDiagram {...block} src='video/{block.video}.mp4' bg={block.video === 'litter' ? 'white' : ''} />
		{:else if block.type === 'big-text'}
		<BigText {...block} />
		{:else if block.type === 'small-illo'}
		<SmallImage {...block} />
		{:else if block.type === 'footer'}
		<Footer {...block} />
		{:else if block.type === 'download'}
		<Download {...block} />
    	{:else}
    	<Text {...block} />
    	{/if}

    {/each}

  </article>

<!-- 	

	<Map 
		data={cases.data}
		map={world}
		geo='countries'
		scale={palette()}
		projection={projection}
    	join={{data:'geoid', map:'alpha3'}}
    	value=''
    	legend={{title: '', format: ''}}
		layout='wide'
	/> -->

</main>

<style>
	main {
		text-align: center;
		padding: 0;
		margin: 0 auto;
	}

	.blue {
		background-color: #1434b1;
		color: #FFF;
	}

	.bright {
		background-color: #0534f3;
		color: #FFF;
	}

	:global(.graphic) {
		height:50vh;
		margin-bottom:3rem;
	}
</style>