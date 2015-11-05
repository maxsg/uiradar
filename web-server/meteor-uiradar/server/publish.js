if (Meteor.isServer) {

	Meteor.publish("trajectories", function() {
		return Trajectories.find();
	});
	
}