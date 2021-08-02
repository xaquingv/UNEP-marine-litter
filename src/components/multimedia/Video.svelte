<script>
  export let poster;
  export let src;
  export let layout;
  export let time;
  export let duration;
  export let noscroll = true;
</script>

<video
  bind:currentTime = {time}
  bind:duration = {duration}
  preload='metadata'
  class={layout}
	poster={poster}
	src={src}
  muted
	autoplay = {noscroll}
  loop = {noscroll}>
  <track kind="captions">
</video>
