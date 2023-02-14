// Dev
// const knex = require('knex')({
//   client: 'mysql',
//   connection: {
//     host     : '34.218.121.25',
//     port: 3306,
//     user     : 'optidev',
//     password : 'Opt!dev_$%^_!@#',
//     database : 'spotteddev',
//     charset  : 'utf8mb4',
//     multipleStatements: true
//   }
// });

// Test
// const knex = require('knex')({
//   client: 'mysql',
//   connection: {
//     host     : '34.218.121.25',
//     port: 3306,
//     user     : 'optidev',
//     password : 'Opt!dev_$%^_!@#',
//     database : 'spottedtest',
//     charset  : 'utf8mb4',
//     multipleStatements: true
//   }
// });

// production
const knex = require('knex')({
  client: 'mysql',
  connection: {
    host     : '172.31.28.63',
    port: 3306,
    user     : 'optidev',
    password : 'Opt!dev_$%^_!@#',
    database : 'spotted',
    charset  : 'utf8mb4',
    multipleStatements: true
  }
});

const Bookshelf = require('bookshelf')(knex);
const cascadeDelete = require('bookshelf-cascade-delete');


Bookshelf.plugin(['registry', 'visibility', 'virtuals', 'pagination', cascadeDelete]);

exports.Bookshelf = Bookshelf;