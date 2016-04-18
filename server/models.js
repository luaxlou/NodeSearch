var mongoose = require('mongoose');
var md5 = require('md5');

mongoose.set('debug', true);


var channelSchema = new mongoose.Schema({
	title: String,
	link: String,
	feedUrl: String,
	hash: String,
	description: String,
	lastPubDate: Date
});

channelSchema.methods.updateLastPubDate = function(pubDate, cb) {


	if (!this.lastPubDate || this.lastPubDate < pubDate) {
		this.lastPubDate = pubDate;
		this.save();
	}



}


module.exports.channel = mongoose.model('channel', channelSchema);

var itemSchema = new mongoose.Schema({
	title: String,
	author: String,
	summary: String,
	description: String,
	categories: Array,
	link: String,
	hash: String,
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


	return itemModel.find(query).sort({updateAt:-1}).exec();
}

itemSchema.methods.addUnique = function(channel, cb) {



	var itemModel = this.model('item');

	var tagModel = this.model('tag');

	var _this = this;



	itemModel.findOne({
		'hash': md5(this.link)
	}).exec(function(err, item) {
		if (err) return handleError(err);

		if (item == null) {

			_this.save().then(function(item) {
				console.log('saved new item:' + (item.title));

				channel.updateLastPubDate(item.pubDate);
				tagModel.addUnique(item.categories);
			});



		} else {


		}


	});


}

module.exports.item = mongoose.model('item', itemSchema);


var tagSchema = new mongoose.Schema({
	title: String,
	hash:String
});

tagSchema.statics.addUnique = function(tags, cb) {

	var tagModel = this.model('tag');

	tags.forEach(function(title) {

		title = title.toLowerCase();


		tagModel.findOne({
			'hash': md5(title)
		}).exec(function(err, tag) {
			if (err) return handleError(err);

			if (tag == null) {

				tag = new tagModel({
					title: title,
					hash:md5(title)
				});

				tag.save().then(function(tag) {
					console.log('saved new tag:' + (tag.title));

				});



			} else {


			}


		});
	});
}

module.exports.tag = mongoose.model('tag', tagSchema);


mongoose.connect('mongodb://localhost:27017/node_resource', {
	config: {
		autoIndex: true
	}
});