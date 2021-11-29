<script>
    export let illo;
</script>
<section class='full-width'>
<img class='right-illo' src='./img/{illo}.png' alt='Abstract watercolor illustration'/>
</section>
<style>
    .right-illo {
        height:auto;
        width:60vw;
        float:right;
        padding-left:5rem;
    }
    @media screen and (min-width: 48rem) {
        .right-illo {
            width:40vw;
            padding-left:3rem;
        }
    }
</style>