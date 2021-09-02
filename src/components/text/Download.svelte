<script>
export let head;
export let cover;
export let resources;
export let other;
</script>

<section class='col-text border'>
  <img src="./img/{cover}.png" alt="Cover of the report"/>
  <h4>{@html head}</h4>
  <section>
  <h4>{@html other}</h4>
  <ul>
  {#each resources as r}
  <li class='label'><a href='./graphics/{r.link}' target='_blank'>{r.label}</a></li>
  {/each}
  </section>
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