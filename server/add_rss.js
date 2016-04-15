var program = require('commander');
var models = require('./models');
var parser = require('rss-parser');
var md5 = require('md5');


var channelModel = models.channel;
program
	.arguments('<feedUrl>')
	.action(function(feedUrl) {

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
							console.log('saved new fedd:' + parsed.feed.title);
										process.exit();
						});
							});
				} else {
					console.log('feed is already saved');
					console.log(channel);
								process.exit();		

							}

			// parsed.feed.entries.forEach(function(entry) {
			// 	console.log(entry.title + ':' + entry.link);
			// })
		});

	})
	.parse(process.argv);
