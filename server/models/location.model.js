import Schema from '../../config/mysql.js';
import User from '../models/user.model';
import Mycar from '../models/my_cars.model';
import Mypicture from '../models/my_pictures.model';
import Car from '../models/static_cars.model';

const Location = Schema.Bookshelf.Model.extend({
  tableName: 'location',
  hasTimestamps: true,
 
  user: function () {
    return this.belongsTo('User', 'user_id');
  },
  
  static_car: function () {
    return this.belongsTo('Cars', 'static_car_id');
  },

  mycar:  function () {
    return this.belongsTo('Mycar', 'my_car_id');
  },

  mypicture:  function () {
    return this.hasMany('Mypicture', 'user_id');
  },
});

module.exports = Schema.Bookshelf.model('Location', Location);
