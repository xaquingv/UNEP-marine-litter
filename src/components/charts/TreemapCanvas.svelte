<script>
	import { Canvas } from 'svelte-canvas'
	import { scaleLinear, scaleSqrt } from 'd3-scale'
	import Square from './Square.svelte'

	export let step = 0;
	export let layout;
    export let data;

	let width = 900;
    let height = 500;

    let r = .4;

    $: _step = step < 3 ? step : 2;

    $: s = height > width ? width * r : height * r;
    $: l = height > width ? width / 2 : width / 4 * 3

    $: x1 = scaleLinear()
        .domain([0,1])
        .range([0, s])
        .nice()

	$: y1 = scaleLinear()
        .domain([0,.35])
        .range([s, 0])
        .nice()

    $: x2 = scaleLinear()
        .domain([0,1])
        .range([0, width])
        .nice()

	$: y2 = scaleLinear()
        .domain([0,1])
        .range([height, 0])
        .nice()
	
</script>
<div class="canvas {layout}" bind:clientWidth={width} bind:clientHeight={height}>
    {#if width}
	<Canvas {width} {height}>
		{#each data as d}
            <Square 
				x={step === 2 ? x2(d.data[_step].x) : x1(d.data[_step].x) + l - s/2}
				y={step === 2 ? y2(d.data[_step].height) : y1(d.data[_step].y) + height/2 - s/2} 
				fill="#fffd55"
				height={step === 2 ? y2(d.data[_step].y) : y1(d.data[_step].height) - y1(d.data[_step].y)}
				width={step === 2 ? x2(d.data[_step].width) : x1(d.data[_step].width) + 1}
			/>
            <Square 
				x={step === 2 ? x2(d.data[_step].x) : l - s/2 - 4.5}
				y={step === 2 ? y2(1) : height/2 - s/2 - 5} 
				fill="#fffd5500"
                stroke="#ffffff66"
				height={step === 2 ? y2(0) : s + 10}
				width={step === 2 ? x2(d.data[_step].width) : s + 10}
			/>
		{/each}
	</Canvas>
    {/if}
</div>

<style>
    .canvas {
        position:relative;
        width: 100%;
        height: 100%;   
    }
</style>