<script>
    import Scroller from '@sveltejs/svelte-scroller'
    import Mapbox from '../maps/Mapbox.svelte'
    import Select from '../ui/Select.svelte'
    import {group} from 'd3-array'
    import data from '../../data/corals.json'
    import LineWithArea from '../charts/LineWithArea.svelte'
    import TreemapCanvas from '../charts/TreemapCanvas.svelte'
    import {curveMonotoneX} from 'd3-shape'
    import locale from '@reuters-graphics/d3-locale';

    export let type;
    export let text;

    let selected = null, width, height, count;
    $: index = index < count ? index : count - 1;

    const _data = group(data, d => d.region);
    let __data;

    const loc = new locale('en');
    const format = {
      x: loc.formatTime('%Y'),
      y: loc.format('.2%'),
    }

    const regions = [{"data":[{"x":0,"y":0,"width":0.301456736589449,"height":0.3234},{"x":0,"y":0,"width":0.301456736589449,"height":0.2951671244},{"x":0,"y":0,"width":0.301456736589449,"height":0.3679205147}],"region":"East Asia","center":[106.5257,8.7033336],"zoom":3.5},{"data":[{"x":0.301456736589449,"y":0,"width":0.26737962189064163,"height":0.3234},{"x":0.301456736589449,"y":0,"width":0.26737962189064163,"height":0.2951671244},{"x":0.301456736589449,"y":0,"width":0.26737962189064163,"height":0.3134879017}],"region":"Pacific","center":[170,0],"zoom":3},{"data":[{"x":0.5688363584800906,"y":0,"width":0.16099686249436518,"height":0.3234},{"x":0.5688363584800906,"y":0,"width":0.16099686249436518,"height":0.2951671244},{"x":0.5688363584800906,"y":0,"width":0.16099686249436518,"height":0.2604909652}],"region":"Australia","center":[130.7217919,-20.9728474],"zoom":4},{"data":[{"x":0.7298332209744558,"y":0,"width":0.10166660649644166,"height":0.3234},{"x":0.7298332209744558,"y":0,"width":0.10166660649644166,"height":0.2951671244},{"x":0.7298332209744558,"y":0,"width":0.10166660649644166,"height":0.1590127693}],"region":"Caribbean","center":[-87.8231868,17.4254416],"zoom":4},{"data":[{"x":0.8314998274708975,"y":0,"width":0.05846242340795382,"height":0.3234},{"x":0.8314998274708975,"y":0,"width":0.05846242340795382,"height":0.2951671244},{"x":0.8314998274708975,"y":0,"width":0.05846242340795382,"height":0.293704075}],"region":"WIO","center":[32.782222,-15],"zoom":4},{"data":[{"x":0.8899622508788513,"y":0,"width":0.052401749968165934,"height":0.3234},{"x":0.8899622508788513,"y":0,"width":0.052401749968165934,"height":0.2951671244},{"x":0.8899622508788513,"y":0,"width":0.052401749968165934,"height":0.3427597966}],"region":"PERSGA","center":[32.9858496,17.4160796],"zoom":4},{"data":[{"x":0.9423640008470172,"y":0,"width":0.042170171428524084,"height":0.3234},{"x":0.9423640008470172,"y":0,"width":0.042170171428524084,"height":0.2951671244},{"x":0.9423640008470172,"y":0,"width":0.042170171428524084,"height":0.2333483474}],"region":"South Asia","center":[69.3251427,5.4793476],"zoom":4},{"data":[{"x":0.9845341722755413,"y":0,"width":0.0077382699667291055,"height":0.3234},{"x":0.9845341722755413,"y":0,"width":0.0077382699667291055,"height":0.2951671244},{"x":0.9845341722755413,"y":0,"width":0.0077382699667291055,"height":0.1793396466}],"region":"ROPME","center":[50.7443035,25.7265752],"zoom":5},{"data":[{"x":0.9922724422422704,"y":0,"width":0.004722920040834744,"height":0.3234},{"x":0.9922724422422704,"y":0,"width":0.004722920040834744,"height":0.2951671244},{"x":0.9922724422422704,"y":0,"width":0.004722920040834744,"height":0.2059002472}],"region":"Brazil","center":[-61.4224958,-8.8249506],"zoom":4},{"data":[{"x":0.9969953622831051,"y":0,"width":0.0030046377168948535,"height":0.3234},{"x":0.9969953622831051,"y":0,"width":0.0030046377168948535,"height":0.2951671244},{"x":0.9969953622831051,"y":0,"width":0.0030046377168948535,"height":0.2282765995}],"region":"ETP","center":[-110.4436328,13.9092565],"zoom":5}] 
    
    const handleSelect = () => {
        __data = _data.get(selected.region)
    }

    console.log(data.filter(d => d.year === 1978).map(d => ([d.region, d.value])))

</script>

<section class='full {type}' bind:clientHeight={height} bind:clientWidth={width}>
    <Scroller
        top={0}
        bottom={1}
		    bind:index
        bind:count
        >

      <div slot='background'>
          <div class='video-wrapper'>
            <div class='slide' style='opacity:{index < 3 ? 1 : 0}'>
            <TreemapCanvas
                data={regions}
                step={index}
                layout='full'
             />
            </div>
            <div class='slide' style='opacity:{index === 3 ? 1 : 0}'>
            <Mapbox 
            flyTo={selected}
            options={
                {
                    style:'mapbox://styles/xocasgv/cko4f0ivr160j17qbfzqtcu87',
                    scrollZoom:false,
                    center: [0,0],
                    zoom: 2,
                    steps:regions,
                    accessToken:'pk.eyJ1IjoieG9jYXNndiIsImEiOiI0eDhKVHlZIn0.YdtRFZW4yC0tSdoXoTgGUA',
                    layout:'full'
                }}
            />
            </div>
          </div>
      </div>

      <div slot='foreground'>
            {#each text as p,i}
            <section class='step'>
                
                {#if i === 3}
                <h3 class='narrow'><span class='bg-text'>{@html p.p}</span>
                <Select choices={regions} bind:selected on:change={handleSelect} />
                </h3>
                {#if __data}
                <LineWithArea 
                    data={__data} 
                    options={{
                        key:{x: 'year', y: 'value', low1: 'lower_80', high1: 'upper_80', low2: 'lower_95', high2: 'upper_95'},
                        format:format,
                        color:'#fffd55',
                        layout:'narrow', 
                        curve:curveMonotoneX
                    }}
                />
                {/if}
                {:else}
                <h3 class='narrow'><span class='bg-text'>{@html p.p}</span></h3>
                {/if}
            </section>
            {/each}
      </div>

    </Scroller>
</section>

<style>
  .diagram {
		background-color: #001ca0;
	}
  .slide {
      position: absolute;
      width: 100vw;
      height: 100%;
      transition: opacity 1s;
  }
  .step { 
    height: 80vh;
    padding-top: 20vh;
    color:white;
    margin-left: 1rem;
    margin-right: 1rem;
  }
  .video-wrapper{
    width: 100%;
    height: 100vh;
    background-color: #001ca0;
  }
  .header { padding: 4rem 0; }
  .bg-text { 
    background-color: rgba(0,0,0,.3);
    padding: 0.08rem 0;
  }
  @media screen and (min-width: 48rem) {
    .step { 
      margin-left: 0;
      margin-right: 0;
    }
  }
</style>