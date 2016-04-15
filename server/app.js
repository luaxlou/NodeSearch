var koa = require('koa');
var jsonp = require('koa-jsonp');

var models = require('./models');
var app = koa();


var itemModel = models.item;

app.use(jsonp());

app.use(function*() {

	 var items = yield itemModel.find().exec();
	 	this.body = items;
});

app.listen(3002);