<script>
  import Scroller from '@sveltejs/svelte-scroller'
  import Photo from '../multimedia/Photo.svelte'

  export let type;
  export let text;

  let index, count = 1;

</script>

<section class='full {type}'>
  <Scroller
      top={0}
      bottom={1}
      bind:index
      bind:count
      >

    <div slot='background'>
        <div class='video-wrapper'>
          <Photo 
            src='./img/corals-map.jpg'
            layout='cover'
            alt='World map of corals'
          />
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
.step { 
  height: 80vh;
  padding-top: 100vh;
  color:white;
  margin-left: 1rem;
  margin-right: 1rem;

}
.video-wrapper{
  width: 100%;
  height: 100vh;
  background-color:#0834f3;
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