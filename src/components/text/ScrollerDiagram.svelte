<script>
    import Scroller from '@sveltejs/svelte-scroller'
    import Video from '../multimedia/Video.svelte'

    export let type;
    export let text;
    export let src;
    export let bg;

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
            <h3 class='narrow'><span class='bg-text {bg}'>{@html p.p}</span></h3>
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
    padding-top: 60vh;
    color:white;
    margin-left: 1rem;
    margin-right: 1rem;
    
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
  .white { 
    background-color: #f9f9f9;
    color:#000;
  }
  @media screen and (min-width: 48rem) {
    .step { 
      margin-left: 0;
      margin-right: 0;
    }
  }
</style>