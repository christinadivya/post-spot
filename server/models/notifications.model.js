// Notification Model
import Schema from '../../config/mysql.js'; 
import NotificationType from '../models/notification_type.model';

const Notifications =Schema.Bookshelf.Model.extend({
    tableName: 'notifications',
    hasTimestamps: true,

      from: function () {
        return this.belongsTo('User','user_id');
      },

      to: function () {
        return this.belongsTo('User','to_user_id');
      },
        
      post: function () {
        return this.belongsTo('Post','post_id');
      },

      event: function () {
        return this.belongsTo('Event','event_id');
      },

      my_picture: function () {
        return this.belongsTo('Mypicture','my_picture_id');
      },

      tag: function () {
        return this.belongsTo('Tag','tag_id');
      },

      shared: function () {
        return this.belongsTo('User','shared_id');
      },

      notification_type: function () {
        return this.belongsTo(NotificationType,'notification_type');
      },
})

module.exports = Schema.Bookshelf.model('Notifications', Notifications);