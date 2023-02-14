import Schema from '../../config/mysql.js';
import User from '../models/user.model';
import Event from '../models/events.model';

const Joinevent = Schema.Bookshelf.Model.extend({
  tableName: 'join_events',
  hasTimestamps: true,
 
  joinee_id: function () {
    return this.belongsTo('User', 'joinee_id');
  },

  event:  function () {
    return this.belongsTo('Event', 'events_id');
  },

});

module.exports = Schema.Bookshelf.model('Joinevent', Joinevent);
