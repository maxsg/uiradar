// Router.configure({
// 	layoutTemplate: 'appBody',
// 	waitOn: function() {
// 		return [
// 			Meteor.subscribe('trajectories')
// 		];
// 	}
// });

// Router.route('appBody');

// Router.route('home', {
// 	path: '/',
// 	action: function() {
// 		Router.go('appBody');
// 	}
// });

// Router.configure({
// 	layoutTemplate: 'appBody'
// });

// Router.route('home', {
// 	path: '/',
// 	action: function() {
// 		Router.go('appBody');
// 	}
// })

Router.route('/', function() {
	this.render('appBody');
});

// Router.route('trajectoriesPlotXy');
// Router.route('trajectoriesPlotZ');

// Router.route('home', {
// 	path: '/',
// 	action: function() {
// 		Router.go('appBody');
// 	}
// });