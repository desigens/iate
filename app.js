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

var Eaten = Backbone.Model.extend({
	attributes: {
		string: "",
		productModel: ""
	},
	initialize: function () {
		this.on('change', this.calcNutrion, this);
		this.on('change:string', this.findProduct, this);
		this.on('change:productModel', this.showMatch, this)
	},
	showMatch: function () {
		var product = this.get('productModel'),
			text;

		if (product) {
			text = 'Найден подходящий продукт! ';
			text += product.get('name') + ' (';
			text += 'белки: ' + product.get('proteins');
			text += ', углеводы: ' + product.get('carbohydrates');
			text += ', жиры: ' + product.get('fats');
			text += ', калории: ' + product.get('calories');
			text += ")";
			console.log(text);
		}
	},
	calcNutrion: function () {
		var product = this.get('productModel'),
			weight = parseInt(this.get('weight')) || 100,
			text;

		if (product) {
			text = "Съедено: ";
			text += 'белков: ' + (parseInt(product.get('proteins')) * weight / 100);
			text += ', углеводов: ' + (parseInt(product.get('carbohydrates')) * weight / 100);
			text += ', жиров: ' + (parseInt(product.get('fats')) * weight / 100);
			text += ', калорий: ' + (parseInt(product.get('calories')) * weight / 100);
			console.log(text);
		}	
	},
	filterProduct: function () {
		var string = this.get('string'),
			db = productsDB,
			regexp = new RegExp(string);

			// console.log('OLOLO', string, regexp);	

		var found = productsDB.filter(function(item){
			name = item.get('name');
        	return regexp.test(name);
		});

		return found;
	},
	findProduct: function () {
		var string = this.get('string'),
			found;

		found = this.filterProduct();

		if (found.length > 1) {
			this.set('productModel', undefined);
			return "Нужно уточнить (найдено " + found.length + ")";
		} else if (found.length === 1) {
			this.set('productModel', found[0]);
			return;
		} else {
			this.set('productModel', undefined);
			return "Ничего не найдено";
		}
	},

});

var e = new Eaten();
e.set({
	'string': 'тун',
	'weight': 40
});