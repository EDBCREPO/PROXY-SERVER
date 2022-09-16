const os = require('os');
const url = require('url');
const http = require('http');
const cluster = require('cluster');
const {Buffer} = require('buffer');
const fetch = require('molly-fetch');
const worker = require('worker_threads');

/*-------------------------------------------------------------------------------------------------*/

const threads = os.cpus().length * 2;
const size = Math.pow(10,6) * 3;
const PORT = 4000; 

/*-------------------------------------------------------------------------------------------------*/

function parseRange( range ){
    const interval = range.match(/\d+/gi);
    const chunk = Number(interval[0])+size;
    return interval[1] ? range : range+chunk;
}

/*-------------------------------------------------------------------------------------------------*/

function app(req,res){
    try {

        console.log( req.url );
        
        const _url = req.url; const p = url.parse(_url,true);
        const q = p.query; const data = new Array();
    
        const options = new Object();
              options.url = req.url;
              options.headers = req.headers; 
              options.responseType = 'stream';
              options.method = req.method || 'GET';
    
        if( req.headers.range ) options.headers.range = parseRange(req.headers.range);

        fetch(options).then((response)=>{
            res.writeHead( response.statusCode,response.headers );
            response.pipe( res );
        }).catch((reject)=>{
            res.writeHead(504,{'Content-Type': 'text/html'});
            res.end('error');
        })
          
    } catch(e) {
        res.writeHead(504,{'Content-Type': 'text/html'});
        res.end(`error: ${e?.message}`);
        console.log(e?.message);
    }
}

/*-------------------------------------------------------------------------------------------------*/

if ( cluster.isPrimary ) {
    for ( let i=threads; i--; ) { cluster.fork();
    } cluster.on('exit', (worker, code, signal)=>{ cluster.fork();
        console.log(`worker ${worker.process.pid} died by: ${code}`);
    });
} else {
    http.createServer(app).listen(PORT,'0.0.0.0',()=>{
        if( !worker.isMainThread ) worker.parentPort.postMessage('done');
    });
}

/*-------------------------------------------------------------------------------------------------*/