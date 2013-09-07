var _ = require('underscore'),
	Backbone = require('backbone');

var ProductModel = Backbone.Model.extend({
	attributes: {
		proteins: NaN, //на 100гр
		carbohydrates: NaN, //на 100гр
		fats: NaN, //на 100гр
		calories: NaN, //на 100гр
		
		name: undefined,
		portion: NaN // Вес порции (штуки, пачки)
	}
});

var ProductsDBCollection = Backbone.Collection.extend({
	model: ProductModel
});

var Meal = function (protein, carbonates, fat, energy, name, weight, portion) {
	var args = Array.prototype.slice.call(arguments, 0),
		str;

		// console.log(args)

	//TODO очистка чисел	

	if (args.length === 1 && _.isString(args[0])) {
		str = args[0].split(' ');

		// console.log(str);
		
		//формат "3 25 1 128 овсянка 40" или "3 25 1 128 овсянка"
		if (str.length > 4) {
			return new Meal(str[0], str[1], str[2], str[3], str[4], str[5]);
		};

		//TODO формат "3 25 1 128 овсянка вкусная ололо"
	}

	this.name = name || 0;
	this.protein = protein || 0;
	this.carbonates = carbonates || 0;
	this.fat = fat || 0;
	this.energy = energy || 0;
	this.weight = weight || 100;
	this.portion = portion || 100; 
}

var db = [];

var notes = [
"15  18  6  187 зерн.творог 150",
"30  0  1  130 тунец.банка 130",
"3 25 1 128 овсянка 40",
"1 18 4.5 110 бат.мюсл 25",
"4 35 8 224 печеньки 60",
"67 65 4 568 две.порции.бел. 150",
"3.5 40 .5 185 хлопья 50",
"6 10 4 140 молоко 200",
"1.5 20 .5 100 банан 100",
".5 10 .5 50 яблоко 100",
"6 .5 5 77 яйцо.вкрутую 50",
"22 50 24 510 цезарь.ролл",
"23 .5 2 113 Куриная.грудка 100",
"2.5 12 3 85 Карт.пюре",
"0 10 0 40 кокакола 100",
"0 8 0 30 сахар.чайная.ложка",
"5 48 .5 217 рис.пол.пакета",
"13 3.5 11 167 наггетсы 100",
"12 0 20 228 докторская 100",
"10 71 1 344 макароны 100",
"8 3 0 46 Творог.колбаской 100",
"13 44 17 349 хлеб.швед. 100",
"12.5 30 .5 порция.белка.Бел. 50"
]

_.each(notes, function (str) {
	//TODO использовать BB
	db.push(new Meal(str));
})

console.log(JSON.stringify(db));

//TODO рассчет съеденного
var calc = function () {

}