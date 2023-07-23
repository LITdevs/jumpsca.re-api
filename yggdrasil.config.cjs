module.exports = {
	apps : [{
		script: 'npm run start',
	}],
	// Deployment Configuration
	deploy : {
		phoenix : {
			"user" : "jumpscare",
			"host" : ["kirito.yggdrasil.cat"],
			"ref"  : "origin/phoenix",
			"repo" : "git@github.com:LITdevs/jumpsca.re-api.git",
			"path" : "/home/jumpscare/phoenix",
			"post-deploy" : "yarn install"
		}
	}
};