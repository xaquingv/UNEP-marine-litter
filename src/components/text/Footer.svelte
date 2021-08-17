<script>
    export let text;
    export let head;
    </script>
    <div class="full blue">
    <section class='col-text'>
      {#if head}
      <h3>{@html head}</h3>
      {/if}
      {#if text}
      {#each text as p,i}
          <p class='{i > 0 ? '' : 'has-dropcap'}'>{@html p.p}</p>
      {/each}
      {/if}
      <img class='small-image' src='img/small-illos-04.png' alt='Abstract watercolor as an illustration for the the text below'/>
    </section>
    </div>
    <style>
      .has-dropcap:first-letter {
        float: left;
        font-weight: 700;
        font-size: 6.4rem;
        line-height: 0.65;
        margin: 0.1em 0.1em 0.1em 0;
      }
      .blue {
          color: #FFF;
          background-color: #00abf1;
          margin: 4rem 0;
          padding-top: 4rem;
      }
      .small-image {
          height:15rem;
          margin-bottom: -1rem;
          transition: all .3s;
      }
    </style>