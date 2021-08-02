const fs = require("fs");
const archieml = require("archieml");
global.fetch = require('node-fetch')
const { csv, text } = require('d3-fetch');

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

const parseGDocs = async () => {

	for (let d of gdocs) {
		const json = await fetchGDocs(d);
		const file = `${process.cwd()}/${d.dest}`;
		fs.writeFileSync(file, JSON.stringify(json));
	}
};

parseGDocs();