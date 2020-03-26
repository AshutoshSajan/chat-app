const moment = require("moment");

function formatMsg(username, text) {
	return {
		username,
		text,
		time: moment().format("h:m a")
	};
}

module.exports = formatMsg;
