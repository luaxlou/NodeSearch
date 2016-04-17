var koa = require('koa');
var jsonp = require('koa-jsonp');
var _ = require('koa-route');

var models = require('./models');
var app = koa();


var itemModel = models.item;
var tagModel = models.tag;

app.use(jsonp());

app.use(_.get('/search', function*() {

	var items = yield itemModel.search(this.request.query);

	this.body = items;

}));


app.use(_.get('/tags', function*() {

	var tags = yield tagModel.find().exec();
	this.body = tags;
}));


app.listen(3002);