var express = require('express');

// var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
// var mongoUrl = "mongodb://127.0.0.1:27017/uiradar";
var mongoose = require('mongoose');
var mongo_url = 'mongodb://127.0.0.1:27017/uiradar';  // test connection

var db;

var options = {
  server: {},
  replset: {}
};
options.server.socketOptions = options.replset.socketOptions = { keepAlive: 1};

var deviceSchema = mongoose.Schema({
  device_id: Number,
  users: [{ user_id: Number }],
  location: String
});
var Device = mongoose.model('Device', deviceSchema);

var trajectorySchema = mongoose.Schema({
  device_id: Number,
  x: Number, 
  y: Number, 
  z: Number,
  // x_coord: Number,
  // y_coord: Number,
  // z_coord: Number,
  timestamp: String
});
var Trajectory = mongoose.model('Trajectory', trajectorySchema);

var byteoffset = 0;
var chunk_size = 41640;

var traj_offset = 41600;
var traj_size = 12

var id_offset = 41612;
var id_size = 4;

var time_offset = 41632;
var time_size = 8;

var trajectoryObj = {};
var counter = 0;

trajectoryObj.id = counter;

var xmin = -5.0;
var xmax = 5.0;
var ymin = 0.0;
var ymax = 10.0;
var zmin = 0.0;
var zmax = 2.0;

// trajectory data offset=41600 and size=12
// num_dev offset=41612 and size=4
// file_name offset=41624 and size=7
// time offset=41616 and size=8
// timestamp offset=41632 and size=8
// Chunk size: 41640




// var connectToDB = function(url, callback) {
//   MongoClient.connect(url, function(err, db) {
//     // assert.equal(null, err);
//     // return db;
//     callback(err, db);
//   });
// }

// var handleDBConnection = function(err, db) {
//   if (err === null) {
//     console.log("connected to db");
//     return db;
//   }
//   console.log(err);
// }


var app = express();

//app.use(app.router);

app.get('/', function (req, res) {
  res.render('index');
});

// const default_http_port = 3000;
// const http_port = process.env.PORT || default_http_port
// app.listen(http_port);
// console.log("Listening on port: " + http_port);


// var WebSocketServer = require('ws').Server;
// var wss = new WebSocketServer({ server:  app});

// var clientId = 0;
// wss.on('connection', function connection(ws) {
//   var thisId = client++;
//   console.log('WS client #%d connected', thisId);
//   var location = url.parse(ws.upgradeReq.url, true);
//   // you might use location.query.access_token to authenticate or share sessions 
//   // or ws.upgradeReq.headers.cookie (see http://stackoverflow.com/a/16395220/151312) 
  
//   // ws.on('message', function incoming(message) {
//   //   console.log('received: %s', message);
//   // });

//   // ws.on('close', function() {
//   // 	console.log("closing client #%d", thisId);
//   // });
 
//   // ws.send('something');
// });


var insertDocument = function(db, trajectory, device_id, ts) {
   db.collection('trajectories').insertOne( {
      "trajectory" : {
         "x_coord" : trajectory.x,
         "y_coord" : trajectory.y,
         "z_coord" : trajectory.z
      },
      "device_id" : dev,
      "timestamp" : ts,
   }, function(err, result) {
    assert.equal(err, null);
    console.log("Inserted a document into the trajectories collection.");
    // callback(result);
    return result;
  });
};


/* Takes callback of form function(hasData, dataOffset)
 * where hasData is a boolean and dataOffset is an int
 */
function containsData(byteoffset, data_offset, data_size, chunk_size, callback) {
      // if traj data falls in this buffer
    if (byteoffset <= data_offset && byteoffset + chunk_size > data_offset) {
      
      // if the buffer contains all the traj data
      if (byteoffset + chunk_size > data_offset + data_size) {
        // trajectory = {};

        var offset = data_offset - byteoffset;

        // var x = data.readFloatLE(offset);
        // var y = data.readFloatLE(offset + 4);
        // var z = data.readFloatLE(offset + 8);

        // trajectory.x = x;
        // trajectory.y = y;
        // trajectory.z = z;

        // callback(true, offset);
        return offset;

        // num_dev offset=41612 and size=4
        // file_name offset=41624 and size=7
        // time offset=41616 and size=8
        

        // console.log(trajectory);

      } else {  // otherwise, the data gets cut off
        console.log("data cut off");
        // callback(false, offset);
        return offset;
      }

    }
    // callback(false, null);
    return false;
}

