var _ = require('underscore');

var passport = require('passport')
    , LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(
    function(username, password, done) {
        User.findOne({ username: username }, function (err, user) {
            if (err) { return done(err); }
            if (!user) {
                return done(null, false, { message: 'Incorrect username.' });
            }
            if (!user.validPassword(password)) {
                return done(null, false, { message: 'Incorrect password.' });
            }
            return done(null, user);
        });
    }
));

var ProductModel = require('./mongo').ProductModel;

var port = 3000;

var express = require('express');
var app = express();

app.use(express.static(__dirname));
app.use(express.json());

app.get('/', function(req, res){
  res.sendfile('index.html');
});

app.all('/login',
    passport.authenticate('local'),
    function(req, res) {
        // If this function gets called, authentication was successful.
        // `req.user` contains the authenticated user.
        res.redirect('/users/' + req.user.username);
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

app.post('/api/products', function (req, res) {
	var product = new ProductModel(req.body);

	// console.log(req.body);
	
	product.save(function (err) {
		if (!err) {
            console.log("product created");
            return res.send({ status: 'OK', product: product });
        } else {
            console.log(err);
            if(err.name == 'ValidationError') {
                res.statusCode = 400;
                res.send({ error: 'Validation error' });
            } else {
                res.statusCode = 500;
                res.send({ error: 'Server error' });
            }
        }
	})
});

app.delete('/api/products/:id', function (req, res) {
    return ProductModel.findById(req.params.id, function (err, product) {
        if (!product) {
            res.statusCode = 404;
            return res.send({error: 'Not found'});
        }
        return product.remove(function (err) {
            if (!err) {
                return res.send({ status: 'OK' });
            } else {
                res.statusCode = 500;
                return res.send({ error: 'Server error' });
            }
        })
    })
});

app.put('/api/products/:id', function (req, res){
    return ProductModel.findById(req.params.id, function (err, product) {
        if(!product) {
            res.statusCode = 404;
            return res.send({error: 'Not found'});
        }

        product = _.extend(product, req.body);

        return product.save(function (err) {
            if (!err) {
                return res.send({status: 'OK', product: product});
            } else {
                if(err.name == 'ValidationError') {
                    res.statusCode = 400;
                    res.send({error: 'Validation error'});
                } else {
                    res.statusCode = 500;
                    res.send({error: 'Server error'});
                }
            }
        });
    });
});

app.listen(port, function () {
	console.log('Server running at port: ' + port);
});