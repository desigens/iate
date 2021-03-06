/*global IAte */

IAte.module('ProductsForm', function (ProductsForm, App, Backbone) {

    // Форма добавления нового продукта
    ProductsForm.FormView = Backbone.Marionette.ItemView.extend({
        template: function(serialized_model) {
            return _.template($('#db-form').html(), serialized_model, {variable: 'data'});
        },
        events: {
            'submit': 'submit'
        },
        collectionEvents: {
            "add": "itemAdded"
        },
        submit: function (e) {
            e.preventDefault()
            // логика разделения в App.controller.productsAdd и App.controller.productsEdit
            if (this.collection) {
                this.add();
            }
            if (this.model) {
                this.edit();
            }
        },
        add: function () {
            this.collection.add(this.toObject());
            // + this.itemAdded() через collectionEvents
        },
        edit: function () {
            this.model.set(this.toObject());
            this.model.save();
        },
        // Сериализуем инпуты формы в объект
        toObject: function () {
            var obj = {}
            this.$('input').each(function () {
                var key = $(this).attr('name');
                obj[key] = $(this).val();
            })
            // Пустую строку Backbone рассматривает как вполне себе
            // нормальный _id и пытается отправить PUT вместо POST.
            // Помешаем ему!
            if (obj._id === '') {
                delete obj._id
            }
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

    // Добавляем контроллеры и роуты

    // Форма добавления продукта
    App.controller.productsAdd = function () {
        // Показываем форму, где нужно
        App.content.show(new ProductsForm.FormView({
            collection: App.db
        }));
    };
    App.router.appRoute("products/add", "productsAdd");

    // Форма редактиорования продукта
    App.controller.productsEdit = function (id) {
        App.content.show(new ProductsForm.FormView({
            model: App.db.get(id)
        }))
    };
    App.router.appRoute("products/edit/:id", "productsEdit");
});