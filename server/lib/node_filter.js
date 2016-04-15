var keywords = 'node|npm|nodejs|javascript|react';


module.exports = function(str) {


	var s = str;

	if (Array.isArray(str)) {
		s = str.join(',');

	}


	return (s.search(new RegExp(keywords, 'i')) >= 0)


}