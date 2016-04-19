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

	var host = this.request.host;

	authModel.sendAuth(host);
	this.body = 'send ok'


});

router.get('/search', function*(next) {

	var items = yield itemModel.search(this.request.query);

	this.body = items;


});

router.get('/tags', function*() {

	var tags = yield tagModel.topTags();
	this.body = tags;
});

router.get('/admin', function*() {

	var authKey = this.request.query.auth;

	var r = yield authModel.auth(authKey);

	console.log(r);
	if (!r) {
		this.body = 'auth failed'
		return;
	}


	var tags = yield tagModel.find({}, {
		title: 1,
		rank: 1
	}).sort({
		rank: -1
	}).exec();

	var html = '';

	html += "<p><a onclick=\"return confirm('delete?');\" href='/clean?auth=" + authKey + "'>clean</a>";


	for (var i in tags) {

		var t = tags[i];
		html += " <p><a href='/tagrank?tag=" + t.title + "&auth=" + authKey + "'>" + (t.title) + "</a></p>"
	}
	this.body = html;
});

router.get('/tagrank', function*() {


	var authKey = this.request.query.auth;


	if (!authModel.auth(authKey)) {
		this.body = 'auth failed'
		return;
	}

	var tag = this.request.query.tag;
	tagModel.rankTag(tag);


	var tags = yield tagModel.topTags();
	this.body = tags;
});


router.get('/clean', function*() {


	var authKey = this.request.query.auth;


	if (!authModel.auth(authKey)) {
		this.body = 'auth failed'
		return;
	}

	itemModel.remove({}).exec();
	tagModel.remove({}).exec();

	this.body = 'success';
});

app
	.use(router.routes())
	.use(router.allowedMethods());



app.listen(3002);