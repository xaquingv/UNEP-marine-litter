<script>
export let text;
export let head;
</script>
<section class='col-text'>
  {#if head}
  <h2>{@html head}</h2>
  {/if}
  {#if text}
  {#each text as p,i}
      <p class='{i > 0 ? '' : 'has-dropcap'}'>{@html p.p}</p>
  {/each}
  {/if}
</section>

<style>
  .has-dropcap:first-letter {
    float: left;
    font-weight: 700;
    font-size: 6.4rem;
    line-height: 0.65;
    margin: 0.1em 0.1em 0.1em 0;
  }
</style>