function generateRandomNumber(min, max) {
    var r = Math.random() * (max - min) + min;
    return r;
};

function handleTrajectoryData(data, offset) {
  trajectory = {};

  var x = data.readFloatLE(offset);
  var y = data.readFloatLE(offset + 4);
  var z = data.readFloatLE(offset + 8);

  // console.log("received trajectories(%d,%d,%d)", % )
  // x = generateRandomNumber(xmin, xmax);
  // y = generateRandomNumber(ymin, ymax);
  // z = generateRandomNumber(zmin, zmax);

  trajectory.x = x;
  trajectory.y = y;
  trajectory.z = z;

  // console.log("coordinates", trajectory);
  // callback(trajectory);
  return trajectory;
}

function handleFlatField(data, offset) {
  var field = data.readInt32LE(offset);
  console.log(field);
  return field;
}



function handleTimestamp(data, offset) {
  // var timestamp = data.readInt32LE(offset);
  var timestamp = data.toString(offset);
  console.log("timestamp", timestamp)
  return timestamp;
}

function handleDeviceId(data, offset) {
  var deviceId = data.readInt32LE(offset);
  // console.log("device_id", deviceId)
  return deviceId;
}




var tls = require('tls');
var fs = require('fs');

var port = 8080;

var options = {
  // key: fs.readFileSync('server-key.pem'),
  // cert: fs.readFileSync('server-cert.pem'),
  key: fs.readFileSync('./certificates/server.key'),
  cert: fs.readFileSync('./certificates/server.crt'),


  // This is necessary only if using the client certificate authentication.
  // requestCert: true,
  // rejectUnauthorized: false

  // This is necessary only if the client uses the self-signed certificate.
  // ca: [ fs.readFileSync('client-cert.pem') ]
  // secureProtocol: "SSLv3_method"
};

function checkBufferContains(currentByteOffset, memberByteOffset, memberSize, bytes) {
	if ((currentByteOffset<=memberByteOffset) && (currentByteOffset+bytes > memberByteOffset)) {  		
  		if (currentByteOffset+bytes > memberByteOffset+memberSize) {
  			console.log("bystream contains member");
  		}
  	}
}

function readBufferData(data, Trajectory, callback) {
  bytes = data.length;

  console.log("reading", bytes, "from buffer at byteoffset", byteoffset);

  var traj_start = containsData(byteoffset, traj_offset, traj_size, bytes);
  
  // var coords; 
  console.log("trajectory data starts at", traj_start);

  var trajectory_data = {};

  if (traj_start !== false) {
      var coordinates = handleTrajectoryData(data, traj_start);
      trajectory.x = coordinates.x;
      trajectory.y = coordinates.y;
      trajectory.z = coordinates.z;
      // trajectory_data.x = coords.x;
      // trajectory_data.y = coords.y;
  }


  var id_start = containsData(byteoffset, id_offset, id_size, bytes);
  if (id_start !== false) {
      trajectory_data.device_id = handleDeviceId(data, id_start);
  }

  // var trajectory_data = {};
  // trajectory_data.x = traj.x;
  // trajectory_data.y = traj.y;
  // trajectory

  // var ts = containsData(byteoffset, time_offset, time_size, bytes);
  // if (time_start !== false) {
  //     ts = handleTimestamp(data, time_start);
  // }

  // callback(trajectory_data, Trajectory, bytes);
  
  // trajectory = new Trajectory({ device_id: device_id, coordinates: {x: traj.x, y: traj.y, z: traj.z}, timestamp: String(new Date().getTime())});
  // trajectory.save(function(err, trajectory) {
  //   if (err) return console.log(err);
  //   console.log('saved successfully');
  // })

  // byteoffset += bytes;
}

