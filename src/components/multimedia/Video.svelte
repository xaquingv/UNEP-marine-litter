<script>
  export let poster;
  export let src;
  export let layout;
  export let time;
  export let duration;
  export let noscroll = true;

  let width;
  $: desktop = (width > 1008);

</script>

<svelte:window bind:innerWidth={width} />

{#if noscroll}
<video
  bind:currentTime = {time}
  bind:duration = {duration}
  preload='metadata'
  class={layout}
	poster={poster}
	src='{desktop ? `${src}`:`${src}-mobile`}.mp4'
  muted
	autoplay={noscroll}
  playsinline=true
  loop={noscroll}>
  <track kind="captions">
</video>
{:else}
<video
  bind:currentTime = {time}
  bind:duration = {duration}
  preload='auto'
  class={layout}
	poster={poster}
	src='{desktop ? `${src}`:`${src}-mobile`}.mp4'
  muted
	autoplay={noscroll}
  playsinline=true
  loop = {noscroll}>
  <track kind="captions">
</video>
{/if}

