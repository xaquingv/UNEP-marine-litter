import App from './App.svelte';
import storyEN from './data/story-en.json'
// import storyES from './data/story-es.json'
// import storyFR from './data/story-fr.json'
// import storyID from './data/story-id.json'
// import storyAR from './data/story-ar.json'
// import storyRU from './data/story-ru.json'
// import storyZN from './data/story-zn.json'
// import storyPT from './data/story-pt.json'

const params = new URLSearchParams(window.location.search);
const langs = ['EN', 'ES', 'FR', 'ID', 'PT', 'RU', 'ZN', 'AR'];
const lang = (params.has('lang') && langs.some(l => params.get('lang') === l))?params.get('lang'):'EN';

const url = {
  EN:storyEN,
//   ES:storyES,
//   FR:storyFR,
//   ID:storyID,
//   PT:storyPT,
//   RU:storyRU,
//   ZN:storyZN,
//   AR:storyAR
}

const json = url[lang]
const content = json.article;
const meta = json.meta;
const intro = json.intro;
meta.lang = lang.toLowerCase();

const app = new App({
  target: document.body,
  props: {
    content: content,
    meta: meta,
    intro: intro,
    lang: lang
  }
});

export default app;