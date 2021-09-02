<script>
  import Scroller from '@sveltejs/svelte-scroller'
  import Video from '../multimedia/Video.svelte'
  import IntersectionObserver from "svelte-intersection-observer";
  import { fade } from 'svelte/transition'

  export let type;
  export let text;
  export let head;
  export let video;

  let index, count = 1, y, height;
  let element, intersecting;

  $:showVideo = () => {
    return y > (height*.6);
  }

</script>
<svelte:window bind:scrollY={y} bind:innerHeight={height} />
<section class='full {type} {type === 'intro' ? 'brown':''}'>
  <Scroller
      top={0}
      bottom={1}
      bind:index
      bind:count
      >

    <div slot='background'>
        <div class="{type === 'intro' ? '':'gradient'}"></div>
        <div class='video-wrapper' style="opacity:{(intersecting && showVideo()) ? 1 : 0}">
        <Video 
          src='video/{video}.mp4'
          layout='cover' />
        </div>
    </div>

    <div slot='foreground'>
      <IntersectionObserver {element} on:observe="{(e) => {intersecting = e.detail.isIntersecting;}}" threshold=0 rootMargin='{(count) * 100}%'>
        <section class='step' bind:this={element}>
              {#if type === 'intro'}
              <h1 class='narrow'>{@html head}</h1>
              {:else}
              <h2 class='narrow'>{@html head}</h2>
              {/if}
        </section>
      </IntersectionObserver>
        {#if text}
        {#each text as p}
        <section class='step-below'>
          {#if type === 'intro'}
          <h3 class='narrow shadow'>{@html p.p}</h3>
          {:else}
          <h3 class='narrow'><span class='bg-text'>{@html p.p}</span></h3>
          {/if}
        </section>
        {/each}
        {/if}
    </div>

  </Scroller>
</section>

<style>
.step { 
  height: 80vh;
  padding-top: 20vh;
  color:white;
  margin-left: 1rem;
  margin-right: 1rem;
}
.brown { background-color: #3f86e1; }
.step-below { 
    height: 40vh;
    padding-top: 20vh;
    color:white;
    margin-left: 1rem;
    margin-right: 1rem;
  }
.shadow {
  text-shadow: 0 0 2rem #00000066, 0 0 1rem #00000099, 0 0 .5rem #000000CC;
}
.video-wrapper{
  width: 100%;
  height: 100vh;
  transition: all 1s;
}
.header { padding: 4rem 0; }
.gradient {
  position:absolute;
  top:0;
  width:100%;
  height:20rem;
  background: #f9f9f9;
  background: 
  linear-gradient(
    to bottom,
    hsl(0, 0%, 98%) 0%,
    hsla(0, 0%, 98%, 0.987) 9.4%,
    hsla(0, 0%, 98%, 0.951) 17.6%,
    hsla(0, 0%, 98%, 0.896) 24.8%,
    hsla(0, 0%, 98%, 0.825) 31.2%,
    hsla(0, 0%, 98%, 0.741) 37%,
    hsla(0, 0%, 98%, 0.648) 42.4%,
    hsla(0, 0%, 98%, 0.55) 47.5%,
    hsla(0, 0%, 98%, 0.45) 52.5%,
    hsla(0, 0%, 98%, 0.352) 57.6%,
    hsla(0, 0%, 98%, 0.259) 63%,
    hsla(0, 0%, 98%, 0.175) 68.8%,
    hsla(0, 0%, 98%, 0.104) 75.2%,
    hsla(0, 0%, 98%, 0.049) 82.4%,
    hsla(0, 0%, 98%, 0.013) 90.6%,
    hsla(0, 0%, 98%, 0) 100%
  );
}
.bg-text { 
  background-color: rgba(0,0,0,.3);
  padding: 0.08rem 0;
}

@media screen and (min-width: 48rem) {
  .step { 
    margin-left: 0;
    margin-right: 0;
  }
}
</style>