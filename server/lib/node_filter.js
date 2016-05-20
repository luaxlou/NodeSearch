var keywords = 'node|npm|javascript|react|es6|es2015|jsx|redux|webpack|nuclide|pm2|koa|express|gulp|babel|react-router|commander|jade|mocha|request|socket\.io';


module.exports = function(str) {


	var s = str;

	if (Array.isArray(str)) {
		s = str.join(',');

	}



	return (s.search(new RegExp(keywords, 'i')) >= 0)


}
