const {Buffer} = require('buffer');
const fetch = require('axios');
const url = require('url');
const fs = require('fs');

const headers = {
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

/* --------------------------------------------------------------------------*/

function decrypt( data ){
    const obj = data.split('').reverse().join('');
    return Buffer.from( obj,'base64' ).toString();
}

/* --------------------------------------------------------------------------*/

const strategy = new Array();

(()=>{

    strategy.push(async(data,id)=>{

        if( !(/voe-network/i).test(data) )
            return undefined

        let _720 = data.match(/"hls": "[^"]+/gi).join('')
            _720 = _720.split('"').pop();

        let _480 = data.match(/"mp4"[^;]+/gi).join('');
            _480 = _480.match(/\[[^\]]+/).join('');
            _480 = _480.replace(/\[|'|,/gi,'');
            _480 = decrypt(_480);

        return [{
                label: '480p',
                type: 'mp4',
                file: _480,
            },{
                label: '720p',
                type: 'hls',
                file: _720,
        }];

    });
    
    strategy.push(async(data,id)=>{
        const res = await URL( `https://embedsito.com/api/source/${id}`,
            { method:'POST', data:'', headers: headers },
        );  return res.data.data;
    });
    
})();

/* --------------------------------------------------------------------------*/

module.exports = async( _url )=>{
    try{

        const prsd = url.parse(_url,true);
        const res = await URL( 'https://gcs.megaplay.cc/r.php',{
            data: `h=${prsd.query.h}`, method: 'POST', headers: headers
        });     const id = res.url.split('/').pop(); const {data} = res;

        for( i in strategy ){
            const str = await strategy[i](data,id);
            if( typeof str=='object' ) return str;
        }   return 'not found';

    } catch(e) { console.log(e); }
}