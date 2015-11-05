Template.trajectoriesPlotXy.rendered = function(){
		//Width and height
		var w = 600;
		var h = 400;
		var padding = 30;
		
		//Create scale functions
		// var xScale = d3.scale.linear()
		// 					 .range([padding, w - padding * 2]);


		// setup x 
		var xValue = function(d) { return d.x;}, // data -> value
		    xScale = d3.scale.linear().range([padding, w - padding * 2]), // value -> display
		    xMap = function(d) { return xScale(xValue(d));}, // data -> display
		    xAxis = d3.svg.axis().scale(xScale).orient("bottom");

		 // setup y
		var yValue = function(d) { return d.y;}, // data -> value
			  yScale = d3.scale.linear().range([h - padding, padding]), // value -> display
			  yMap = function(d) { return yScale(yValue(d));}, // data -> display
			  yAxis = d3.svg.axis().scale(yScale).orient("left");


		// var yScale = d3.scale.linear()
		// 					 .range([h - padding, padding]);

		// var xValue = function(d) { return d.x; };
		// var yValue = function(d) { return d.y; }; 

		//Define X axis
		// var xAxis = d3.svg.axis()
		// 				.scale(xScale)
		// 				.orient("bottom")
		// 				.ticks(10);

		// //Define Y axis
		// var yAxis = d3.svg.axis()
		// 				.scale(yScale)
		// 				.orient("left")
		// 				.ticks(10);

		//Create SVG element
		var svg = d3.select("#trajectoriesPlotXy")
					.attr("width", w)
					.attr("height", h);

		//Define key function, to be used when binding data
		var key = function(d) {
			return d.timestamp;
		};

		var opacity = function(d) {
			var now = new Date().getTime();
			var diff = now - d.timestamp;
		};

		var opacity = d3.scale.ordinal()
			.domain([new Date().getTime() - 1000 * 60 * .5, new Date().getTime()])
			.range([0.0, 1.0]);

		var o = d3.scale.ordinal()
			.domain([new Date().getTime() - 1000 * 60 * .5, new Date().getTime()])
			.range(colorbrewer.RdBu[9]);

		var timeRange = function() {
			var now = new Date().getTime();
			var then = new Date().getTime() - 1000 * 60 * .5;
			return [then, now];
		}


		// var color = function(d) {
		// 	var now = new Date(ISODate().getTime());
		// 	var diff = now - d.timestamp;
		// }



		//Create X axis
		svg.append("g")
				.attr("class", "x axis")
				.attr("line-width", 5)
				.attr("transform", "translate(0," + (h - padding) + ")")
				.call(xAxis)
			.append("text")
				.attr("class", "label")
				.attr("x", w)
				.attr("y", -6)
				.style("text-anchor", "end")
				.text("horizontal disance (meters)")

		
		//Create Y axis
		svg.append("g")
				.attr("class", "y axis")
				.attr("transform", "translate(" + padding + ",0)")
				.call(yAxis)
			.append("text")
	      .attr("class", "label")
	      .attr("transform", "rotate(-90)")
	      .attr("y", 6)
	      .attr("dy", ".71em")
	      .style("text-anchor", "end")
	      .text("depth (meters)");

		Deps.autorun(function(){
			// var dataset = Trajectories.find({device_id: 100}, {sort:{timestamp:-1}}).fetch();
			// var dataset = Trajectories.find({device_id: 100, 
			// 													timestamp: {
			// 														$gt: new Date().getTime() - 1000 * 60 * .5	// get only data from 30secs ago
			// 													}}, 
			// 													{sort: {timestamp: -1}});
			// var dataset = Trajectories.find({device_id: 100}, {sort: {timestamp: -1}}).limit(20).fetch();
			var dataset = Trajectories.find({}).fetch();

			// var dataset = Trajectories.find().sort({timestamp:-1}).limit(10).fetch();
			
			//Update scale domains
			// xScale.domain([d3.min(dataset, xValue)-1, d3.max(dataset, xValue)+1]);
			// yScale.domain([d3.min(dataset, yValue)-1, d3.max(dataset, yValue)+1]);
			xScale.domain([-6, 6]);
			yScale.domain([-1, 11]);

			//Update X axis
			svg.select(".x.axis")
				.transition()
				.duration(1000)
				.call(xAxis);
			
			//Update Y axis
			svg.select(".y.axis")
				.transition()
				.duration(1000)
				.call(yAxis);
			

			var circles = svg
				.selectAll("circle")
				.data(dataset, key);

			//Create
			circles
				.enter()
				.append("circle")
				.attr("cx", xMap)
				.attr("cy", yMap)
				.attr("x", xValue)
				.attr("y", yValue)
				.attr("r", 4)
				// .attr("fill", function(d) { return "rgb(0,0," + + ")"; })
				.attr("fill", function(d) { return "rgb(200,0,50)"; })
				// .attr("fill", function(d) { return o(d.timestamp); })
				// .attr("fill-opacity", function(d) { return d.timestamp; })
				// .attr("fill-opacity", function(d) { return opacity(d.timestamp); })
				.attr("fill-opacity", function(d) { return 1.0; })
				.attr("timestamp", function(d) { return d.timestamp; });

			// Update
			circles
				.transition()
				.duration(3000)
				.transition()
				.duration(1000)
				.attr("fill", function() { return "rgb(50,0,200)"; })
				.attr("fill-opacity", function() { return 0.0; })
				.remove();

				// .attr("fill", function() { return "blue"; })
				// .transition()
				// .duration(2000)
				// .attr()
				// .attr("fill-opacity", function() { return 0.0; });
				// .remove();
				// .attr("fill", function)
				// .attr("cx", function(d) {
				// 	return xScale(d.x);
				// })
				// .attr("cy", function(d) {
				// 	return yScale(d.y);
				// });

			//Remove
			circles
				.exit()
				.transition()
				.duration(1000)
				.attr("fill", function() { return "rgb(50,0,200)"; })
				.attr("fill-opacity", function() { return 0.0; })
				.remove();
		});
};