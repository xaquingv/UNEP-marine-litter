<script>
    export let text;
    export let head;
    </script>
    <div class="full blue">
    <section class='col-text well'>
      {#if head}
      <h3>{@html head}</h3>
      {/if}
      {#if text}
      {#each text as p,i}
          <p class='third'>{@html p.p}</p>
      {/each}
      {/if}
      <img class='small-image' src='img/small-illos-04.png' alt='Abstract watercolor as an illustration for the the text below'/>
    </section>
    </div>
    <style>
      .blue {
        color: #FFF;
        background-color: #00abf1;
        margin: 4rem 0;
        padding-top: 4rem;
      }
      .small-image {
        height:15rem;
        transition: all .3s;
        position:absolute;
        bottom:0;
      }
      .third {
        font-size: 1rem;
        display: block;
        height: auto!important;
      }
      .well { 
        width: 100%;
        padding-bottom:6rem;
      }
      @media screen and (min-width: 48rem) {
        .well { 
          width: 64rem;
          padding-right:0;
          padding-bottom:6rem;
        }
        .third {
          width:30%;
          padding-right:2rem;
          display: inline-block;
          vertical-align: top;
          font-size: 1rem;
        }
      }
    </style>