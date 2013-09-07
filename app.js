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

// productsDB.each(function (element) {
// 	console.log(element.get('name'))
// });

var Eaten = Backbone.Model.extend({
	attributes: {
		string: "",
		productModel: ""
	},
	initialize: function () {
		
	},
	filterProduct: function () {
		var string = this.get('string'),
			db = productsDB,
			regexp = new RegExp(string);

		var found = productsDB.filter(function(item){
			name = item.get('name');
        	return regexp.test(name);
		});

		return found;
	},
	findProduct: function (string) {
		var found;

		if (string) {
			this.set('string', string);
		}

		found = this.filterProduct();

		if (found.length > 1) {
			this.set('productModel', undefined);
			return "Нужно уточнить (найдено " + found.length + ")";
		} else if (found.length === 1) {
			this.set('productModel', found[0]);
			return "Найден подходящий продукт!";
		} else {
			this.set('productModel', undefined);
			return "Ничего не найдено";
		}
	}
});

var e = new Eaten();

console.log(e.findProduct('о'));


//TODO рассчет съеденного