const registry = {};
function noop() {};
function bfs(filename) {
	var section;
	
	var objs = [registry];
	
	while(objs.length) {		
		var nextObjs = [];
		
		for(var i = 0; i < objs.length; i++) {
			var obj = objs[i];
			if (section = (obj[filename]
				|| obj[filename+'.html'
				|| obj[filename+'.html.js']])
				&& typeof(section) === 'function') {
				return section;
			}
		
			Object.keys(obj).forEach(function (key) {
				nextObjs.push(obj[key]);
			});
		};
		objs = nextObjs;
	}
	
	return null;
	
}
const sections = {
	set(sectionname, section) {
		var dir = sectionname.split('/');
		var file = dir[dir.length-1];
		var reg = registry;
		for(var i = 0; i < dir.length-1; i++) {
			var directory = dir[i] + '__directory';
			if (!reg[directory]) {
				reg[directory] = {};
			}
			reg = reg[directory];
		}
		reg[file] = section;
	},
	get(sectionname) {
		console.log(registry);
		if (sectionname === '') {
			sectionname = 'master';
		}
		var dir = sectionname.split('/');
		var file = dir[dir.length-1];
		if (file === '') {
			file = 'master';
		}
		console.log("getting "+ file);
		var reg = registry;
		for(var i = 0; i < dir.length-1; i++) {
			console.log(dir[i]);
			if (dir[i] === '') {
				continue;
			}
			console.log('changing dir in registry');
			var directory = dir[i] + '__directory';
			if (!reg[directory]) {
				// Not found
				return noop;
			}
			reg = reg[directory];
		}
		console.log(reg);
		var section;
		if((section = reg[file] || reg[file+'.html'] || reg[file+'.html.js'])) {
			return section;
		};
		
		if (dir.length > 1) {
			// Not found
			return noop;
		}
		
		return bfs(file) || noop;
	}
};
module.exports = sections;