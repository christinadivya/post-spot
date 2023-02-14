const cronJob = require('cron').CronJob;
const Event = require('../server/managers/events.manager');
const Notify = require('../server/managers/notification.manager');

exports.sendReminder = function() {
var textJob = new cronJob( '0 6 * * *', function(){
    console.log('calling')
// sec(0-59) min(0-59) hrs(0-23) dayMon(1-31) mon(0-11) dayWeek(0-6) : 0 0 0 1 0-11 *
Event.eventNotify();
}, null, true);
textJob.start();
};

exports.everyMonday = function() {
    var textJob = new cronJob( '0 0 * * MON', function(){
        // var textJob = new cronJob( '*/2 * * * *', function(){
        console.log('calling')
    // sec(0-59) min(0-59) hrs(0-23) dayMon(1-31) mon(0-11) dayWeek(0-6) : 0 0 0 1 0-11 *
    Notify.deleteNotifications();
    }, null, true);
    textJob.start();
    };