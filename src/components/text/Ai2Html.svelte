<script>
    export let file;
	$:html = '';
    
	fetch(`./${file}`)
        .then(resp => resp.text())
        .then(text => { html = text })
    
</script>

<section class="full">
{@html html}
</section>