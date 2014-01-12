//Вспомогательные функции
function toFixed (value, precision) {
	var power = Math.pow(10, precision || 2);
	return String(Math.round(value * power) / power);
}

// Вес продукта по-умолчанию
var DEFAULT_WEIGHT = 100;

// Конструктор пищевой ценности продукта в каталоге
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


	// Общая модель приложения (?)
	App: Backbone.Model.extend({
		currentDay: undefined
	}),


	//День (?)
	Day: Backbone.Model.extend(),


	//Модель продукта в БД
	Product: Backbone.Model.extend({
		defaults: new Value()
	}),


	//Модель съеденного
	Eaten: Backbone.Model.extend({
		
		defaults: {
			string: "",
			product: undefined,
			weight: undefined,
			value: undefined
		},
		initialize: function () {
			this.on('change', this.calcValue, this);
			this.on('change:string', this.findProduct, this);
		},
		calcValue: function () {
			var product = this.get('product'),
				weight;

				 // = parseInt(this.get('weight')) || parseInt(this.get('product').portion) || parseInt(this.get('product').weight)

				// console.log(this.attributes);

			if (product) {

				weight = this.get('weight') || toFixed(product.portion) || toFixed(product.weight);

				this.set('value', {
					proteins: toFixed(product.proteins) * weight / DEFAULT_WEIGHT,
					carbohydrates: toFixed(product.carbohydrates) * weight / DEFAULT_WEIGHT,
					fats: toFixed(product.fats) * weight / DEFAULT_WEIGHT,
					calories: toFixed(product.calories) * weight / DEFAULT_WEIGHT,
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
	}),


	//Норма для человека
	UserRate: Backbone.Model.extend({
		defaults: {
			'userWeight': 60//вес человека
		},
		initialize: function () {
			var weight = this.get('userWeight');
			this.set({
				proteins: 2*weight,
				carbohydrates: 6*weight,
				fats: 1.5*weight,
				calories: 30*weight+1000
			});
			
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


	// Коллекция для моделей съеденного за все время.
	// Эту коллекцию мы целиком храним в Storage.
	Eaten: Backbone.Collection.extend({
		model: Models.Eaten,
		
		// Эту коллекцию мы храним в Local Storage
		localStorage: new Backbone.LocalStorage("eaten"),

		initialize: function (models, options) {
			this.app = options.app;
		},

		// Возвращает набор моделей съеденного за определенный день
		filterByDay: function (day) {
			return this.where({day: parseInt(day, 10)});
		},

		currentDay: function () {
			var currentDay = this.app.get('currentDay');
			return this.where({day: parseInt(currentDay, 10)});
		}
	}),


	// Коллекция с днями пользвателя (наборы съеденного)
	// TODO Удаление дней
	Days: Backbone.Collection.extend({
		model: Models.Day,

		// Эту коллекцию мы храним в Local Storage
		localStorage: new Backbone.LocalStorage("days"),

		initialize: function (models, options) {
			// После загрузки проверяем
			this.on('sync', this.syncHandler, this);

			this.app = options.app;
		},

		// Действия после загрузки дней пользователя
		syncHandler: function () {
			// Если у пользователя нет дней, создаем первый день
			if (this.length === 0) {
				this.addDay();
			}

			this.app.set('currentDay', this.lastDate());
		},

		// Добавляем день и сохраняем его
		addDay: function () {
			var today = new this.model({
				day: new Date().getTime()
			});

			// Как сохранить всю коллекцию, а не одну модель?
			this.add(today);
			
			today.save();
			// console.log('Добавляем день');
		},

		lastDate: function () {
			var last,
				list = this.models;

			last = _.max(list, function (item) {
				var timestamp = new Date(item.get('day'));
				return timestamp;
			});

			return last.get('day');
		}
	})


}


//Backbone Views
var Views = {

	
	//Ввод продукта
	Input: Backbone.View.extend({

		// Ссылка на коллекцию дней, чтобы знать, какую дату выставить
		// для модели съеденного.
		days: undefined,

		initialize: function (args) {

			this.days = args.days;

			//Инпут привязан к новой модели съеденного.
			this.model = new Models.Eaten();

			this.listenModelEvents();

			this.app = this.options.app;
		},
		
		events: {
			'keyup input': 'modelChange',
			'blur input': 'add',
			'submit': 'add',
			'click .eaten__tip': 'submit'
		},

		listenModelEvents: function () {
			this.model.on('change:product', this.showMatch, this);
			this.model.on('change:value', this.showValue, this)
		},

		submit: function () {
			this.el.submit();
		},
		
		// Добавляем модель в список съеденного и создаем новую модель.
		add: function (event) {
			event.preventDefault();

			// console.log(this);

			if (this.model.get('product') && this.model.get('value')) {

				//Устанавливаем текущий день
				// TODO Вынести добавление даты в модель
				this.model.set('day', this.app.get('currentDay'));

				this.collection.add(this.model);
				this.model.save();

				// console.log(this.model);

				//Создаем новый экземпляр съеденного для нового добавления
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
				this.model.set('weight', data.numbers[0]);
			} else {
				this.model.unset('weight');
			}

			if (data.string && data.string.length) {
				this.model.set('string', data.string[0])
			}
		},

		//Следим за изменениями в модели (как только там появляется product)
		showMatch: function () {
			var product = this.model.get('product'),
				match = this.$el.find('.eaten__product'),
				tip = this.$el.find('.eaten__tip'),
				template = _.template($('#db-item').html());

			if (product) {
				match.html(template({data: product}));
				tip.removeClass('hidden');
			} else {
				match.html('');
				tip.addClass('hidden')
			}
		},

		//Следим за изменениями в модели (как только там появляется value)
		showValue: function () {
			var product = this.model.get('product'),
				value = this.model.get('value'),
				el = this.$el.find('.eaten__value'),
				template = _.template($('#eaten-value').html());
			if (value) {
				el.html(template({
					value: value,
					product: product
				}));
			} else {
				el.html('');
			}
		}
	}),


	//Список съеденного
	EatenCollection: Backbone.View.extend({

		//коллекция дней
		days: undefined,

		initialize: function () {
			this.collection.on('change add remove sync', this.render, this);
			this.options.app.on('change', this.render, this);
		},
		render: function () {
			// console.log('EatenCollection render');

			var set;

			this.$el.html('');

			// Используем набор съеденного только за один день
			set = this.collection.currentDay();
			// set = this.collection.filterByDay('2013-09-19T20:07:07.066Z');

			_.each(set, function (eaten) {
				var view = new Views.Eaten({model: eaten});
				this.$el.prepend(view.render().el);
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
			// console.log('render');

			this.$el.html(this.template(this.model.attributes));
			return this;
		},
		remove: function () {
			this.model.destroy();
			// if (window.confirm('Удалить?')) {
			// 	this.model.destroy();	
			// }
		}
	}),


	//Итоговая сумма всего съеденного
	AllEaten: Backbone.View.extend({

		//коллекция дней
		days: undefined,

		template: _.template($('#all').html()),
		initialize: function () {
			this.collection.on('change add remove sync', this.render, this);
			this.options.app.on('change', this.render, this);
		},
		render: function () {
			// console.log(this.collection.length);
			this.$el.html(this.template(this.count()));
			return this;
		},
		count: function () {
			var all = new Value(),
				user = this.user,
				// Используем набор съеденного только за один день
				set = this.collection.currentDay();
				// set = this.collection.filterByDay('2013-09-19T20:07:07.066Z');

			_.each(set, function(eaten) {
				var value = eaten.get('value');

				all.proteins += value.proteins;
				all.carbohydrates += value.carbohydrates;
				all.fats += value.fats;
				all.calories += value.calories;
			}, this);

			all.proteinsP = toFixed(all.proteins / user.get('proteins') * 100, 2);
			all.carbohydratesP = toFixed(all.carbohydrates / user.get('carbohydrates')  * 100, 2);
			all.fatsP = toFixed(all.fats / user.get('fats')  * 100, 2);
			all.caloriesP = toFixed(all.calories / user.get('calories') * 100, 2);

			all.proteins = toFixed(all.proteins, 2);
			all.carbohydrates = toFixed(all.carbohydrates, 2);
			all.fats = toFixed(all.fats, 2);
			all.calories = toFixed(all.calories, 2);

			all.user = user.attributes;

			// console.log(all);

			return all;
		}
	}),


	//Список продуктов в БД
	ProductsDB: Backbone.View.extend({
		className: 'db',
		template: _.template($('#db').html()),
		initialize: function () {
			this.collection.on('sync', this.render, this);
			$('.wrapper').append(this.el);
		},
		events: {
			'click .db__header': 'toggle',
			'click .db__refresh': 'refresh',
			'click .db__reset': 'reset'
		},
		render: function () {
			
			this.$el.html(this.template({
				count: this.collection.size()
			}));

			this.$list = this.$('.db__list');

			this.collection.each(function (product) {
				var view = new Views.Product({model: product});
				this.$list.append(view.render().el)
			}, this);

			return this;
		},
		toggle: function () {
			this.$list.toggleClass('hidden');
		},
		refresh: function () {
			this.collection.fetch();
		},
		reset: function () {
			if (window.confirm('Точно удалить?')) {
				localStorage.clear();
				window.location.reload();
			}
		}
	}),


	//Строка в списке БД продуктов
	Product: Backbone.View.extend({
		tagName: 'li',
		template: _.template($('#db-item').html()),
		render: function () {
			this.$el.append(this.template({data: this.model.attributes}));
			return this;
		}
	}),


	//Список дней (папки)
	Days: Backbone.View.extend({

		//Коллекция моделей дней
		collection: undefined,

		initialize: function () {
			this.$list = this.$('.list');
			this.collection.on('add', this.render, this);

			this.app = this.options.app;

			this.listenTo(this.app, 'change', this.highlightCurrentDay);
		},

		events: {
			'click a': 'newdayHandler',
			'click .list': 'filter'
		},

		filter: function (e) {
			var day = e.target.innerText;
			this.app.set('currentDay', parseInt(day, 10));
		},

		render: function () {
			// TODO Уменьшить количество рендеров при инициализации
			// console.log('render');
			var html = '';
			this.collection.each(function (item) {
				html += '<li>' + item.get('day') + '</li>';	
			}, this)
			this.$list.html(html);
			this.highlightCurrentDay();
		},

		newdayHandler: function (e) {
			e.preventDefault();
			this.collection.addDay();
		},

		// Обозначем текущий день в списке
		highlightCurrentDay: function () {
			var day = this.app.get('currentDay') || '';
			this.$el.find('li').removeClass('current').filter(function () {
				return this.innerText === day.toString();
			}).addClass('current');
		}
	})

};


/**********************************************/

var app = new Models.App();

var user = new Models.UserRate();
// console.log(user);

//Список продуктов
var productsDB = new Collections.ProductsDB();
var productsDBCollectionView = new Views.ProductsDB({
	collection: productsDB
});
productsDB.fetch();


//Список съеденного
var eatenCollection = new Collections.Eaten([], {
	app: app
});

//Отображение счетчика всего съеденного
var allEatenView = new Views.AllEaten({
	app: app,
	el: $('.all'),
	collection: eatenCollection
});
allEatenView.user = user;


// Инициализируем список дней пользователя
var daysCollection = new Collections.Days([], {
	app: app
});

//Отображение списка съеденного
var eatenCollectionView = new Views.EatenCollection({
	app: app,
	el: $('.eaten'),
	collection: eatenCollection,
	daysCollection: daysCollection
});


//Инпут для создания модели съеденного
var inputView = new Views.Input({
	app: app,
	collection: eatenCollection,
	days: daysCollection,
	el: $('#eaten')
});
inputView.daysCollection = daysCollection;


// Список дней пользователя, и кнопка «Новый день»
var daysView = new Views.Days({
	app: app,
	el: $('.new-day'),
	collection: daysCollection
});


// Данные обновлять после того, как созданы все вьюхи
eatenCollection.fetch();
daysCollection.fetch();

//TODO подсказка при вводе ("уточните...")
//TODO связывать модель продукта со съеденным по id