var filter = require('./node_filter');
var models = require('../models');
var parser = require('parse-rss');

var summaryTool = require('node-summary');
var md5 = require('md5');

var itemModel = models.item;

module.exports = function(channel) {

	var feedUrl = channel.feedUrl;
	console.log('fetching [' + channel.title + ']' + feedUrl);
	parser(feedUrl,
		function(err, parsed) {
			if (parsed) {


				parsed.forEach(function(entry) {

					if (filter(entry.title) || filter(entry.categories)) {;

						for (var i = 0; i < entry.categories.length; i++) {
							entry.categories[i] = entry.categories[i].toLowerCase();
						}

						var aItem = new itemModel({
							title: entry.title,
							author: entry.author,
							link: entry.link,
							feedHash: md5(channel.feedUrl),
							feedTitle: channel.title,
							description: entry.description,
							summary: entry.summary,
							categories: entry.categories,
							pubDate: entry.pubDate
						});


						aItem.addUnique(channel);



					}

				});
			}
		});
}