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