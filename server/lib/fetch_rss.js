var filter = require('./node_filter');
var models = require('../models');
var parser = require('rss-parser');
var md5 = require('md5');

var itemModel = models.item;

module.exports = function(feedUrl) {

	parser.parseURL(feedUrl, function(err, parsed) {

		var feedTitle = parsed.feed.title;
		console.log('fetching ['+feedTitle+']' + feedUrl);

		parsed.feed.entries.forEach(function(entry) {

			var title = entry.title;
			var link = entry.link;
 
				var description = entry.contentSnippet
		 

			var categories = entry.categories;

			var content = entry.content;
			var pubDate = entry.pubDate;



			if (filter(title) || filter(categories)) {

				itemModel.findOne({
					'hash': md5(link)
				}).exec(function(err, item) {
					if (err) return handleError(err);
				
					if (item == null) {
						var aItem = new itemModel({
							title: title,
							link: link,
							hash: md5(link),
							feedHash : md5(feedUrl),
							feedTitle : feedTitle,
							description: description,
							categories: categories,
							content: content,
							pubDate: pubDate
						});
						aItem.save();
						console.log('saved new item:' + title);
					}


				});
			}

		});
	});
}