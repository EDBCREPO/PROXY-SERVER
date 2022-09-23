
const worker = require('worker_threads');
const fetch = require('molly-fetch');
const {Buffer} = require('buffer');
const cluster = require('cluster');
const http = require('http');
const url = require('url');
const os = require('os');

/*-------------------------------------------------------------------------------------------------*/

const size = Math.pow(10,6) * 3;
const threads = os.cpus().length * 2;
const PORT = process.env.PORT || 3000; 

/*-------------------------------------------------------------------------------------------------*/

function parseRange( range ){
    const interval = range.match(/\d+/gi);
    const chunk = Number(interval[0])+size;
    return interval[1] ? range : range+chunk;
}

/*-------------------------------------------------------------------------------------------------*/

function app(req,res){
    try {
        
        const _url = req.url; const p = url.parse(_url,true);
        const q = p.query; const data = new Array();
    
        const options = new Object();
              options.headers = req.headers; 
              options.url = q.url || req.url;
              options.responseType = 'stream';
              options.method = req.method || 'GET';
    
        if( req.headers.range ) options.headers.range = parseRange(req.headers.range);
        if( !options.url.match(/http.+/gi) ){
            res.writeHead( 200,{'content-type':'text/plain'} );
            return res.end('send an url');
        };  options.url = options.url.match(/http.+/gi).join('');

        fetch(options).then((response)=>{
            res.writeHead( response.status,response.headers );
            response.data.pipe( res );
        }).catch((reject)=>{ console.log(reject?.message)
            res.writeHead(504,{'Content-Type': 'text/html'});
            try{ reject.data.pipe( res ) } catch(e) { res.end('') }
        })
          
    } catch(e) {
        res.writeHead(504,{'Content-Type': 'text/html'});
        res.end(`error: ${e?.message}`);
    }
}

/*-------------------------------------------------------------------------------------------------*/
/*
(()=>{
    setInterval(()=>{
        fetch('https://proxyserver-arepatv.herokuapp.com/')
        .then(()=>{}).catch((e)=>{ console.log(e) })
    },1000*60*5);
})();
*/
/*-------------------------------------------------------------------------------------------------*/

try{
    if ( cluster.isPrimary ) {
        for ( let i=threads; i--; ) { cluster.fork();
            console.log({ protocol: 'HTTP', processID: process.pid, port: PORT });
        } cluster.on('exit', (worker, code, signal)=>{ cluster.fork();
            console.log(`worker ${worker.process.pid} died by: ${code}`);
        });
    } else { http.createServer(app).listen(PORT,'0.0.0.0',()=>{}); }
} catch(e) {
    http.createServer(app).listen(PORT,'0.0.0.0',()=>{});
}

/*-------------------------------------------------------------------------------------------------*/