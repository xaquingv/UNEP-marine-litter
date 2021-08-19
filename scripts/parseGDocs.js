const fs = require("fs");
const archieml = require("archieml");
global.fetch = require('node-fetch')
const { csv, text } = require('d3-fetch');
const _ = require('lodash');
const json2md = require("json2md")

const config = `${process.cwd()}/gdocs.json`;
const gdocs = JSON.parse(fs.readFileSync(config, "utf8"));

const fetchGDocs = async ({ id, gid }) => {
	
	const base = "https://docs.google.com";
	let data;

	if (gid) {
		const file = `spreadsheets/u/1/d/${id}/export?format=csv&id=${id}&gid=${gid}`
		const url = `${base}/${file}`;
		data = await csv(url);

	} else {
		const file = `document/d/${id}/export?format=txt`
		const url = `${base}/${file}`;
		const res = await text(url);
		data = archieml.load(res);

	}

	return data;
};

const textToMd = (json) => {
	const article = json.article;
	const allowed = ['head', 'text'];
	const article_tmp = article
		.map( d => _.pick(d, allowed))
		.filter(value => Object.keys(value).length !== 0);

	const filtered_tmp = flattenObject(article_tmp)
	const filtered_keys = filterKeys(filtered_tmp, /head|p/)
	const filtered = _.pick(filtered_tmp, filtered_keys)
	const md = Object.entries(filtered)
		.map(([key,value]) => {
			let o = {};
			let rgx = /head/
			if (rgx.test(key)) o['h2'] = value
			else o['p'] = value
			return o
		})

	return json2md(md);
}

const parseGDocs = async () => {

	for (let d of gdocs) {
		const json = await fetchGDocs(d);
		const json_dest = `${process.cwd()}/${d.dest}.json`;
		const md_dest = `${process.cwd()}/${d.dest}.md`;
		const md = textToMd(json);
		fs.writeFileSync(json_dest, JSON.stringify(json));
		fs.writeFileSync(md_dest, md);
	}
};

const flattenObject = (obj, parent, res = {}) => {
    for(let key in obj){
        let propName = parent ? parent + '_' + key : key;
        if(typeof obj[key] == 'object'){
            flattenObject(obj[key], propName, res);
        } else {
            res[propName] = obj[key];
        }
    }
    return res;
}

const filterKeys = (obj, filter) => {
	let key, keys = []
	for (key in obj)
	  if (obj.hasOwnProperty(key) && filter.test(key))
		keys.push(key)
	return keys
  }

parseGDocs();