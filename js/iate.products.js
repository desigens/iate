/*global IAte */

IAte.module('Products', function (Products, App, Backbone) {

	//Модель продукта в БД
	Products.Product = Backbone.Model.extend({
		defaults: new Value(),

		initialize: function () {
			console.log('new product');
		}
	});

	//БД продуктов
	Products.ProductsDB = Backbone.Collection.extend({
		model: Models.Product,
		url: '/api/products'
	});

});