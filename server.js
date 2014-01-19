var ProductModel = require('./mongo').ProductModel;

var port = 3000;

var express = require('express');
var app = express();

app.use(express.static(__dirname));

app.get('/', function(req, res){
  res.sendfile('index.html');
});

// API

app.get('/api', function (req, res) {
	res.send('iAte API is running');
});

app.get('/api/products', function (req, res) {
	return ProductModel.find(function (err, products) {
		return res.send(products);
	})
});

app.listen(port, function () {
	console.log('Server running at port: ' + port);
});