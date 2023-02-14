import Schema from '../../config/mysql.js';
import Notification from '../models/notifications.model';

const Tag = Schema.Bookshelf.Model.extend({
  tableName: 'tag',
  hasTimestamps: true,
 
  user: function () {
    return this.belongsTo('User','user_id');
  },

  tag_id: function () {
    return this.belongsTo('User','tag_id');
  },

  post: function () {
    return this.belongsTo('Post','post_id');
  },

  image: function () {
    return this.belongsTo('Mypicture', 'my_picture_id');
  },

  notification: function () {
    return this.hasMany(Notification);
  }

});

module.exports = Schema.Bookshelf.model('Tag', Tag);
