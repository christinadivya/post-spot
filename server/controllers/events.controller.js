import EventManager from '../managers/events.manager.js';

module.exports = {
   addEvent: addEvent,
   listEvent: listEvent,
   updateEvent: updateEvent,
   deleteEvent: deleteEvent,
   listAllEvents: listAllEvents,
   getEvent: getEvent
};

function addEvent(req, res, next) {    
  EventManager.addEvent(req,function(err, data) {
    handler(err, data, res, next)
});
}

function getEvent(req, res, next) {    
  EventManager.getEvent(req,function(err, data) {
    handler(err, data, res, next)
});
}

function listEvent(req, res, next) {    
  EventManager.listEvent(req,function(err, data) {
    handler(err, data, res, next)
});
}

function listAllEvents(req, res, next) {    
  EventManager.listAllEvents(req,function(err, data) {
    handler(err, data, res, next)
});
}

function updateEvent(req, res, next) {    
  EventManager.updateEvent(req,function(err, data) {
    handler(err, data, res, next)
});
}

function deleteEvent(req, res, next) {    
  EventManager.deleteEvent(req,function(err, data) {
    handler(err, data, res, next)
});
}

function handler(err, data, res, next) {
    if (err) { 
    return next({message: err.message, status: err.code})
    }
    return res.status(data.code).json({data: data.data});
  }