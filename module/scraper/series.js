const cp = require('child_process');
const fetch = require('axios');
const url = require('url');
const fs = require('fs');

// TODO: function -------------------------------------------//

const headers = {
    'referer': 'https://player.pelisgratishd.io/',
    'authority': 'player.pelisgratishd.io',
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

async function optionA( data ){
	const server = data.match(/go_to_player\(\'[^']+/gi).map((url)=>{
				   url = url.replace(/playerdir\/|direct\//gi,'h?');
				   url = url.replace(/go_to_player\(\'/gi,'');
		if( !(/http/i).test(url) ) 
			return `https://player.pelisgratishd.io${url}`;
		else 
			return url;
	});

	for( var i in server ){

		let data; const srv = server[i]; //console.log( srv );

		if( (/\?h=/i).test(srv) )
			data = await require('./strategy/megaplay')(srv);
		if( typeof data == 'object' ){
			return data; break;
		}

	}
}

function optionB( data ){ /*fs.writeFileSync( 'ppt',data )*/ }

// TODO: main ---------------------------------------------- //

async function servers( _url,_i=0 ){

    const {data} = await URL( _url );

	if( (/2embed/).test(_url) )
		return await optionB( data ); 
	else
		return await optionA( data ); 

}


// TODO: main ---------------------------------------------- //

module.exports = async ( _path )=>{
	
	let $,res,data;
	
	// TODO: primera redireccion
    const raw = await URL( _path, {headers: headers} );
	data = raw.data.match(/var s = {[^\}]+};/gi).toString();
	data = data.match(/https[^"]+/gi)[0];

	// TODO: segunda redireccion
	return await servers( data );

}
