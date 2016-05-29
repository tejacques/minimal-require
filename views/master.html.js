var fs = require('fs');
var HTML = require('../html');
function requirejs() {
	return new Promise(function(resolve, reject) {
		fs.readFile('./require.js', 'utf-8', function(err, file) {
			if (err) reject(err);
			else resolve(file);
		});
	});
}
function delay(wait) {
	return new Promise(function(resolve, reject) {
		setTimeout(resolve, wait);
	});
}
function iife(fn) {
	return '('+fn.toString()+')()';
}
function logTime(name) {
	console.log('----------');
	console.log('Logging times: ' + name);
	var curTs = +(new Date());
	var unloadTime = localStorage.getItem('unload');
	if (unloadTime) {
		localStorage.removeItem('unload');
		window.unloadTimeStamp = parseInt(unloadTime);
	}
	
	if(!window.startTimeStamp) {
		window.startTimeStamp = curTs;
		window.lastTimeStamp = curTs;
		var dont = true;
	}
	
	var logStr = 'since unload: ' + (window.unloadTimeStamp && (curTs - window.unloadTimeStamp))
		+ ' since start: ' + (window.startTimeStamp && (curTs - window.startTimeStamp))
		+ ' since last: ' + (window.lastTimeStamp && (curTs - window.lastTimeStamp));
	
	console.log(logStr);
	
	if(!dont) {
		window.lastTimeStamp = curTs;
	}
}

function logTimeScript() {
	return HTML`
		<script>
			${iife(logTime)}
		</script>`;
}
function master(req, res, section) {
	return HTML`
<!DOCTYPE html>
<html>
<head>
	${section('head')}
	<script>
		window.onunload = function() {
			localStorage.setItem('unload', (+new Date()));
		};
		${logTime.toString()}
		logTime('head');
	</script>
	<script>${requirejs()}</script>
	<script>
		require(['webpackBundle'], function(bundle) {
			logTime('webPackBundle (first)');
		});
	</script>
	<script src='/webpackBundle.js'></script>
	<script>
		// (function (window, document, script, url, scriptTag, firstScriptTag) {
		// 	scriptTag = document.createElement(script);
		// 	scriptTag.async = true;
		// 	scriptTag.src = url;
		// 	firstScriptTag = document.getElementsByTagName(script)[0];
		// 	firstScriptTag.parentNode.insertBefore(scriptTag, firstScriptTag);
		// })(window, document, 'script', '/webpackBundle.js');
	</script>
</head>
<body>
	<script>logTime('body start');</script>
	${delay(500)}
	<script>logTime('body after delay');</script>
	<script>
		require(['webpackBundle'], function(bundle) {
			logTime('webPackBundle (second)');
		});
	</script>
	${section('body')}
	${delay(200)}
	<script>logTime('second delay')</script>
</body>
</html>`;
}

module.exports = master;