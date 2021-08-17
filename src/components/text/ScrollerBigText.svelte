<script>
  import Scroller from '@sveltejs/svelte-scroller'
  import Video from '../multimedia/Video.svelte'

  export let type;
  export let text;
  export let src;

  let progress, duration;

  $:time = duration * progress;

</script>

<section class='full {type} diagram'>
  <Scroller
      top={0}
      bottom={1}
      bind:progress
      >

    <div slot='background'>
      <div class="gradient"></div>
      <div class="gradient-bottom"></div>
        <div class='video-wrapper'>
        <Video 
          bind:time
          bind:duration
          noscroll={false}
          {src}
          layout='cover' />
        </div>
      
    </div>

    <div slot='foreground'>
        {#each text as p}
        <section class='step'>
          <img class='small-image' src='img/{p.illo}.png' alt='Abstract watercolor as an illustration for the the text below'/>
          <h3 class='narrow'>{@html p.p}</h3>
        </section>
      {/each}
    </div>

  </Scroller>
</section>

<style>
.diagram {
  background-color: #001ca0;
}
.step { 
  height: 80vh;
  padding-top: 20vh;
  color:white;
  margin-left: 1rem;
  margin-right: 1rem;
  
}
h3 {
  color:#1E1E1E;
}
.video-wrapper{
  width: 100%;
  height: 100vh;
}
.header { padding: 4rem 0; }
.bg-text { 
  background-color: rgba(0,0,0,.15);
  padding: 0.08rem 0;
}
.small-image {
          height:15rem;
          transition: all .3s;
      }
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
.gradient-bottom {
  position:absolute;
  bottom:0;
  width:100%;
  height:20rem;
  background: #f9f9f9;
  background: 
  linear-gradient(
    to top,
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
@media screen and (min-width: 48rem) {
  .step { 
    margin-left: 0;
    margin-right: 0;
  }
}
</style>