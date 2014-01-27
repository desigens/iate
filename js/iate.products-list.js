/*global IAte */

// Контроллер (?)

IAte.module('ProductsList', function (ProductsList, App, Backbone, Marionette, $, _) {

	ProductsList.Controller = function () {
		this.productsDB = new App.Products.ProductsDB();
	};

	_.extend(ProductsList.Controller.prototype, {
		start: function () {
			this.showHeader(this.productsDB);
		},
		showHeader: function (productsDB) {
			var header = new App.Layout.Header({
				collection: productsDB
			});
			App.header.show(header);
		}
	});

    ProductsList.addInitializer(function () {
        var controller = new ProductsList.Controller();
        controller.start();
    });

});

// Модуль стартует вместе с App.start()
IAte.ProductsList.on('start', function () {
	console.log('hello');
})