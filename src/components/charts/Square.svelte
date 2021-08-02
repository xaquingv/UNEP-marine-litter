<script>
	import { Layer } from 'svelte-canvas'
	import { tweened } from 'svelte/motion';
	import { quadOut, cubicOut } from 'svelte/easing';

	export let x = 0;
	export let y = 0;
	export let width = 1; 
	export let height = 1;
	export let fill = "black"; 
	export let stroke = null; 
	
    const _x = tweened(x, { duration: 600, easing:quadOut});
    const _y = tweened(y, { duration: 600, easing:quadOut});
	const _width = tweened(width, { duration: 600, easing:cubicOut});
	const _height = tweened(height, { duration: 600, easing:cubicOut});

    $: _x.set(x);
    $: _y.set(y);
	$: _width.set(width);
	$: _height.set(height);
	
	$: render = ({ context }) => {
		context.fillStyle = fill;
		context.beginPath();
		context.rect($_x, $_y, $_width, $_height);
		context.lineWidth = .5;
		context.strokeStyle = stroke;
		context.stroke();
		context.fill();
	}
</script>

<Layer {render} priority={stroke && 1} />