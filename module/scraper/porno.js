const fetch = require('axios');

// TODO: main ---------------------------------------------- //

module.exports = async ( _path )=>{
	
	let regex = /Playerjs\([^\(\)]+\);/gi;
	let {data} = await fetch.get( _path );
		 data = data.match(regex);
		 data = data[0].replace(/(\n| )+/g,'');
		 data = `{${data.slice(10,data.length-4)}}`;
	
	const obj = JSON.parse(data);
		 obj.file = obj.file.replace(/240p|360p|HD|\[|\]/gi,'')
		 obj.file = obj.file.split(',');

	const res = obj.file.map((x,i)=>{

		let label = '1080p'; switch(i){
			case 0: label='240p'; break;
			case 1: label='360p'; break;
			case 2: label='720p'; break;
		}

		return {
			label: label,
			type: 'mp4',
			file: x,
		}
		
	});

	return [ res[res.length-1] ]; // res;
}
