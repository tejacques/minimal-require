var sections = require('./sections');
var fs = require('fs');
var watch = require('node-watch');
var reload = require('require-reload')(require);
var dir = require('node-dir');
var path = require('path');

var re = /\.html\.js$/;
function loadSection(filename) {
	if (!re.test(filename)) {
		return;
	}
	console.log('Reloading '+filename);
	var module = './'+filename;
	var sec = reload(module);
	console.log('module: ', module);
	sections.set(filename, sec);
}
watch('.', function(path) {
	loadSection(path.substr(6));
});
dir.paths('views/', function(err, paths) {
	console.log('paths:\n',paths);
	paths.files.forEach(function(path) {
		console.log('path: ',path);
		loadSection(path.substr(6));
	});
})

module.exports = function(view) {
	return function(req, res) {
		console.log("Looking for view: " + view);
		function section(sectionName) {
			console.log('sections object: ', sections);
			return sections.get(sectionName)(req, res, section);
		}
		var sv = section(view)
		
		if(!sv) {
			res.sendStatus(404);
		}
		
		sv.subscribe({
			onNext(next) {
				res.write(next);
			},
			onError(err) {
				console.log("Error: ", err);
			},
			onDone() {
				res.end();
			}
		});
	}
}