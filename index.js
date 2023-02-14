
// config should be imported before importing any other file
import config from './config/config';
import app from './config/express';
import db  from './server/mysqldb';
import cronJob from './config/cronjob';


const debug = require('debug')('my:index');
const instance = {};
// make bluebird default Promise
Promise = require('bluebird'); // eslint-disable-line no-global-assign

// plugin bluebird promise in mongoose
// mongoose.Promise = Promise;

// // connect to mongo db
// const mongoUri = config.mongo.host;
// mongoose.connect(mongoUri, { server: { socketOptions: { keepAlive: 1 } } });
// mongoose.connection.on('error', () => {
//   throw new Error(`unable to connect to database: ${mongoUri}`);
// });

// // print mongoose logs in dev env
// if (config.MONGOOSE_DEBUG) {
//   mongoose.set('debug', (collectionName, method, query, doc) => {
//     debug(`${collectionName}.${method}`, util.inspect(query, false, 20), doc);
//   });
// }
// ;

var server = require('http').createServer(app);
var io = require('socket.io')(server);
var socketObjects = {};


io.on('connection',function(socket){
    socket.on('register',function(userId){
    	console.log('adasd')
    	if(userId) socketObjects[userId] = socket;
    });
});

module.exports = {
	sendNotification : sendNotification,	
};

function sendNotification(notificationObject){
	var socketObj = socketObjects[notificationObject.userId];
	if(socketObj){
		socketObj.emit('notification'+notificationObject.userId,notificationObject);
	}
}

// module.exports = io;



db.initialisation();

// module.parent check is required to support mocha watch
// src: https://github.com/mochajs/mocha/issues/1912
if (!module.parent) {
  // listen on port config.port
  app.listen(config.config.port, () => {
		cronJob.sendReminder();
		cronJob.everyMonday();
    console.info(`server started on port ${config.config.port} (${config.config.env})`); // eslint-disable-line no-console
  });
}

export default app;
