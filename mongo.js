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

TODO запускать монго как сервис (или через forever)
*/

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/iate');

// Аналогично app.js (см. Value)
// TODO вынести в единый код
// TODO разобраться с типами данных
var Product = new mongoose.Schema({
	name: {type: String },
	proteins: {type: String },
	carbohydrates: {type: String },
	fats: {type: String },
	calories: {type: String },
	portion: {type: String }
})

var ProductModel = mongoose.model('Product', Product);

// Добавление записи в БД
// Если параметра нет в схеме — игнорируется.
// new ProductModel({
// 	"name": "122зерн. творог",
//     "proteins": "15",
//     "carbohydrates": 0,
//     "fats": "18",
//     "calories": 6,
//     "weight": 100,
//     "portion": 150
// }).save();

// Удаление всей «таблицы» (аккуратно с ней!)
// ProductModel.remove({}, function(err) { 
//    console.log('collection removed') 
// });

module.exports.ProductModel = ProductModel;