<script>
export let text;
export let head;
</script>
<section class='col-text'>
  <p>{@html head}</p>
  {#if text}
  {#each text as p}
      <p>{@html p.p}</p>
  {/each}
  {/if}
</section>