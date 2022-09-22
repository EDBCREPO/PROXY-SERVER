const fetch = require('molly-fetch');

fetch("http://www.google.com",{
    proxy: {
        host: '127.0.0.1',
        protocol: 'http',
        port: 3000,
    }
})

.then((res)=>{
    console.log( res )
})

.catch((rej)=>{
    console.log(rej)
})