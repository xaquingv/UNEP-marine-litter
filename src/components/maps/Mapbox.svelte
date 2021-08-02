<script>
    import { Map, Geocoder, Marker, controls } from '@beyonk/svelte-mapbox'
    export let options;
    export let flyTo;

	let {steps, layout, title, desc, style } = options;
    let map;
    const { GeolocateControl, NavigationControl, ScaleControl } = controls;
    options.showCompass = false;

    $:if(map) { map.flyTo(flyTo ? flyTo : [0,0]) }

</script>

<div class='{layout} mapbox'>

    <Map
        {style}
        bind:this={map}
        {options}
    >
    <!-- <NavigationControl {options} /> -->
    </Map>

</div>

<style>
    :global(.mapboxgl-ctrl-group){
        box-shadow: rgba(0,0,0,.2) 1px 1px 9px!important;
    }
	.mapbox {
		height:100vh;
	}
</style>