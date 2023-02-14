import Schema from '../../config/mysql.js';
import Country from '../models/country_codes.model';
import State from '../models/state.model';

const City = Schema.Bookshelf.Model.extend({
  tableName: 'city',
  hasTimestamps: true,

  country: function () {
    return this.belongsTo('Country');
  },

  state: function () {
    return this.belongsTo('State');
  },
 
});

module.exports = Schema.Bookshelf.model('City', City);
