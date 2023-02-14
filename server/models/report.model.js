import Schema from '../../config/mysql.js';

const Report = Schema.Bookshelf.Model.extend({
  tableName: 'report',
  hasTimestamps: true,

  user: function () {
    return this.belongsTo('User', 'user_id');
  },
  
  reporting_id:   function () {
    return this.belongsTo('User', 'reporting_id');
  },
 
 
});

module.exports = Schema.Bookshelf.model('Report', Report);
