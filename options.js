const args = require('yargs/yargs')(process.argv.slice(2))
.default({ latitude: 0, longitude: 0, maxDistance: 100 })
.argv;

if (args.help) {
	console.log(args)
}
module.exports = {
	baseLocation: {
		latitude: args.latitude,
		longitude: args.longitude
	},
	maxDistance: args.maxDistance,
	dateFilter: args.dateFilter ? new Date(args.dateFilter) : new Date()
}