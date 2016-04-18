var koa = require('koa');
var jsonp = require('koa-jsonp');
var router = require('koa-router')();
 
var models = require('./models');
var app = koa();

 



var itemModel = models.item;
var tagModel = models.tag;



// var jade = require('koa-jade-render');
// var path = require('path');

// app.use(jade(path.join(__dirname, 'views')));

app.use(jsonp());

router.get('/search', function *(next) {


	var items = yield itemModel.search(this.request.query);

	this.body = items;


});

router.get('/tags',function*() {

	var tags = yield tagModel.topTags( );
	this.body = tags;
})

router.get('/tagrank',function*() {

	var tag = this.request.query.tag;
 	 tagModel.rankTag(tag);


	var tags = yield tagModel.topTags( );
	this.body = tags;
})
 
app
  .use(router.routes())
  .use(router.allowedMethods());
 
 


app.listen(3002);