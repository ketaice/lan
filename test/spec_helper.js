var async, env;

env = require("../app.js");

function createUser() {

}
function createDevice() {
	
}
module.exports.globalSetup = function() {
	if (this.app != null) {
		return;
	}

	this.app = env.app;
	return env.configure();
};
