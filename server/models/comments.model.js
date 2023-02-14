import Schema from '../../config/mysql.js';
import User from '../models/user.model';
import Mypicture from '../models/my_pictures.model';
import Mycar from '../models/my_pictures.model';
import Event from '../models/events.model';

const Comments = Schema.Bookshelf.Model.extend({
  tableName: 'comments',
  hasTimestamps: true,
 
  commenter: function () {
    return this.belongsTo('User','commenter_id');
  },

  image: function () {
    return this.belongsTo('Mypicture', 'my_picture_id');
  },

  car: function () {
    return this.belongsTo('Mycar', 'my_car_id');
  },

  event: function () {
    return this.belongsTo('Event', 'event_id');
  },

  post_id: function() {
    return this.belongsTo('Post', 'post_id')
  }

});

module.exports = Schema.Bookshelf.model('Comments', Comments);
