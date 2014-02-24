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
        comparator: function(model) {
            return model.get('name').toLocaleLowerCase();
        },
        initialize: function () {
            this.on('add', this.saveNewProduct);
        },

        // Алгоритм поиска продуктов в БД
        searchByString: function (string) {
            var regexp, found;

            regexp = new RegExp(string, 'i');

            found = this.filter(function(item){
                var name = item.get('name');
                return regexp.test(name);
            });

            return found;
        },
        saveNewProduct: function (model, collection, options) {
            // Модель не пришла с сервера, а добавлена через форму
            if (!options.xhr) {
                model.save()
                    // После сохранения модели на сервере,
                    // получаем ID в БД (для удаления/обновления)
                    .done(function (data) {
                        model.set('_id', data.product._id);
                        console.log(data.product._id, model.id);
                    });
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
        className: 'b-db',
        itemView: Products.ItemView,
        appendHtml: function(collectionView, itemView, index) {
            var childAtIndex;

            // could just quickly
            // use prepend
            if (index === 0) {
                return collectionView.$el
                    .prepend(itemView.el);

            } else {

                // see if there is already
                // a child at the index
                childAtIndex = collectionView.$el
                    .children().eq(index);
                if (childAtIndex.length) {
                    return childAtIndex
                        .before(itemView.el);
                } else {
                    return collectionView.$el
                        .append(itemView.el);
                }
            }
        }
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