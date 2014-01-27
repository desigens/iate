/*global IAte */

// Регионы на странице (шапка, подвал)

IAte.module('Layout', function (Layout, App, Backbone) {

	Layout.Header = Backbone.Marionette.ItemView.extend({
		
		template: '#template-db',

		ui: {
			$list: '.db__list',
			$form: '.db__form'
		},

		events: {
			'click .db__header': 'toggle',
			'click .db__add': 'form',
			'click .db__refresh': 'refresh',
			'click .db__reset': 'reset'
		},

		toggle: function () {
			this.ui.$list.toggleClass('hidden');
		},

		refresh: function () {
			this.collection.fetch();
		},

		// Удаление всех «сохраненок»
		// TODO не относится к БД продуктов
		reset: function () {
			if (window.confirm('Точно удалить?')) {
				localStorage.clear();
				window.location.reload();
			}
		},

		// Отображение формы добавления продукта
		form: function () {
			this.ui.$form.toggleClass('hidden')
				// Фокус на первом инпуте
				.find('input:visible').eq(0).focus();			
		}
	});

	//Список продуктов в БД
	// ProductsDB: Backbone.View.extend({
	// 	className: 'db',
	// 	template: _.template($('#db').html()),
	// 	initialize: function () {
	// 		$('.wrapper').append(this.el);
	// 		this.render();

	// 		this.collection.on('add remove', this.count, this);
	// 		this.collection.on('add', this.add, this);
	// 	},
	// 	events: {
	// 		'click .db__header': 'toggle',
	// 		'click .db__add': 'form',
	// 		'click .db__refresh': 'refresh',
	// 		'click .db__reset': 'reset'
	// 	},
	// 	render: function () {
			
	// 		this.$el.html(this.template({
	// 			count: this.collection.size()
	// 		}));

	// 		this.$list = this.$('.db__list');

	// 		var form = new Views.ProductForm({
	// 			collection: this.collection
	// 		});

	// 		$('.db__add').after(form.render());

	// 		return this;
	// 	},
	// 	add: function (model) {
	// 		var view = new Views.Product({model: model});
	// 		$('.db__list').append(view.render().el);
			
	// 		// TODO не сохранять модели, которые пришли с сервера и не были изменены
	// 		model.save();
	// 	},
	// 	count: function () {
	// 		$('.db__counter').html(this.collection.length);
	// 	},
	// 	toggle: function () {
	// 		this.$list.toggleClass('hidden');
	// 	},
	// 	refresh: function () {
	// 		this.collection.fetch();
	// 	},
	// 	reset: function () {
	// 		if (window.confirm('Точно удалить?')) {
	// 			localStorage.clear();
	// 			window.location.reload();
	// 		}
	// 	},
	// 	// Отображение формы добавления продукта
	// 	form: function () {
	// 		this.$('.db__form').toggleClass('hidden')
	// 			// Фокус на первом инпуте
	// 			.find('input:visible').eq(0).focus();			
	// 	},
	// }),


});