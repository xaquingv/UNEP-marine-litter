<script>
    export let illo;
    export let align;
    const margin = () => {
        switch (align) {
            case 'left':
            return 'text-align:left';
            case 'right':
            return 'text-align:right';
            case 'center':
            return 'text-align:center';
        }
    }
</script>
<section class='full-width' style={margin()}>
<img class='small-image' src='./img/{illo}.png' alt='Abstract watercolor illustration'/>
</section>
<style>
    .small-image {
        height:15rem;
    }
</style>