<script>
    import Scroller from '@sveltejs/svelte-scroller'
    import Map2Charts from '../charts/TreemapCanvas.svelte'

    export let type;
    export let text;

    let index;

</script>

<section class='full {type} diagram'>
    <Scroller
        top={0}
        bottom={1}
		bind:index
        >

      <div slot='background'>
          <div class='video-wrapper'>
          <Map2Charts step={index} />
          </div>
      </div>

      <div slot='foreground'>
          {#each text as p}
          <section class='step'>
            <h3 class='col'><span class='bg-text'>{@html p.p}</span></h3>
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
  .video-wrapper{
    width: 100%;
    height: 100vh;
  }
  .header { padding: 4rem 0; }
  .bg-text { 
    background-color: rgba(0,0,0,.3);
    padding: 0.2rem 0;
  }
  @media screen and (min-width: 48rem) {
    .step { 
      margin-left: 0;
      margin-right: 0;
    }
  }
</style>