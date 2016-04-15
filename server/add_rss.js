var program = require('commander');
var models = require('./models');
var parser = require('rss-parser');


program
	.arguments('<feedUrl>')
	.action(function(feedUrl) {

		parser.parseURL(feedUrl, function(err, parsed) {
			var title = parsed.feed.title;
			var link = parsed.feed.link;
			var description = parsed.feed.description;

			var channelModel = models.channel;

			channelModel.findOne({
				'link': link
			}).exec(function(err, channel) {
				if (err) return handleError(err);

				console.log(channel);
				if (channel == null) {
					var channel = new channelModel({
							'title': title,
							'link': link,
							'feedUrl': feedUrl,
							'description': description
						})
						.save(function(err) {
							if (err) return handleError(err);
							console.log('saved new fedd:' + parsed.feed.title);
						})
				} else {
					console.log('feed is already saved:' + parsed.feed.title);
				}
			});



			// parsed.feed.entries.forEach(function(entry) {
			// 	console.log(entry.title + ':' + entry.link);
			// })
		})

	})
	.parse(process.argv);