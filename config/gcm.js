const Tokens = require('../server/models/tokens.model');
const Notifications = require( '../server/models/notifications.model');
const async = require('async');
const gcm = require('node-gcm');
const sender = new gcm.Sender('AAAAzzWFXw8:APA91bEtDZ-A26BvJNzVFF5p4PfriuXLMXoN3CxW5B5Xmvy6ot9iBORJaXM1uY11SKfE7_I4tqUTd0C8w4tp7NpaTsehpCsRh3bUmnuANkOGCTvo7b_96KpmnuZZIgobFv4GHOYLuU_a');

module.exports.sendNotification = function(req){
  // console.log("%%^^&&*(")
  // console.log(req)
  let notification_type= req.notification_type;
  let notification_message = req.message;
  let userIds = req.to_user_id;
  // console.log("**", userIds)
  // Create GCM message
  let message, notification_ids = []; 
  async.waterfall([ 
    function(done) {
      let notification_objects = [];
      for(let user_id of userIds) {
        notification_objects.push({ message: notification_message, to_user_id: user_id, user_id: req.user_id, post_id: req.post_id, my_picture_id: req.my_picture_id, event_id: req.event_id, notification_type: notification_type, 
          tag_id: req.tag_id, shared_id: req.shared_id, share: req.share, event_date: req.event_date })
      }
      let notification = Notifications.collection(notification_objects);
      notification.invokeThen('save').then((notifications) => {
        // console.log(notifications)
        let jsonString = JSON.stringify(notifications);
        let finalValue = JSON.parse(jsonString);
            Promise.all(finalValue.map((res) => {
              notification_ids.push(res['id'])
              return;
            }));
            done(null, notification_ids)
      }).catch((e) => {
        console.log(e);
      });
  },
      function(err, done) {
        // console.log("***", notification_ids);
        for(let notification_id of notification_ids) {
          Notifications.where({ id: notification_id }).fetch({ withRelated: ['notification_type', 'from', 'to'] }).then((notifications) => {
            let jsonString = JSON.stringify(notifications);
            let finalObject = JSON.parse(jsonString);
            // console.log("%%f", finalObject.to.id)
            Tokens.where({ user_id: finalObject.to.id }).fetchAll().then((tokens) => {
              let jsonString = JSON.stringify(tokens);
              let finalToken = JSON.parse(jsonString);
              // console.log('^^',finalToken)
              if(finalToken.length > 0) {
                Notifications.where({ to_user_id: finalObject.to.id, status: 'unread' }).count().then((notifications) => {                
                  finalToken.map((res) => {
                    // console.log("***", res['platform'])
                    if (res['platform'] == 1 ) {
                      message = new gcm.Message(
                        {   
                          registration_ids: finalObject.to.id,
                          data:{
                            show_in_foreground:true,
                            id: finalObject.id,
                            post_id: req.post_id,
                            my_picture_id: req.my_picture_id,
                            event_id: req.event_id,
                            notification_type_id: req.notification_type,
                            user_id: finalObject.from.id,
                            to_user_id: finalObject.to.id,
                            shared_id: req.shared_id,
                            share: req.share,
                            tag_id: req.tag_id,
                            event_date: req.event_date,  
                            title: finalObject.from.firstname+' '+ finalObject.from.lastname,
                            message: notification_message,
                            badge: notifications
                          },
                          notification: {
                            title: finalObject.from.firstname+' '+ finalObject.from.lastname,
                            body: notification_message,
                            id: finalObject.id,
                            post_id: req.post_id,
                            my_picture_id: req.my_picture_id,
                            event_id: req.event_id,
                            notification_type_id: req.notification_type,
                            shared_id: req.shared_id,
                            share: req.share,
                            tag_id: req.tag_id,
                            event_date: req.event_date,  
                            user_id: finalObject.from.id,
                            to_user_id: finalObject.to.id,
                            message: notification_message,
                            badge: notifications,
                            show_in_foreground:true,
                            priority:'high',
                            sound: true
                      }
                    });
                    } else if(res['platform'] == 2) {
                      message = new gcm.Message(
                        { 
                          notification: {
                            title: finalObject.from.firstname+' '+ finalObject.from.lastname,
                            body: notification_message,
                            show_in_foreground: true,
                            content_available : true,
                            sound: "default",
                            badge: notifications,
                            priority:'high'
                          },
                            data: {
                              show_in_foreground: true,
                              id: finalObject.id,
                              post_id: req.post_id,
                              my_picture_id: req.my_picture_id,
                              event_id: req.event_id,
                              notification_type_id: req.notification_type, 
                              user_id: finalObject.from.id,
                              to_user_id: finalObject.to.id,
                              shared_id: req.shared_id,
                              share: req.share,
                              tag_id: req.tag_id,
                              event_date: req.event_date 
                            },
                           })
                  }
                  console.log(message);
                  sender.send(message, { registrationTokens: [res['token']] }, function (err, response) {
                   if (err) console.error(err) ;
                   else console.log(response);
               });
            })
          }).catch((e) => {
            console.log(e);
          });
        }
      }).catch((e) => {
        console.log(e);
      });
          }).catch((e) => {
            console.log(e);
          });
        }
      }
      
    ],)
  }

  module.exports.singleNotification = function(req){
    // console.log("%%^^&&*(")
    // console.log(req)
    let notification_type= req.notification_type;
    let notification_message = req.message;
    let userIds = req.to_user_id;
    // console.log("**", userIds)
    // Create GCM message
    let message, notification_ids = []; 
    async.waterfall([ 
      function(done) {
        let notification_objects = [];
        for(let user_id of userIds) {
          notification_objects.push({ message: notification_message, to_user_id: user_id, user_id: req.user_id, post_id: req.post_id, my_picture_id: req.my_picture_id, event_id: req.event_id, notification_type: notification_type,
            tag_id: req.tag_id, shared_id: req.shared_id, share: req.share, event_date: req.event_date })
        }
        let notification = Notifications.collection(notification_objects)
        notification.invokeThen('save').then((notifications) => {
          // console.log(notifications)
          let jsonString = JSON.stringify(notifications);
          let finalValue = JSON.parse(jsonString);
              Promise.all(finalValue.map((res) => {
                notification_ids.push(res['id'])
                return;
              }))
              done(null, notification_ids)
        }).catch((e) => {
          console.log(e);
        });
  
    },
        function(err, done) {
          // console.log(notification_ids);
          for(let notification_id of notification_ids) {
            Notifications.where({ id: notification_id }).fetch({ withRelated: ['notification_type', 'from', 'to'] }).then((notifications) => {
              let jsonString = JSON.stringify(notifications);
              let finalObject = JSON.parse(jsonString);
              // console.log(finalObject.to.id)
              Tokens.where({ user_id: finalObject.to.id }).fetchAll().then((tokens) => {
                console.log(okens)
                let jsonString = JSON.stringify(tokens);
                let finalToken = JSON.parse(jsonString);
                if(tokens.length > 0) {
                  Notifications.where({ to_user_id: finalObject.to.id, status: 'unread' }).count().then((notifications) => {
                    finalToken.map((res) => {
                    if (res['platform'] == 1 ) {
                      message = new gcm.Message(
                        {   
                          registration_ids: finalObject.to.id,
                          data:{
                            show_in_foreground:true,
                            id: finalObject.id,
                            post_id: req.post_id,
                            my_picture_id: req.my_picture_id,
                            event_id: req.event_id,
                            notification_type_id: req.notification_type,
                            user_id: finalObject.from.id,
                            to_user_id: finalObject.to.id,
                            shared_id: req.shared_id,
                            share: req.share,
                            tag_id: req.tag_id,
                            event_date: req.event_date,  
                            title: finalObject.from.firstname+' '+ finalObject.from.lastname,
                            message: notification_message,
                            badge: notifications
                          },
                          notification: {
                            title: finalObject.from.firstname+' '+ finalObject.from.lastname,
                            body: notification_message,
                            id: finalObject.id,
                            post_id: req.post_id,
                            my_picture_id: req.my_picture_id,
                            event_id: req.event_id,
                            notification_type_id: req.notification_type,
                            shared_id: req.shared_id,
                            share: req.share,
                            tag_id: req.tag_id,
                            event_date: req.event_date,  
                            user_id: finalObject.from.id,
                            to_user_id: finalObject.to.id,
                            message: notification_message,
                            badge: notifications,
                            show_in_foreground:true,
                            priority:'high',
                            sound: true
                      }
                    });
                    } else if(res['platform'] == 2) {
                      
                      message = new gcm.Message(
                        { 
                          notification: {
                            title: finalObject.from.firstname+' '+ finalObject.from.lastname,
                            body: notification_message,
                            show_in_foreground: true,
                            content_available : true,
                            sound: "default",
                            badge: notifications,
                            priority:'high'
                          },
                            data: {
                              show_in_foreground: true,
                              id: finalObject.id,
                              post_id: req.post_id,
                              my_picture_id: req.my_picture_id,
                              event_id: req.event_id,
                              notification_type_id: req.notification_type, 
                              user_id: finalObject.from.id,
                              to_user_id: finalObject.to.id,
                              shared_id: req.shared_id,
                              share: req.share,
                              tag_id: req.tag_id,
                              event_date: req.event_date 
                            },
                           })
                  }
                  console.log(message);
                  // console.log("&&& IOS");
                  // console.log(res['token']);
                  sender.send(message, { registrationTokens: [res['token']] }, function (err, response) {
                   if (err) console.error(err);
                   else console.log(response);
               });
                  })
            }).catch((e) => {
              console.log(e);
            });
          }
        }).catch((e) => {
          console.log(e);
        });
            }).catch((e) => {
              console.log(e);
            });
          }
        }
        
      ],)
    }
  