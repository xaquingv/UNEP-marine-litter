<script>
    export let text;
    export let head;

    const logos = [
      'un-logo.svg',
      'clean.svg',
      'gpml.png',
    ]
    </script>
    <div class="full blue">
    <section class='col-text well'>
      {#if head}
      <h3>{@html head}</h3>
      {/if}
      {#if text}
      {#each text as p,i}
        <div class='third'>
          {#if i < 3}
          <img class='logo' src='./img/{logos[i]}' alt="Global Partnership Marine Litter, Cleans Seas and UNEP 50 logos"/>
          {/if}
          <p>{@html p.p}</p>
        </div>
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
        position:relative;
        width:100%;
      }
      .well { 
        width: 100%;
        padding-bottom:6rem;
      }
      .logo { 
        height: 5rem;
        width:auto;
        display: block;
        padding-left:1rem;
      }
      p {
        font-size: 1rem; 
      }
      :global(.subhead) {
        font-size: 1.2rem;
        font-weight: 500;
      }
      @media screen and (min-width: 64rem) {
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
          margin-bottom:3rem;
        }

        .logo { 
          left:0;
          padding-left:0;
        }
      }
    </style>