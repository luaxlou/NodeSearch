var koa = require('koa');
var jsonp = require('koa-jsonp');
var router = require('koa-router')();

var models = require('./models');
var app = koa();



var itemModel = models.item;
var tagModel = models.tag;
var authModel = models.auth;



// var jade = require('koa-jade-render');
// var path = require('path');

// app.use(jade(path.join(__dirname, 'views')));

app.use(jsonp());


router.get('/auth', function*(next) {

	authModel.sendAuth();
	this.body = 'send ok'


});

router.get('/search', function*(next) {

	authModel.sendAuth();
	var items = yield itemModel.search(this.request.query);

	this.body = items;


});

router.get('/tags', function*() {

	var tags = yield tagModel.topTags();
	this.body = tags;
});

router.get('/alltags', function*() {


	var tags = yield tagModel.find({}, {
		title: 1,
		rank: 1
	}).sort({
		rank: -1
	}).exec();

	var html = '';


	for (var i in tags) {

		var t = tags[i];
		html += " <p><a href='/tagrank?tag=" + t.title + "'>" + (t.title) + "</a></p>"
	}
	this.body = html;
});

router.get('/tagrank', function*() {

	var tag = this.request.query.tag;
	tagModel.rankTag(tag);


	var tags = yield tagModel.topTags();
	this.body = tags;
});

app
	.use(router.routes())
	.use(router.allowedMethods());



app.listen(3002);