<script>
    import {scaleLinear} from 'd3-scale';
    import Video from './Video.svelte'
    export let scrollY;
    export let domain;

    let duration, time;

    $:frame = scaleLinear()
        .domain(domain)
        .range([0, duration]);

    $:time = frame(scrollY)

</script>

<div class='video-wrapper'>
    <Video 
      bind:time
      bind:duration
      noscroll={false}
      src='video/tide.mp4'
      layout='cover' />
</div>