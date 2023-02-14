import Schema from '../../config/mysql.js';
import Country from '../models/country_codes.model';

const State = Schema.Bookshelf.Model.extend({
  tableName: 'state',
  hasTimestamps: true,

  country: function () {
    return this.belongsTo('Country');
  },

 
});

module.exports = Schema.Bookshelf.model('State', State);
