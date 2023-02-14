import Schema from '../../config/mysql.js';
import User from '../models/user.model';
import Comments from '../models/comments.model';
import Carspecification from '../models/car_specifications.model';
import Location from '../models/location.model';

const Mycar = Schema.Bookshelf.Model.extend({
  tableName: 'my_cars',
  hasTimestamps: true,
 
  user: function () {
    return this.belongsTo('User', 'user_id');
  },

  comments: function () {
    return this.hasMany(Comments);
  },

  specifications: function () {
    return this.hasMany('Carspecification', 'my_car_id');
  },

  location:  function () {
    return this.hasMany('Location');
  },
});

module.exports = Schema.Bookshelf.model('Mycar', Mycar);
