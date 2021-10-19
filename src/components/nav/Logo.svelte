<script>
	export let placement;
	export let alt
	export let lang;
	export let align;
</script>

<a href='https://www.unep.org/{lang === 'id' || lang === 'en' ? '' : lang}'>
<img class='logo {placement} {align}'
	src='./img/logo-{lang === 'id' || lang === 'pt' || lang === 'sw' ? 'en' : lang}.svg'
	{alt}
	/>
</a>
<style>

	.below {
		height: 3rem!important;
		transition: height .5s;
	}

	.logo { height: 3rem;}

	.right {
		float: right;
		padding-right:2rem;
	}

	a {
		text-decoration: none;
		border: none;
	}

	a:hover { opacity: 1;}

	@media screen and (min-width: 64rem) {

		.logo { height: 5rem;}

	}

</style>