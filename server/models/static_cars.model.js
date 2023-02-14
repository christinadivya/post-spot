import Schema from '../../config/mysql.js';
import Location from '../models/location.model';

const Cars = Schema.Bookshelf.Model.extend({
  tableName: 'static_cars',
  hasTimestamps: true,

  location:  function () {
    return this.hasMany('Location');
  },
 
});

module.exports = Schema.Bookshelf.model('Cars', Cars);
