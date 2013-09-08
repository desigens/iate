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
	defaults: {
		string: "",
		productModel: "",
		weight: 50,
		value: {}
	},
	initialize: function () {
		this.on('change', this.calcValue, this);
		this.on('change:string', this.findProduct, this);
	},
	calcValue: function () {
		var product = this.get('productModel'),
			weight = parseInt(this.get('weight')),
			text;
		if (product) {
			this.set('value', {
				proteins: parseInt(product.get('proteins')) * weight / 100,
				carbohydrates: parseInt(product.get('carbohydrates')) * weight / 100,
				fats: parseInt(product.get('fats')) * weight / 100,
				calories: parseInt(product.get('calories')) * weight / 100,
				weight: weight
			})
		} else {
			this.unset('value')
		}
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
		this.model.on('change:productModel', this.showMatch, this);
		this.model.on('change:value', this.showValue, this)
	},
	events: {
		'keyup input': 'modelChange'
	},
	modelChange: function () {
		var input = this.$el.find('input').val();
		this.model.set({
			'string': input
		})
	},
	showMatch: function () {
		var productModel = this.model.get('productModel'),
			product = this.$el.find('.eaten__product'),
			template = _.template($('#db-item').html());

		if (productModel) {
			product.html(template(productModel.attributes));
		} else {
			product.html('Нет совпадения');
		}
	},
	showValue: function (argument) {
		var value = this.model.get('value'),
			el = this.$el.find('.eaten__value'),
			template = _.template($('#eaten-value').html());

		if (value) {
			el.html(template(value));
		} else {
			el.html('');
		}
	}
});

var inputView = new InputView({
	model: eaten,
	el: $('#eaten')
});

productsDB.fetch();