<script>
    export let text;
    export let head;

    let width, height;

    $: isSmall = width < 640;
    $: ratio = isSmall? 7641/841: 5010/2880;

    const pos = {
        s: [
            [0, 10],
            [0, 10],
            [0, 10],
            [0, 10],
            [0, 10],
            [0, 10]
        ],
        l: [
            [0, 10],
            [0, 10],
            [0, 10],
            [0, 10],
            [0, 10],
            [0, 10]
        ]
    }
</script>
<section class='full' bind:clientWidth={width}>
    <img class='full-width' src='./img/illos-{isSmall ? 's':'l'}.png' alt='Illustration of the different aspects of the economy where Corals are important'/>
    <div class='col-text' style='height: {width * ratio}px; margin-top: -{width * ratio}px'>
      {#if head}
      <h2 class='g-label'>{@html head}</h2>
      {/if}
      {#if text}
      {#each text as p,i}
          <p class='g-label' style='left:{isSmall ? pos.l[i][0]:pos.s[i][0]}%;top:{isSmall ? pos.l[i][1]:pos.s[i][1]}%'>{@html p.p}</p>
      {/each}
      {/if}
    </div>
</section>
<style>
    .g-label {
        position: absolute;
    }
    .col-text {
        position: relative;
    }
    .full-width {
        width: 100%;
    }

    p {
        max-width: 40rem;
    }
</style>
    