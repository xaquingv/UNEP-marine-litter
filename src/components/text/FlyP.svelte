<script>
  import IntersectionObserver from "svelte-intersection-observer";
  export let p;
  
  let element, intersecting;
  </script>
  <IntersectionObserver {element} on:observe="{(e) => {intersecting = e.detail.isIntersecting;}}" threshold=.5>
    {#if p.illo}
    <img class='small-image' style="transform: translate({intersecting ? 0:10}%, 0); opacity:{intersecting ? 1 : 0}" src='img/{p.illo}.png' alt='Abstract watercolor as an illustration for the the text below'/>
    {/if}
    <p bind:this={element} style="transform: translate({intersecting ? 0:-10}%, 0); opacity:{intersecting ? 1 : 0}">{@html p.p}</p>
  </IntersectionObserver>
  <style>
      p {
        font-size:1.8rem;
        transition: all .3s;
      }
      .small-image {
          height:15rem;
          margin-bottom: -2rem;
          transition: all .3s;
      }
      @media screen and (min-width: 48rem) {
        p {
          font-size:2.1rem;
        }
      }
      
    </style>