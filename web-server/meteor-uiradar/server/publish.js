if (Meteor.isServer) {

	Meteor.publish("trajectories-recent", function() {
		return Trajectories.find({device_id: 100}, {sort: {timestamp: -1}, limit: 200});
	});

	Meteor.publish("trajectories", function() {
		return Trajectories.find();
	});
	
}