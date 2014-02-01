/*global IAte */

IAte.module('Products', function (Products, App, Backbone) {

	// Модель продукта в БД
	Products.Product = Backbone.Model.extend({
		defaults: new Value()
	});

	// Коллекция БД продуктов
	Products.ProductsDB = Backbone.Collection.extend({
		model: Products.Product,
		url: '/api/products'
	});

    // Вьюха строки в списке продуктов
    Products.ItemView = Backbone.Marionette.ItemView.extend({
        template: '#template-db-item'
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