function insertTrajectoryData(trajectory, Trajectory, bytes) {
  var trajectoryDoc = new Trajectory({ device_id: trajectory.device_id, coordinates: {x: trajectory.x, y: trajectory.y, z: trajectory.z}, timestamp: String(new Date().getTime())});
  trajectoryDoc.save(function(err, trajectoryDoc) {
    if (err) return console.log(err);
    console.log(trajectory, "saved successfully");
    updateByteOffset(bytes);
  })

}

function updateByteOffset(bytes) {
    byteoffset += bytes;
}


var server = tls.createServer(options, function(socket) {

  
   
    // db.once("open", function (callback) {
    //   console.log("db connection opened");
    // });

    // var device1 = new Device({ device_id: 1, users: [{user_id: 100, user_id: 101}]});
    // device1.save(function(err, device1) {
    //   if (err) return console.log(err);
    //   console.log('saved successfully');
    // })



    // var chunkInProgress = true;
    socket.addListener("error", function (err) {
        console.log("socket error", err);
    });

    socket.addListener("data", function (data) {
      
      bytes = data.length;
      // console.log("reading", bytes, "from buffer at byteoffset", byteoffset);

      var traj, 
          device_id, 
          time_start;

      var traj_start = containsData(byteoffset, traj_offset, traj_size, bytes);
      if (traj_start !== false) {
          var coordinates = handleTrajectoryData(data, traj_start);
          trajectoryObj.x = coordinates.x;
          trajectoryObj.y = coordinates.y;
          trajectoryObj.z = coordinates.z;
      }


      var id_start = containsData(byteoffset, id_offset, id_size, bytes);
      if (id_start !== false) {
          device_id = handleDeviceId(data, id_start);
          trajectoryObj.deviceId = device_id;
      }

      // // var ts = containsData(byteoffset, time_offset, time_size, bytes);
      // // if (time_start !== false) {
      // //     ts = handleTimestamp(data, time_start);
      // // }
      
      // trajectory = new Trajectory({ device_id: device_id, coordinates: {x: traj.x, y: traj.y, z: traj.z}, timestamp: String(new Date().getTime())});
      // trajectory.save(function(err, trajectory) {
      //   if (err) return console.log(err);
      //   console.log('saved successfully');
      // })


      byteoffset += bytes;

      // readBufferData(data, Trajectory, insertTrajectoryData);

      // console.log(byteoffset);
      if (byteoffset > chunk_size) {
        console.log("buffer overlaps on new chunk");
      }

      byteoffset = byteoffset % chunk_size;

      if (byteoffset == 0) {
        // console.log(counter);
        var timestamp = "" + new Date().getTime();
        trajectoryObj.timestamp = timestamp;        
        console.log(trajectoryObj);
        console.log();

        // TODO: use timestamp from device instead of setting it here

        var trajectoryDoc = new Trajectory({ device_id: trajectoryObj.deviceId, x: trajectoryObj.x, y: trajectoryObj.y, z: trajectoryObj.z, timestamp: trajectoryObj.timestamp});
        trajectoryDoc.save(function(err, trajectoryDoc) {
          if (err) return console.log(err);
          console.log("saved successfully:", trajectoryDoc);
            // updateByteOffset(bytes);
        });

        Trajectory.find({device_id: trajectoryObj.device_id}, function (err, trajectories) {
          if (err) return console.log(err);
          // console.log(trajectories.length);
        });

        trajectoryObj = {};
        counter += 1;
        trajectoryObj.id = counter;
      }
    // });

    });
  // });

  
  // if (db === null) {
  //   console.log("error connecting to db.");
  //   console.log("closing socket.");
  //   soocket.close();
  // }
  
  // if (!socket.authorized) {
  //   console.log("socket unauthorized");
  //   console.log(socket.authorizationError);
  // }
 
  socket.pipe(socket);
  socket.addListener('close', function (callback) {
    console.log("socket connectiong closing");
  })
  socket.addListener('clientError', function (err, tlssocket) {
    console.log("client error:", err);
  })

});

server.listen(port, function() {
  console.log('server bound and listening on port', port);
  mongoose.connect(mongo_url, options);
  db = mongoose.connection;
  db.on('error', function (err) {
    console.error.bind(console, 'connection error:');
  });
  // db.once('open', function (callback) {
  //   console.log('db opened');
  //   console.log('server bound and listening on port', port);
  // });
});
