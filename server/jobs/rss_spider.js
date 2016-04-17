var models = require('../models');
var fetchRss = require('../lib/fetch_rss');


var every = require('schedule').every;
var channelModel = models['channel']
var itemModel = models['item'];



var channels = channelModel.find().exec(function(err, channels) {
	if (err) return handleError(err);

	channels.forEach(function(channel) {
		var feedUrl = channel.feedUrl;


		if (feedUrl) {
			fetchRss(channel);



			every('10m').do(function() {
				fetchRss(channel);
			});
		}

	});
});