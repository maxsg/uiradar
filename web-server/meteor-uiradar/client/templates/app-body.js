Meteor.subscribe("trajectories");

Template.appBody.helpers({
	trajectories: function() {
		Trajectories.find({device_id: 100});
	},
	trajectoryCount: function() {
		return Trajectories.find({device_id: 100}).count();
	},
	deviceId: function() {
		return 100;
	},
	recentTrajectoryCount: function() {
		return Trajectories.find({device_id: 100, 
															timestamp: {
																$gt: Date.now() - 1000 * 60 * 10 // get only data from 30secs ago
															}}, 
															{sort: {timestamp: -1}}).count(); 
	},
	timeDuration: function() {
		return 30;
	}
});