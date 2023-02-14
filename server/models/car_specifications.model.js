import Schema from '../../config/mysql.js';
import User from '../models/user.model';
import Mycar from '../models/my_cars.model';

const Carspecification = Schema.Bookshelf.Model.extend({
  tableName: 'car_specifications',
  hasTimestamps: true,
 
  user: function () {
    return this.belongsTo('User','user_id');
  },

  image: function () {
    return this.belongsTo('Mycar', 'my_car_id');
  },

});

module.exports = Schema.Bookshelf.model('Carspecification', Carspecification);
