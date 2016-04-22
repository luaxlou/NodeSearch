/**
* @flow
**/

var koa = require('koa');
var jsonp = require('koa-jsonp');
var router = require('koa-router')();
var parser = require('rss-parser');
var md5 = require('md5');

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

	authModel.delayAuth();


	var tags = yield tagModel.find({}, {
		title: 1,
		rank: 1
	}).sort({
		rank: -1
	}).exec();


	var items = yield itemModel.find({}).exec();



	var channels = yield channelModel.find({}).exec();

	var html = '';
	html += "<h1>Tags</h1>";
	for (var i in tags) {

		var t = tags[i];
		html += " <p>"+(t.title)
		+"<a href='/rankTag?tag=" + t.title + "&auth=" + authKey + "'  target='_blank'>rank</a> | "
		+"<a href='/hideTag?tag=" + t.title + "&auth=" + authKey + "'  target='_blank'>hide</a> | "
		+"<a href='/showTag?tag=" + t.title + "&auth=" + authKey + "'  target='_blank'>show</a> | </p>"

	}

	html += "<h1>channels</h1>";
	html += "<div><form method='post' action='/addFeed' >"
			+"<input type='hidden' name='auth' value='"+authKey+"' />"
			+"<input type='text' name='feedUrl' value='' size=100 />"
			+"<input type=\"submit\" value=\"add\" />"
			+"</form></div>";


	for (var i in channels) {

		var c = channels[i];
		html += " <p> "+(c.title)+":<a href='"+(c.feedUrl)+"' target='_blank'>"+(c.feedUrl)+"</a>"
		+" | <a onclick=\"return confirm('remove?');\" href='/removeChannel?hash=" + (c.hash) + "&auth=" + authKey + "'>remove</a></p>"
	}

	html += "<h1>Items</h1>";
	for (var i in items) {

		var it = items[i]
		html += " <p> "+(it.title)+":<a href='"+(it.link)+"' target='_blank'>"+(it.link)+"</a>"
		+" | <a onclick=\"return confirm('remove?');\" href='/removeItem?hash=" + it.hash + "&auth=" + authKey + "'  target='_blank'>remove</a></p>"
	}


	html += "<h1 style='color:red;'>Dangerous!!!</h1>";

	html += "<p><a onclick=\"return confirm('remove?');\" href='/clean?auth=" + authKey + "'  target='_blank'>clean</a>";


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


		this.body = 'success';
});


router.get('/hideTag', function*() {


	var authKey = this.request.query.auth;


	if (!authModel.auth(authKey)) {
		this.body = 'auth failed'
		return;
	}

	var tag = this.request.query.tag;
	tagModel.hideTag(tag);


			this.body = 'success';
});

router.get('/showTag', function*() {


	var authKey = this.request.query.auth;


	if (!authModel.auth(authKey)) {
		this.body = 'auth failed'
		return;
	}

	var tag = this.request.query.tag;
	tagModel.showTag(tag);


			this.body = 'success';
});

router.post('/addFeed', function*() {

	var authKey = this.request.query.auth;


	if (!authModel.auth(authKey)) {
		this.body = 'auth failed'
		return;
	}


	var feedUrl= this.request.query.feedUrl;


	channelModel.findOne({
		'hash': md5(feedUrl)
	}).exec(function(err, channel) {


		if (err) return handleError(err);


		if (channel == null) {

			parser.parseURL(feedUrl, function(err, parsed) {


				var title = parsed.feed.title;
				var link = parsed.feed.link;
				var description = parsed.feed.description;
				var channel = new channelModel({
						'title': title,
						'link': link,
						'feedUrl': feedUrl,
						'hash': md5(feedUrl),
						'description': description
					})
					.save(function(err) {
						if (err) return handleError(err);
						console.log('saved new feed:' + parsed.feed.title);

					});
			});
		} else {
			console.log('feed is already saved');
			console.log(channel);

		}


	});

	this.body = 'success';
});

router.get('/removeChannel', function*() {


	var authKey = this.request.query.auth;


	if (!authModel.auth(authKey)) {
		this.body = 'auth failed'
		return;
	}

	var hash = this.request.query.hash;
	channelModel.removeChannel(hash);


			this.body = 'success';
});


router.get('/removeItem', function*() {


	var authKey = this.request.query.auth;


	if (!authModel.auth(authKey)) {
		this.body = 'auth failed'
		return;
	}

	var hash = this.request.query.hash;
	itemModel.removeItem(hash);

		this.body = 'success';

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
