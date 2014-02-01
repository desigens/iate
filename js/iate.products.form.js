/*global IAte */

IAte.module('ProductsForm', function (ProductsForm, App, Backbone) {

    ProductsForm.FormView = Backbone.Marionette.ItemView.extend({
        template: '#db-form'
    });

    // Форма добавления нового продукта
    ProductsForm.FormView = Backbone.Marionette.ItemView.extend({
        template: '#db-form',
        events: {
            'submit': 'add'
        },
        collectionEvents: {
            "add": "itemAdded"
        },
        add: function (e) {
            e.preventDefault()
            this.collection.add(this.toObject());
        },
        toObject: function () {
            var obj = {}
            this.$('input').each(function () {
                var key = $(this).attr('name');
                obj[key] = $(this).val();
            })
            console.log(obj);
            return obj;
        },
        onDomRefresh: function () {
            this.$('input').eq(0).focus();
        },
        itemAdded: function (model) {
            // Модель добавлена через форму
            if (!model.id) {
                // Ждем, когда в модель запишется ID,
                // возвращенный с сервера.
                model.once('change', function () {
                    var $ok = $('<span> Добавлено </span>');
                    this.$('button').after($ok);
                    setTimeout(function () {
                        $ok.remove();
                    }, 2000);
                }, this);
            }
        }
    });

    // Добавляем контроллер и роут
    App.controller.productsAdd = function () {
        // Показываем форму, где нужно
        App.content.show(new ProductsForm.FormView({
            collection: App.db
        }));
    };
    App.router.appRoute("products/add", "productsAdd");

});