var express = require('express');
var views = require('./views');
var app = express();

app.use(express.static('dist'));

app.get('/*', function (req, res) {
	views(req.path)(req, res);
});

var server = app.listen(3000, function () {
	var host = server.address().address;
	var port = server.address().port;

	console.log('Example app listening at http://%s:%s', host, port);
});
