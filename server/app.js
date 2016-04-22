var koa = require('koa');
var jsonp = require('koa-jsonp');
var router = require('koa-router')();

var models = require('./models');
var app = koa();


var channelModel = models.channel;
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


	var items = yield itemModel.find({}).exec();



	var channels = yield channelModel.find({}).exec();

	var html = '';

	for (var i in tags) {

		var t = tags[i];
		html += " <p>"+(t.title)
		+"<a href='/rankTag?tag=" + t.title + "&auth=" + authKey + "'  target='_blank'>rank</a></p>"
		+"<a href='/hideTag?tag=" + t.title + "&auth=" + authKey + "'  target='_blank'>hideTag</a></p>"

	}

	for (var i in channels) {

		var c = channels[i];
		html += " <p> "+(c.title)+":<a href='"+(c.feedUrl)+"' target='_blank'>"+(c.feedUrl)+"</a><a onclick=\"return confirm('delete?');\" href='/deleteChannel?hash=" + t.hash + "&auth=" + authKey + "'>remove</a></p>"
	}

	for (var i in items) {

		var it = channels[i]
		html += " <p> "+(it.title)+":<a href='"+(it.link)+"' target='_blank'>"+(it.link)+"</a><a onclick=\"return confirm('delete?');\" href='/deleteItem?hash=" + it.hash + "&auth=" + authKey + "'>remove</a></p>"
	}



	html += "<p><a onclick=\"return confirm('delete?');\" href='/clean?auth=" + authKey + "'>clean</a>";


	this.body = html;
});

router.get('/rankTag', function*() {


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


router.get('/hideTag', function*() {


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

router.get('/channelItem', function*() {


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


router.get('/removeItem', function*() {


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
