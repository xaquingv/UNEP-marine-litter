<script>
    export let choices;
    export let selected;
    
</script>
<div class="select-wrapper">
    <div class="select bg-text">
        <select bind:value={selected} on:change >
            <option value="" selected disabled>Choose a region</option>
            {#each choices as choice}
            <option value='{choice}'>{choice.region}</option>
            {/each}
        </select>
        <span class="focus"></span>
    </div>
</div>

<style>
    *,
    *::before,
    *::after {
    box-sizing: border-box;
    }

    :root {
        --select-border: #FFF;
        --select-focus: blue;
        --select-arrow: var(--select-border);
    }

    .select-wrapper {
        display: inline-block;
    }

    select {
        appearance: none;
        background-color: transparent;
        border: none;
        padding: 0 1em 0 0;
        margin: 0;
        width: 100%;
        cursor: inherit;
        color: var(--select-border);
    }

    select::-ms-expand {
        display: none;
    }

    .select {
        width: 100%;
        min-width: 15ch;
        max-width: 30ch;
        /* border-top: 1px solid rgba(255,255,255,.2);
        border-right: 1px solid rgba(255,255,255,.2);
        border-left: 1px solid rgba(255,255,255,.2); */
        border-bottom: 2px solid var(--select-border);
        border-radius: 2px;
        cursor: pointer;
        background-color: rgba(0,0,0,.3);
        display: grid;
        grid-template-areas: "select";
        align-items: center;
        position: relative;
        outline: none;
    }

    .select::after {
        content: "";
        width: 1rem;
        height: .5rem;
        background-color: var(--select-arrow);
        clip-path: polygon(100% 0%, 0 0%, 50% 100%);
        justify-self: end;
    }
    select,.select:after {
        grid-area: select;
    }
</style>