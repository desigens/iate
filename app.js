var _ = require('underscore'),
	Backbone = require('backbone'),
	db = require('./products-db.json');

var ProductModel = Backbone.Model.extend({
	attributes: {
		proteins: NaN, //на 100гр
		carbohydrates: NaN, //на 100гр
		fats: NaN, //на 100гр
		calories: NaN, //на 100гр
		
		name: undefined,
		portion: NaN // Вес порции (штуки, пачки)
	}
});

var ProductsDBCollection = Backbone.Collection.extend({
	model: ProductModel
});

var productsDB = new ProductsDBCollection();
productsDB.reset(db);

productsDB.each(function (element) {
	console.log(element.get('name'))
});


//TODO рассчет съеденного