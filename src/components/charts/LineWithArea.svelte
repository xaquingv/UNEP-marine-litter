<script>
	import Axis from '../common/Axis.svelte';
	import PointInteractive from '../common/PointInteractive.svelte';
	import {line, area} from 'd3-shape';
	import {scaleTime, scaleLinear} from 'd3-scale';
	import {max, extent, bisector} from 'd3-array'
    
    export let data;
	export let margin = {top: 20, right: 5, bottom: 20, left: 5};
	export let options;
	let {key, format, color, layout, title, desc, curve } = options;

	let datum, w, height;

	$: width = w / 2;
		
	$: x = scaleTime()
		.domain(extent(data, d => d[key.x]))
		.range([margin.left, width - margin.right]);
	
	$: y = scaleLinear()
		.domain([0, .9])
		.range([height - margin.bottom - margin.top, margin.top]);

	$: path = line()
		.x(d => x(d[key.x]))
		.y(d => y(d[key.y]))
		.curve(curve);

    $: area1 = area()
		.x(d => x(d[key.x]))
		.y0(d => y(d[key.low1]))
		.y1(d => y(d[key.high1]))
		.curve(curve);

    $: area2 = area()
		.x(d => x(d[key.x]))
		.y0(d => y(d[key.low2]))
		.y1(d => y(d[key.high2]))
		.curve(curve);

	const mouseMove = (m) => {
		const mX = (m.offsetX) ? m.offsetX : m.clientX;
		const _data = [...data];
		_data.sort((a,b) => a[key.x] - b[[key.x]]);
		const index = x.invert(mX);
		const i = bisector(d => d[key.x]).center(_data, index);
		datum = _data[i];
	}

	const leave = (m) => {
		datum = null;
	}

</script> 

<div class='graphic {layout}' bind:clientWidth={w} bind:clientHeight={height}>
{#if w}
<svg xmlns:svg='https://www.w3.org/2000/svg' 
	viewBox='0 0 {width} {height}'
	{width}
	{height}
	role='img'
	aria-labelledby='title desc'
	on:touchmove|preventDefault
	on:pointermove|preventDefault={mouseMove}
	on:mouseleave={leave}
	on:touchend={leave}
	>
	<title id='title'>{title}</title>
	<desc id='desc'>{desc}</desc>
    <g>
		<path 
			d={area1(data)}
			fill={color}
            opacity={.25}
		/>
	</g>
    <g>
		<path 
			d={area2(data)}
			fill={color}
            opacity={.25}
		/>
	</g>
	<g>
		<path 
			d={path(data)}
			stroke={color}
            stroke-width={2.4}
			fill='none'
		/>
	</g>

	<Axis {width} {height} {margin} scale={y} position='left' format={format.y} />
	<Axis {width} {height} {margin} scale={x} position='bottom' format={format.x} />

	<PointInteractive {datum} {format} {x} {y} {key} {width} />
	
</svg>
{/if}
</div>

<style>
	.graphic { margin-top: 2rem;	}
</style>