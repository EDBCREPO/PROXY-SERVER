
const cp = require('child_process');
const cheerio = require('cheerio');
const fetch = require('axios');
const url = require('url');

// TODO: main ---------------------------------------------- //

const headers = {
    'referer': 'https://www.ennovelas.com/',
    'authority': 'www.ennovelas.com',
    'sec-fetch-site': 'same-origin',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-dest': 'iframe',
    'sec-ch-ua-mobile': '?0',
    'sec-fetch-user': '?1'
};

// TODO: main ---------------------------------------------- //

async function URL( _url,_cfg=undefined ){
	
    const conf = { headers:headers, method:'GET', url:_url };
    if( _cfg ) Object.keys( _cfg ).map(x=>{ conf[x] = _cfg[x] });
            
    const raw = await fetch( conf ); const { request,data } = raw;
    const { host } = url.parse( request.res.responseUrl );
    const path = request.res.responseUrl;
        
    return {
        req: request,
        data: data,
        path: host,
        url: path,
        raw: raw,
    }
        
}

// TODO: main ---------------------------------------------- //

module.exports = async (_path)=>{
 
	let $,res,data;

	// TODO: primera redireccion
    const raw = await URL( _path,{ headers: headers } );
	data = raw.data.match(/sources:[^\]]+,/gi).join('');
	data = data.match(/https[^"]+/gi).join('');

	// TODO: segunda redireccion
	return [{
        label: '480p',
        type: 'mp4',
        file: data,
    }];

};