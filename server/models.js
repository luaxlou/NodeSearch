var mongoose = require('mongoose');
var md5 = require('md5');
var redis = require("redis");
var Promise = require('promise');
var sendmail = require('sendmail')();

var redisClient = redis.createClient();



function rand() {
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	for (var i = 0; i < 32; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));
	return text;
}

redisClient.on("error", function(err) {
	console.log("Error " + err);
});

mongoose.set('debug', true);

module.exports.auth = {
	sendAuth: function(host) {
		var authKey = rand();
		redisClient.set('authKey', authKey);
		redisClient.expire('authKey', 1800);

		var adminUrl = "http://" + host + '/admin?auth=' + authKey;


		var adminUrl =

			sendmail({
				from: 'luax@luaxlou.com',
				to: 'luax@qq.com',
				subject: 'node search authKey',
				content: 'hello john! node search admin url is:' + adminUrl,
			}, function(err, reply) {
				console.log(err && err.stack);
				console.dir(reply);
			});

	},
	auth: function(authKey) {


		var promise = new Promise(function(resolve, reject) {
			redisClient.get('authKey', function(err, authKeyF) {



				if (err) {

					reject(err)

				} else {


					resolve(authKey == authKeyF)
				};
			});
		});

		return promise;

	}
}


//----------------------------------------------------------
//channelSchema

var channelSchema = new mongoose.Schema({
	title: String,
	link: String,
	feedUrl: String,
	hash: {
		type: String,
		index: {
			unique: true
		}
	},
	description: String,
	lastPubDate: Date
});

channelSchema.methods.updateLastPubDate = function(pubDate, cb) {
	if (!this.lastPubDate || this.lastPubDate < pubDate) {
		this.lastPubDate = pubDate;
		this.save();
	}

}

channelSchema.statics.remove = function(hash,cb){
	channelModel.findOne({
		hash: hash
	}).exec(function(err, t) {
		if (t != null) {

			t.remove();
		}

	});
}


module.exports.channel = mongoose.model('channel', channelSchema);


//----------------------------------------------------------
//itemSchema
var itemSchema = new mongoose.Schema({
	title: String,
	author: String,
	summary: String,
	description: String,
	categories: Array,
	link: String,
	hash: {
		type: String,
		index: {
			unique: true
		}
	},
	feedHash: String,
	feedTitle: String,
	pubDate: Date,
	site: String,
	taged: {
		type: Boolean,
		default: false
	},
	updateAt: {
		type: Date,
		default: Date.now
	}
});

itemSchema.statics.search = function(filter, cb) {

	var itemModel = this.model('item');

	var query = {};
	if (filter.tag && filter.tag != 'all') {
		query.categories = filter.tag;
	}


	return itemModel.find(query).sort({
		updateAt: -1
	}).exec();
}

itemSchema.methods.addUnique = function(channel, cb) {

	var itemModel = this.model('item');
	var tagModel = this.model('tag');


	this.hash = md5(this.title);
	this.save().then(function(item) {
		console.log('saved new item:' + (item.title));

		channel.updateLastPubDate(item.pubDate);
		tagModel.addUnique(item.categories);
	});

}

itemSchema.statics.remove = function(hash,cb){
	itemModel.findOne({
		hash: hash
	}).exec(function(err, t) {
		if (t != null) {

			t.remove();
		}

	});
}

module.exports.item = mongoose.model('item', itemSchema);
//----------------------------------------------------------
//tagSchema

var tagSchema = new mongoose.Schema({
	title: String,
	hash: {
		type: String,
		index: {
			unique: true
		}
	},
	isShow:{
		type:Boolean,
		default:true
	},
	rank: Number
});


tagSchema.statics.addUnique = function(tags, cb) {

	var tagModel = this.model('tag');

	tags.forEach(function(title) {

		title = title.toLowerCase();


		var tag = new tagModel({
			title: title,
			hash: md5(title)
		});

		tag.save().then(function(t) {
			console.log('saved new tag:' + (t.title));

		});

	});
}



tagSchema.statics.topTags = function*(cb) {

	var tagModel = this.model('tag');
	return tagModel.find({isShow:true}, {
		title: 1,
		rank: 1
	}).sort({
		rank: -1
	}).limit(20).exec();

}

tagSchema.statics.rankTag = function(tag, cb) {

	var tagModel = this.model('tag');


	var hash = md5(tag.toLowerCase());
	tagModel.findOne({
		hash: hash
	}).exec(function(err, t) {
		if (t != null) {
			if (typeof t.rank == 'undefined') {
				t.rank = 0;
			} else {
				t.rank = t.rank + 1;
			}
			t.save();
		}

	});

}


tagSchema.statics.hideTag = function(tag, cb) {

	var tagModel = this.model('tag');


	var hash = md5(tag.toLowerCase());
	tagModel.findOne({
		hash: hash
	}).exec(function(err, t) {
		if (t != null) {
			t.isShow =false;
			t.save();
		}

	});

}

module.exports.tag = mongoose.model('tag', tagSchema);


mongoose.connect('mongodb://localhost:27017/node_resource', {
	config: {
		autoIndex: true
	}
});
