<script>
export let head;
export let cover;
export let resources;
export let other;
export let downloadlink;
export let further;
export let furtherlink;
</script>

<section class='col-text border'>
  <a class='img_link' href={downloadlink}><img src="./img/{cover}.png" alt="Cover of the report"/></a>
  <h4><a href={downloadlink}>{@html head}</a></h4>
  <section>
  {#if resources}
  <h4>{@html other}</h4>
  <ul>
    {#each resources as r}
    <li class='label'><a href='./graphics/{r.link}' target='_blank'>{r.label}</a></li>
    {/each}
  </ul>
  {/if}
  <h4><a href={furtherlink}>{@html further}</a></h4>
  </section>
</section>

<style>
  img {
      width:10.5rem;
      height:15rem;
      margin-left:3rem;
      margin-top:2rem;
      margin-bottom:2rem;
      float:right;
      background-color:#DCDCDC;
  }
  .img_link {
    border:none;
  }
  .border {
      border-top:1px solid #dcdcdc;
      margin-top:6rem;
  }
  .label {
    font-size: 1rem;
    color:#000;
    margin-top:0;
  }
  ul { 
    margin-top: .8rem;
    margin-left: 0;
    padding-left:0;
    list-style-position: inside;
  }
  ul li { margin: .8rem; }
</style>