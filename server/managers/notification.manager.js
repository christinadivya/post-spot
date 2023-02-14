import responseCode from '../../../config/responseCode';
import responseMsg from '../../../config/message';
import Notifications from '../../server/models/notifications.model'
const _ = require('lodash');
const moment = require('moment');

function notifyStatus(req, callback) {  
    let pageNo = req.query.page || 1
    Notifications.where({ to_user_id: req.user.id }).query(function (qb) {
        // qb.orderBy('status', 'DESC')
        qb.orderBy('created_at','DESC')
    }).fetchPage({ page: pageNo, pageSize: 20
    ,withRelated: ['notification_type', 'from'], columns:['id','message','user_id','to_user_id','post_id','my_picture_id','event_id','status','notification_type','tag_id','shared_id','share','event_date','created_at', 'updated_at']}).then((status) => {
        var jsonString = JSON.stringify(status);
        var finalObject = JSON.parse(jsonString);
        console.log(finalObject.length)
        // finalObject.sort((a,b) => (a.status > b.status) ? 1 : ((b.status > a.status) ? -1 : 0));
        callback(null,{ data : { data: finalObject, total_page: status.pagination.pageCount }, code: responseCode.ok });
    }).catch(e => callback({ message: e, code: responseCode.badRequest }, null)); 
}

function updateStatus(req, callback) {  
    Notifications.where({ id: req.body.notification_id, to_user_id: req.user.id }).fetch({ withRelated: ['notification_type']}).then((status) => {
        if(status) {
            if(req.body.status == 'read') {
                status.save({ status : 'read'}, { patch: true }).then((updatedStatus) => {
                    callback(null,{ data: status, code: responseCode.ok });
                })
            }
            else {
                status.save({ status : 'unread'}, { patch: true }).then((updatedStatus) => {
                    callback(null,{ data: status, code: responseCode.ok });
                })
            }  
        }
        else
          callback( { message: responseMsg.messages.norecords, code: responseCode.badRequest },null);
    }).catch(e => callback({ message: e, code: responseCode.badRequest }, null)); 
}

function getDetail(req, callback) {
    Notifications.where({ id: req.query.notification_id, to_user_id: req.user.id })
    .fetch({ withRelated: ['post', 'event', 'notification_type', 'from', 'to', 'my_picture', 'tag', 'shared']}).then((status) => {
        if(status){
               callback(null,{ data: status, code: responseCode.ok });
        }
        else
          callback( { message: responseMsg.messages.norecords, code: responseCode.badRequest },null);
    }).catch(e => callback({ message: e, code: responseCode.badRequest }, null)); 
}

function deleteNotifications() {
    let dateTo = moment().format('YYYY-MM-DD'),
        dateFrom = moment().subtract(7,'d').format('YYYY-MM-DD');
    Notifications.where('status', '=', 'read').query( function (qb) {
        qb.whereBetween('created_at',[dateFrom, dateTo])
    }).destroy().then(()=> {
                console.log('Deleted Successfully');  })
}
function count(req,callback) {
    Notifications.where({ to_user_id: req.user.id, status: 'unread' }).count().then((notifications) => {
        callback(null,{ data: notifications, code: responseCode.ok });
    })

}

export default { notifyStatus, updateStatus, getDetail, count, deleteNotifications }