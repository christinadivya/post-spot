const Schema = require('./collection.js');
const Promise = require('bluebird');
const Async = require('async');
const _ = require('lodash');
const Model = require('../config/mysql.js');

const createTable = function (tableName) {
  return Model.Bookshelf.knex.schema.createTable(tableName, (table) => {
    let column;
    let columnKeys = _.keys(Schema[tableName]);
    columnKeys.forEach((key) => {
      if (Schema[tableName][key].type === 'text' && Schema[tableName][key].hasOwnProperty('fieldtype')) {
        column = table[Schema[tableName][key].type](key, Schema[tableName][key].fieldtype);
      } else if (Schema[tableName][key].type === 'string' && Schema[tableName][key].hasOwnProperty('maxlength')) {
        column = table[Schema[tableName][key].type](key, Schema[tableName][key].maxlength);
      } else {
        column = table[Schema[tableName][key].type](key);
      }
      if (Schema[tableName][key].hasOwnProperty('nullable') && Schema[tableName][key].nullable === true) {
        column.nullable();
      } else {
        column.notNullable();
      }
      if (Schema[tableName][key].hasOwnProperty('primary') && Schema[tableName][key].primary === true) {
        column.primary();
      }
      if (Schema[tableName][key].hasOwnProperty('unique') && Schema[tableName][key].unique === true) {
        column.unique();
      }
      if (Schema[tableName][key].hasOwnProperty('unsigned') && Schema[tableName][key].unsigned === true) {
        column.unsigned();
      }
      if (Schema[tableName][key].hasOwnProperty('references')) {
        column.references(Schema[tableName][key].references);
	  }
      if (Schema[tableName][key].hasOwnProperty('defaultTo')) {
        column.defaultTo(Schema[tableName][key].defaultTo);
      }
    });
  });
};

let doesTableExist = function (tableName) {
  return Model.Bookshelf.knex.schema.hasTable(tableName);
};

let initDb = function () {
  let calls = [];
  let tableNames = _.keys(Schema);
  tableNames.forEach(function (tableName) {
    let f = (callback) => {
      doesTableExist(tableName).then((exists) => {
        if (!exists) {
          console.log('Creating database table ', tableName, '...');
          createTable(tableName).then((result) => {
            console.log('---> Created database table ', tableName);
            callback(null, result);
          }).catch((err) => {
            console.log('Error creating ', tableName, 'table', err);
            callback(err, null);
          });
        } else {
          callback(null, exists);
        }
      }).catch((error) => {
        console.log('Error creating ', tableName, 'table', error);
        callback(error, null);
      });
    };
    calls.push(f);
  });
  Async.series(calls, function (err, result) {
    if (!err) {
      console.log('Finished initialising database table');
    } else {
      console.log('Error initialising database table: ', err);
    }
  });
};

exports.initialisation = initDb;
