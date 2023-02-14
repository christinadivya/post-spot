import Schema from '../../config/mysql.js';

const Fuel = Schema.Bookshelf.Model.extend({
  tableName: 'fuel_type',
  hasTimestamps: true,
 
});

module.exports = Schema.Bookshelf.model('Fuel', Fuel);
