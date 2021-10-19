import App from './App.svelte';
import storyEN from './data/story-en.json'
// import storyES from './data/story-es.json'
import storyFR from './data/story-fr.json'
// import storyID from './data/story-id.json'
import storyAR from './data/story-ar.json'
import storyRU from './data/story-ru.json'
import storyZH from './data/story-zh.json'
import storySW from './data/story-sw.json'
// import storyPT from './data/story-pt.json'

const params = new URLSearchParams(window.location.search);
const langs = ['EN', 'ES', 'FR', 'ID', 'PT', 'RU', 'ZH', 'AR', 'SW'];
const lang = (params.has('lang') && langs.some(l => params.get('lang') === l))?params.get('lang'):'EN';

const url = {
  EN:storyEN,
//   ES:storyES,
  FR:storyFR,
//   ID:storyID,
//   PT:storyPT,
  RU:storyRU,
  ZH:storyZH,
  AR:storyAR,
  SW:storySW
}

const json = url[lang]
const content = json.article;
const menu = json.menu;
const meta = json.meta;
const intro = json.intro;
meta.lang = lang.toLowerCase();

const app = new App({
  target: document.body,
  props: {
    content: content,
    meta: meta,
    intro: intro,
    lang: lang.toLowerCase(),
    menu: menu
  }
});

export default app;