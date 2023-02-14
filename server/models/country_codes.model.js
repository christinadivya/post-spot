import Schema from '../../config/mysql.js';
import City from '../models/city.model';

const Country = Schema.Bookshelf.Model.extend({
  tableName: 'country_codes',
  hasTimestamps: true,

  city: function () {
    return this.hasMany('City');
  },
 
});

module.exports = Schema.Bookshelf.model('Country', Country);
