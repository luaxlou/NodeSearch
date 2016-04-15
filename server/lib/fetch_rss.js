var filter = require('node_filter');
var parser = require('rss-parser');

module.exports = function(feedUrl) {

	parser.parseURL(feedUrl, function(err, parsed) {

		console.log('fetching ' + feedUrl);

		parsed.feed.entries.forEach(function(entry) {

			var title = entry.title;
			var link = entry.link;


			if (entry.description) {
				var description = entry.contentSnippet
			} else if (entry.contentSnippet) {
				var description = entry.description;
			}


			var categories = entry.categories;

			var content = entry.content;
			var pubDate = entry.pubDate;



			if (filter(title) || filter(categories)) {

				itemModel.findOne({
					'link': link
				}).exec(function(err, item) {
					if (err) return handleError(err);
					if (item == null) {
						var aItem = new itemModel({
							title: title,
							link: link,
							description: description,
							categories: categories,
							content: content,
							pubDate: pubDate
						});
						aItem.save();
					}


				});
			}

		});
	});
}