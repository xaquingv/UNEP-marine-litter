<script>
  import Logo from '../nav/Logo.svelte'
  let y, width, height, submenu;

  $: placement = (y > height * 3.6)? 'below': '';
  $: desktop = (width > 640 && height < width);
  const lang = [
    {id: 'EN', name: 'English'},
    {id: 'ES', name: 'Español'},
    {id: 'FR', name: 'Français'},
    {id: 'ZN', name: '简体中文'},
    {id: 'AR', name: 'العربية'},
    {id: 'RU', name: 'Русский'},
    {id: 'PT', name: 'Português'},
    {id: 'ID', name: 'Bahasa Indonesia'}
  ]
</script>

<svelte:window bind:scrollY={y} bind:innerWidth={width} bind:innerHeight={height}/>
<nav class={placement}>
    <Logo 
    alt='UNEP logo'
    {placement}/>
    <ul>
      {#each lang as l}
      {#if desktop}
      <li><a href="?lang={l.id}">{l.name}</a></li>
      {:else}
      <li><a href="?lang={l.id}">{l.id}</a></li>
      {/if}
      {/each}
      {#if desktop}
      <li class="download"><a>Download report</a></li>
      {:else}
      <li class="download"><a>Download</a></li>
      {/if}
    </ul>
</nav>

<style>
  nav {
    width:100%;
    padding:1rem;
    position:fixed;
    top:0;
    z-index: 100;
    height: 3rem;
  }
  .below {
    background-color: #1E1E1E;
    transition: background-color .5s;
    color:#FFF;
  }
  ul { 
    float: right;
    padding-right: 1rem;
    margin-top: .35rem!important;
  }
  li { 
    list-style-type: none;
    display: inline-block;
    margin-left: 0 0 0 1rem;
    padding: 0 0 0 1rem;
    font-size: 1rem;
  }
  li a { border: none; }

  .below .download { border: 2px solid #FFF; }
  .download {
    border: 2px solid #000;
    border-radius: 100rem;
    height: 1.6rem;
    margin-left:1rem;
    padding:.5rem .7rem 0 .7rem;
    cursor: pointer;
  }
</style>