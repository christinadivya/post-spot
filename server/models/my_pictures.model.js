import Schema from '../../config/mysql.js';
import User from '../models/user.model';
import Comments from '../models/comments.model';
import Notification from '../models/notifications.model';

const Mypicture = Schema.Bookshelf.Model.extend({
  tableName: 'my_pictures',
  hasTimestamps: true,
 
  user: function () {
    return this.belongsTo(User, user_id);
  },

  comments: function () {
    return this.hasMany(Comments);
  },

  notifications: function () {
    return this.hasMany(Notification);
  }

  
});

module.exports = Schema.Bookshelf.model('Mypicture', Mypicture);
