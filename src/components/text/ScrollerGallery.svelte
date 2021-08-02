<script>
  import Scroller from '@sveltejs/svelte-scroller'
  import Photo from '../multimedia/Photo.svelte'
  import { fade } from 'svelte/transition'

  export let type;
  export let head;
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
      {#each text as p,i}
        {#if i === index}
        <div class='video-wrapper' transition:fade={{duration: 300}} >
          <Photo 
            src='./img/{p.img}'
            layout='cover'
            alt='{p.p}'
          />
        </div> 
        {/if}
      {/each} 
    </div>

    <div slot='foreground'>
      {#if head}
      <section class='step'>
        <h2 class='narrow'>{@html head}</h2>
      </section>
      {/if}
      {#each text as p}
        <section class='step'>
          <h3 class='narrow'>{@html p.p}</h3>
        </section>
      {/each}
    </div>

  </Scroller>
</section>

<style>
.step { 
  height: 80vh;
  padding-top: 100vh;
  color:#000;
  margin-left: 1rem;
  margin-right: 1rem;

}
.video-wrapper{
  width: 100%;
  height: 100vh;
}
.header { padding: 4rem 0; }
@media screen and (min-width: 48rem) {
  .step { 
    margin-left: 0;
    margin-right: 0;
  }
}
</style>