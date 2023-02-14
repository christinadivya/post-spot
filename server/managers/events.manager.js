import Event from '../models/events.model';
import User from '../models/user.model';
import Post from '../models/post.model';
import Followup from '../models/follow_ups.model';
import Report from '../models/report.model';
import notification from '../../config/gcm';
import responseCode from '../../../config/responseCode';
import responseMsg from '../../../config/message';
import async from 'async'
import pick from 'lodash.pick';
const moment = require('moment');

function addEvent(req, callback) {
    req.body.user_id = req.user.id;
    let following_id = [], message;
    User.where({ id: req.user.id}).fetch().then((users) => {
        Event.forge(req.body)
	        .save()
	        .then((events) => {
                Post.forge({ event_id: events.attributes.id, user_id: req.user.id, type: 2 }).save().then((posts) => {
                    Followup.where({ user_id: req.user.id, follows: 1, block: 0 }).fetchAll({ columns: ['following_id']}).then((followings) => {
                        let jsonString = JSON.stringify(followings);
                        let follows = JSON.parse(jsonString);
                        follows.map((res) => {
                            following_id.push(res['following_id']);
                            if(following_id.length == followings.length) {
                                message = "User "+  users.attributes.firstname+' '+ users.attributes.lastname + "  has posted an event";
                                if(following_id.length > 0)
                                  notification.sendNotification({ message: message,
                                      to_user_id: following_id, user_id: req.user.id, notification_type: 6, post_id: posts.attributes.id, my_picture_id: null, event_id: events.attributes.id, tag_id: null,  shared_id: null, share: null, event_date: events.attributes.event_date }) 
                            }
                        })
                       
                    })
                   
                    callback(null, { data: events, code: responseCode.ok });
                })
            })
        })
}

function updateEvent(req, callback) {
    req.body.id = req.body.event_id;
    req.body.user_id = req.user.id;
    let following_id = [], message;
    let params = pick(req.body,['id', 'user_id', 'event_name', 'event_date', 'event_description', 'event_location', 'event_lat', 'event_lon', 'image_url', 'image_type', 'image_dimension', 'image_width', 'image_height' ]);
    Event.where({ id: req.body.event_id, user_id: req.user.id }).fetch().then((events) => {
        if(events) {
           events.save(params, { patch: true })
           .then((eventUpdated) => {
               Post.where({ event_id: req.body.event_id }).save({ updated_at: eventUpdated.attributes.updated_at }, { patch: true }).then((events) => {
                    console.log(events);
                    Followup.where({ user_id: req.user.id, follows: 1, block: 0 }).fetchAll({ columns: ['following_id']}).then((following_ids) => {
                        let jsonString = JSON.stringify(following_ids);
                        following_ids = JSON.parse(jsonString);
                        following_ids.map((res) => {
                            following_id.push(res['following_id']);
                            if(following_id.length == following_ids.length) {
                             User.where({ id: req.user.id }).fetch().then((users) => {
                               message = "User "+  users.attributes.firstname+' '+ users.attributes.lastname + " has updated an event";
                               if(following_id.length > 0)
                                  notification.sendNotification({ message: message,
                                     to_user_id: following_id, user_id: req.user.id, notification_type: 7, post_id: events.attributes.id, my_picture_id: null, event_id: req.body.event_id, tag_id: null,  shared_id: null, share: null, event_date: events.attributes.event_date });
                                  })
                               }
                            })
                        })
                    })
               callback(null, { data: eventUpdated, code: responseCode.ok });
           })
        }
        else {
            callback({ message: responseMsg.messages.noData, code: responseCode.badRequest }, null);
        }
    })	        
}

function deleteEvent(req,callback) {
    Event.where({id: req.body.event_id, user_id: req.user.id })
    .fetch()
    .then((events) => {
        if(events) {
          events.destroy().then((updated) => {
            Post.where({ event_id: req.body.event_id }).fetch().then((eventPosts) => {
                console.log(eventPosts);
                eventPosts.destroy().then((updatedEvents) => {
                    callback(null, { data: { message: "Event Deleted Successfully" }, code: responseCode.ok });
                })
           })
            })
        }
        else {
            callback({ message: responseMsg.messages.noData, code: responseCode.badRequest }, null);
        }
    })
}

function listEvent(req,callback) {
    let today_date = moment.utc(new Date()).format('YYYY-MM-DD');
    let end_date = moment(today_date).add(60, 'days').format('YYYY-MM_DD');

    let query = function(qb) {
        if(req.query.search == null && req.query.search == undefined) 
            qb.whereBetween('event_date',[today_date, end_date])
        else {
            qb.whereBetween('event_date',[today_date, end_date])
            qb.where('event_date', 'LIKE', "%"+req.query.search+"%")
        }
   }
    Event.query(query).where({user_id: req.user.id })
    .fetchAll({ withRelated: ['user'] })
    .then((events) => {
        callback(null, { data: events, code: responseCode.ok });
    })
}

