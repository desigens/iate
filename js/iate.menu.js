/*global IAte */

IAte.module('Menu', function (Menu, App, Backbone) {

//    Menu.MenuItem = Backbone.Marionette.ItemView.extend({
//        template: "#template-menu-item",
//        tagName: "li"
//    });
//
//    Menu.MenuView = Backbone.Marionette.CompositeView.extend({
//        template: "#template-menu",
//
//        itemView: Menu.MenuItem
////
////        appendHtml: function(cv, iv){
////            var $divider = cv.$(".divider");
////            $divider.before(iv.el);
////        }
//    });


    App.content.on('show', function (view) {

        console.log('content show')

        if (view instanceof App.ProductsForm.FormView) {
            console.log('Форма');
        };
    })

});