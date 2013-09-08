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
	model: ProductModel,
	url: '/products-db.json'
});

var productsDB = new ProductsDBCollection();

var Eaten = Backbone.Model.extend({
	attributes: {
		string: "",
		productModel: "",
		status: ""
	},
	initialize: function () {
		this.on('change', this.calcNutrion, this);
		this.on('change:string', this.findProduct, this);
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

var eaten = new Eaten();
// e.set({
// 	'string': 'тун',
// 	'weight': 40
// });

var ProductsDBView = Backbone.View.extend({
	tagName: 'li',
	template: _.template($('#db-item').html()),
	initialize: function () {
		//
	},
	render: function () {
		this.$el.append(this.template(this.model.attributes));
		return this;
	}
});

var ProductsDBCollectionView = Backbone.View.extend({
	tagName: 'ul',
	initialize: function () {
		this.collection.on('sync', this.render, this);
		$('body').append(this.el);
	},
	render: function () {
		this.collection.each(function(product) {
			var view = new ProductsDBView({model: product});
			this.$el.append(view.render().el)
		}, this);

		return this;
	}
});

var productsDBCollectionView = new ProductsDBCollectionView({
	collection: productsDB
});

var InputView = Backbone.View.extend({
	initialize: function () {
		this.model.on('change:productModel', this.showMatch, this)
	},
	events: {
		'keyup input': 'modelChange'
	},
	modelChange: function () {
		var input = this.$el.find('input').val();
		this.model.set({
			'string': input
		})
		console.log(this.model.attributes)
	},
	showMatch: function () {
		var productModel = this.model.get('productModel'),
			status = this.$el.find('.eaten__status'),
			template = _.template($('#db-item').html());

		if (productModel) {
			status.html(template(productModel.attributes));
		} else {
			status.html('Нет совпадения');
		}
	}
});

var inputView = new InputView({
	model: eaten,
	el: $('#eaten')
});

productsDB.fetch();