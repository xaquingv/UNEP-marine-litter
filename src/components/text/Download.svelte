<script>
export let head;
export let cover;
</script>

<section class='col-text border'>
  {#if head}
  <img src="./img/{cover}.png" alt="Cover of the report"/>
  <h4>{@html head}</h4>
  {/if}
</section>

<style>
  img {
      width:10.5rem;
      height:15rem;
      margin-left:3rem;
      margin-top:2rem;
      float:right;
      background-color:#DCDCDC;
  }
  .border {
      border-top:1px solid #000;
      margin-top:6rem;
      height:17rem;
  }
</style>