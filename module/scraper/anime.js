
const fs = require('fs');
const url = require('url');
const fetch = require('axios');
const cheerio = require('cheerio');

module.exports = async ( _path )=>{

	let regex = /eval(^script)+/gi;
	let url,res,$;
	let code = '';
	let unp = '';
	url = _path;

	// TODO: URL Correction //
	if( (/emb\.html/gi).test(url) ){
		let id = url.match(/\?[^=]+/gi).toString();
			id = id.replace('?','');
		url = `https://fastream.to/embed-${id}.html`;
	}
		
	// TODO: segunda redireccion //
	res = await fetch({ url: url,method: 'GET' });
	$ = cheerio.load( res.data );
	let obj = Array.from($('script')).forEach((x)=>{
		try{ if( (/p,a,c,k,e,d/).test(x.children[0].data) )
			code = x.children[0].data.replace('return p','unp+=`${p} `');
		} catch(e) {}
	}); eval( code );

	return unp.match(/file:[^\}]+/gi)[0].replace(/file:|'|"| /gi,'');
}