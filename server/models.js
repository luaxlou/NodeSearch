var mongoose = require('mongoose');

var channelSchema = new mongoose.Schema({
	title: String,
	link: String,
	feedUrl: String,
	hash: String,
	description: String,
	lastPubDate: Date
});


module.exports.channel = mongoose.model('channel', channelSchema);

var itemSchema = new mongoose.Schema({
	title: String,
	creator: String,
	description: String,
	categories: Array,
	link: String,
	hash: String,
	feedHash: String,
	feedTitle: String,
	pubDate: Date,
	site: String,
	updateAt: {
		type: Date,
		default: Date.now
	}
});

module.exports.item = mongoose.model('item', itemSchema);



mongoose.connect('mongodb://localhost:27017/node_resource', {
	config: {
		autoIndex: true
	}
});