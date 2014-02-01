/*global IAte */

IAte.module('Products', function (Products, App, Backbone) {

	// Модель продукта в БД
	Products.Product = Backbone.Model.extend({
		defaults: new Value(),
        idAttribute: '_id'
	});

	// Коллекция БД продуктов
	Products.ProductsDB = Backbone.Collection.extend({
		model: Products.Product,
		url: '/api/products',
        initialize: function () {
            this.on('add', this.saveNewProduct);
        },
        saveNewProduct: function (model, collection, options) {
            // Модель не пришла с сервера, а добавлена через форму
            if (!options.xhr) {
                model.save();
            }
        }
	});

    // Вьюха строки в списке продуктов
    Products.ItemView = Backbone.Marionette.ItemView.extend({
        tagName: 'li',
        className: 'b-db__item',
        template: '#template-db-item',
        ui: {
            delete: '.delete'
        },
        events: {
            "click @ui.delete": "removeItem"
        },
        removeItem: function () {
            this.model.destroy();
        }
    });

    // Вьюха списка продуктов
    Products.ListView = Backbone.Marionette.CollectionView.extend({
        tagName: 'ul',
        itemView: Products.ItemView
    });

    // Инстанс БД
    App.db = new Products.ProductsDB();
    App.db.fetch();

    // Добавляем контроллер и роут
    App.controller.products = function () {
        // Показываем список продуктов, где нужно
        App.content.show(new Products.ListView({
            collection: App.db
        }));
    };
    App.router.appRoute("products", "products");

});