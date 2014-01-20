/*

Установка mongo на Mac OS X
http://docs.mongodb.org/manual/tutorial/install-mongodb-on-os-x/

curl -O http://downloads.mongodb.org/osx/mongodb-osx-x86_64-2.4.9.tgz
tar -zxvf mongodb-osx-x86_64-2.4.9.tgz
mkdir -p mongodb
cp -R -n mongodb-osx-x86_64-2.4.9/ mongodb
mkdir -p /data/db
chown `id -u` /data/db
./mongod


PATH=$PATH:~/путь/к/mondodb/bin/
export PATH


TODO запускать монго как сервис (или через forever)
*/

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/iate');

// Аналогично app.js (см. Value)
// TODO вынести в единый код
// TODO разобраться с типами данных
var Product = new mongoose.Schema({
	name: String,
	proteins: Number,
	carbohydrates: Number,
	fats: Number,
	calories: Number,
	weight: Number,
	portion: Number,
	item: String
})

var ProductModel = mongoose.model('Product', Product);

// Импорт записей из файла (осторожно!)
// var fs = require('fs');
// var db = [];
// fs.readFile('products-db.json', 'utf8', function (err, data) {
// 	db = JSON.parse(data);
// 	db.forEach(function (item) {
// 		// console.log(item);
// 		new ProductModel(item).save();
// 	});
// });

// Добавление записи в БД
// Если параметра нет в схеме — игнорируется.
// new ProductModel({
//     "name": "тунец",
//     "proteins": "30.4",
//     "carbohydrates": 0,
//     "fats": "1.5",
//     "calories": 130.0,
//     "weight": 100,
//     "portion": 130,
//     "item": "банка"
// }).save();

// Удаление всей «таблицы» (аккуратно с ней!)
// ProductModel.remove({}, function(err) { 
//    console.log('collection removed') 
// });

module.exports.ProductModel = ProductModel;