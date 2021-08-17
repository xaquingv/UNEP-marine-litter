<script>
    import FlyP from './FlyP.svelte'
    export let text;

</script>

<section class='col-text'>
    <div class='big-text-wrapper'>
    {#if text}
    {#each text as p}
    <FlyP {p} />
    {/each} 
    {/if}
    </div>
</section>