var DEFAULT_WEIGHT = 100;

//Конструктор пищевой ценности продукта
var Value = function () {
	this.proteins = 0; //на 100гр
	this.carbohydrates = 0; //на 100гр
	this.fats = 0; //на 100гр
	this.calories = 0; //на 100гр
	this.name = undefined;
	this.portion = DEFAULT_WEIGHT; // Вес порции (штуки, пачки)
};

//Backbone Models
var Models = {
	
	//Модель продукта в БД
	Product: Backbone.Model.extend({
		defaults: new Value()
	}),

	//Модель съеденного
	Eaten: Backbone.Model.extend({
		
		defaults: {
			string: "",
			product: undefined,
			weight: DEFAULT_WEIGHT,
			value: undefined
		},
		initialize: function () {
			this.on('change', this.calcValue, this);
			this.on('change:string', this.findProduct, this);
		},
		calcValue: function () {
			var product = this.get('product'),
				weight = parseInt(this.get('weight'));
			if (product) {
				this.set('value', {
					proteins: parseInt(product.proteins) * weight / DEFAULT_WEIGHT,
					carbohydrates: parseInt(product.carbohydrates) * weight / DEFAULT_WEIGHT,
					fats: parseInt(product.fats) * weight / DEFAULT_WEIGHT,
					calories: parseInt(product.calories) * weight / DEFAULT_WEIGHT,
					weight: weight
				})
			} else {
				this.unset('value')
			}
		},
		filterProduct: function () {
			var string = this.get('string'),
				db = productsDB,
				regexp = new RegExp(string, 'gi');

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
				this.set('product', undefined);
				return "Нужно уточнить (найдено " + found.length + ")";
			} else if (found.length === 1) {
				this.set('product', found[0].attributes);
				return;
			} else {
				this.set('product', undefined);
				return "Ничего не найдено";
			}
		},
	})
}

//Backbone Views
var Views = {
	
	//Ввод продукта
	Input: Backbone.View.extend({
		initialize: function () {
			this.model = new Models.Eaten();
			this.listenModelEvents();

			// this.collection.create();
			// this.model = this.collection.last();
		},
		events: {
			'keyup input': 'modelChange',
			'submit': 'add'
		},
		listenModelEvents: function () {
			this.model.on('change:product', this.showMatch, this);
			this.model.on('change:value', this.showValue, this)
		},
		/**
		 * Добавляем в список съеденного
		 */
		add: function (event) {
			event.preventDefault();
			if (this.model.get('product') && this.model.get('value')) {

				this.collection.add(this.model);
				this.model.save();

				//Создаем новый экземпляр съеденного
				this.model = new Models.Eaten();
				this.listenModelEvents();

				//Очищаем инпут после добавления
				this.$el.find('input').val('');

				//TODO Как следить за созданной моделью? (change не отрабатывает)
				this.showMatch();
				this.showValue();
			}
		},
		filterInput: function () {
			var input = this.$el.find('input').val();
			return {
				string: input.match(/([A-Za-zА-ЯА-я\s]+)/gi),
				numbers: input.match(/(\d+)/gi)
			}
		},
		//При вводе текста в инпут меняем модель Eaten (sting, weight)
		modelChange: function () {
			var data = this.filterInput();

			if (data.numbers && data.numbers.length) {
				this.model.set('weight', data.numbers[0])
			} else {
				this.model.set('weight', DEFAULT_WEIGHT)
			}

			if (data.string && data.string.length) {
				this.model.set('string', data.string[0])
			}
		},
		//Следим за изменениями в модели (как только там появляется product)
		showMatch: function () {
			var product = this.model.get('product'),
				match = this.$el.find('.eaten__product'),
				template = _.template($('#db-item').html());

			if (product) {
				match.html(template(product));
			} else {
				match.html('');
			}
		},
		//Следим за изменениями в модели (как только там появляется value)
		showValue: function () {
			var value = this.model.get('value'),
				el = this.$el.find('.eaten__value'),
				template = _.template($('#eaten-value').html());
			if (value) {
				el.html(template(value));
			} else {
				el.html('');
			}
		}
	}),

	//Список съеденного
	EatenCollection: Backbone.View.extend({
		initialize: function () {
			this.collection.on('change add remove sync', this.render, this);
		},
		render: function () {
			this.$el.html('');
			this.collection.each(function (eaten) {
				var view = new Views.Eaten({model: eaten});
				this.$el.append(view.render().el);
			}, this)
		}
	}),

	//Элемент списка съеденного
	Eaten: Backbone.View.extend({
		tagName: 'li',
		template: _.template($('#eaten-view').html()),
		events: {
			'click .delete': 'remove'
		},
		initialize: function () {
			this.model.on('change add remove', this.render, this);
			this.render();
		},
		render: function () {
			this.$el.html(this.template(this.model.attributes));
			return this;
		},
		remove: function () {
			this.model.destroy();
		}
	}),

	//Итоговая сумма всего съеденного
	AllEaten: Backbone.View.extend({
		template: _.template($('#all').html()),
		initialize: function () {
			this.collection.on('change add remove sync', this.render, this);
		},
		render: function () {
			this.$el.html(this.template(this.count()));
			return this;
		},
		count: function () {
			var all = new Value();

			this.collection.each(function(eaten) {
				var value = eaten.get('value');
				all.proteins += value.proteins;
				all.carbohydrates += value.carbohydrates;
				all.fats += value.fats;
				all.calories += value.calories;
			});

			return all;
		}
	}),

	//Список продуктов в БД
	ProductsDB: Backbone.View.extend({
		tagName: 'ul',
		initialize: function () {
			this.collection.on('sync', this.render, this);
			$('body').append(this.el);
		},
		render: function () {
			this.$el.html('');
			this.collection.each(function (product) {
				var view = new Views.Product({model: product});
				this.$el.append(view.render().el)
			}, this);

			return this;
		}
	}),

	//Строка в списке БД продуктов
	Product: Backbone.View.extend({
		tagName: 'li',
		template: _.template($('#db-item').html()),
		render: function () {
			this.$el.append(this.template(this.model.attributes));
			return this;
		}
	})

};

//Backbone Collections
var Collections = {

	//БД продуктов
	ProductsDB: Backbone.Collection.extend({
		model: Models.Product,
		url: '/products-db.json'
	}),

	//Коллекция для моделей съеденного
	Eaten: Backbone.Collection.extend({
		model: Models.Eaten,
		localStorage: new Backbone.LocalStorage("eaten")
	})
}


/**********************************************/


//Список продуктов
var productsDB = new Collections.ProductsDB();
var productsDBCollectionView = new Views.ProductsDB({
	collection: productsDB
});
productsDB.fetch();

//Список съеденного
var eatenCollection = new Collections.Eaten();

//Инпут для создания модели съеденного
var inputView = new Views.Input({
	collection: eatenCollection,
	el: $('#eaten')
});

//Отображение списка съеденного
var eatenCollectionView = new Views.EatenCollection({
	el: $('.eaten'),
	collection: eatenCollection
});

//Отображение счетчика всего съеденного
var allEatenView = new Views.AllEaten({
	el: $('.all'),
	collection: eatenCollection
});

eatenCollection.fetch();

//TODO подсказка при вводе ("уточните...")
//TODO связывать модель продукта со съеденным по id