function listAllEvents(req,callback) {
    let pageNo = req.query.page || 1;
    let result = [], report_ids =[];
    async.waterfall([
        function(done) {
            Report.where({ user_id: req.user.id }).fetchAll({ columns: ['reporting_id']}).then((report) => {
              let jsonString = JSON.stringify(report);
              let finalReport = JSON.parse(jsonString);
              if(finalReport.length> 0) { 
                finalReport.forEach(element => {
                    report_ids.push(element.reporting_id)
                  if(finalReport.length == report_ids.length)   done(null, report_ids)
              });
             }
             else {
               done(null,report_ids)
             }
             })
        },  
    function(err, done) {
        Followup.where({ user_id: req.user.id, follows: 1, block: 0}).query(function(qb) {
            console.log(report_ids)
            if(report_ids.length > 0)
               qb.where('following_id', 'NOT IN', report_ids )
        }
        ).fetchAll({columns: ['following_id']}).then((follows) => {
         let jsonString = JSON.stringify(follows);
         let finalValue = JSON.parse(jsonString);
         console.log(finalValue)
         if(finalValue.length > 0) {
            finalValue.forEach(element => {
                result.push(element.following_id)
                if(finalValue.length == result.length)
                    done(null, result)
            });
         } 
         else {
           done(null,result)  
         } 
        
        })
    }
 ], function(err, done) {
     if(err) {
         callback({message: err, code:responseCode.badRequest}, null)
     }
     else {
        result.push(req.user.id)
        let today_date = moment.utc(new Date()).format('YYYY-MM-DD');
        let end_date = moment(today_date).add(60, 'days').format('YYYY-MM_DD');
        console.log(today_date, "###", end_date)
        let query = function(qb) {
             qb.where('user_id', 'IN', result )
         }
         Event.query(query).query(function(qb){
          if(req.query.search == null && req.query.search == undefined) 
             qb.whereBetween('event_date',[today_date, end_date])
          else {
             qb.whereBetween('event_date',[today_date, end_date])
             qb.where('event_date', 'LIKE', "%"+req.query.search+"%")
         }
         }).fetchPage({ page: pageNo, pageSize: 20, withRelated: ['user'] }).then((events) => {
            let jsonString = JSON.stringify(events);
            let eventsObj = JSON.parse(jsonString);
            
            Promise.all(eventsObj.sort(function(a,b){
                var c = new Date(a['event_date']);
                var d = new Date(b['event_date']);
                return c-d;
            }));
            callback(null, { data:{ data: eventsObj, total_page: events.pagination.pageCount } , code: responseCode.ok });
      })
      }
     })
 }
 
function eventNotify() {
    let following_id = [];
    Event.forge().fetchAll().then((events) => {
        let jsonString = JSON.stringify(events);
        events = JSON.parse(jsonString);
        let MS_PER_DAY = 1000 * 60 * 60 * 24;
        events.map((event) => {
            let today_date = new Date();
            let event_date = new Date(event['event_date']);
            today_date = Date.UTC(today_date.getFullYear(), today_date.getMonth(), today_date.getDate());
            event_date = Date.UTC(event_date.getFullYear(), event_date.getMonth(), event_date.getDate());
            let diffDays = Math.floor((event_date - today_date) / MS_PER_DAY);
            if(diffDays == 1) {
                Followup.where( { user_id: event['user_id'], follows: 1, block: 0 }).fetchAll({ columns: ['following_id']}).then((following_ids) => {
                    let jsonString = JSON.stringify(following_ids);
                    following_ids = JSON.parse(jsonString);
                    Promise.all(following_ids.map((res) => {
                            following_id.push(res['following_id']);
                            if(following_id.length == following_ids.length) {
                                 User.where({ id: event['user_id']}).fetch().then((users) => {
                                    Post.where({ event_id: event['id']}).fetch().then((posts)=> {
                                        Event.where({ id: event['id']}).fetch().then((events)=> {
                                        let message = "User " +  users.attributes.firstname+' '+ users.attributes.lastname + "." + "A gentle reminder on this "+ event['event_name'] +" event."
                                        if(following_id.length > 0) {
                                            notification.sendNotification({ message: message,
                                                to_user_id: following_id, user_id: users.attributes.id, notification_type: 12, post_id: posts.attributes.id, my_picture_id: null, event_id: posts.attributes.event_id, tag_id: null, shared_id: null, share: null, event_date: events.attributes.event_date });
                                                following_id = [];
                                                return;
                                        }                                                                                
                                        else{
                                            following_id = [];
                                            return
                                        } 
                               })
                           })
                        })
                      }
                   })
                )
                })
        }
    })
 })

}

function getEvent(req, callback) {
    Event.where({ id: req.query.event_id }).fetchAll({ withRelated: ['user'] }).then((events) => {
        if(events) {
            callback(null, { data: events, code: responseCode.ok });
        }
        else {
            callback({ message: responseMsg.messages.noData, code: responseCode.badRequest }, null);
        }
    })
}

export default { addEvent, listEvent, updateEvent, deleteEvent, listAllEvents, eventNotify, getEvent };