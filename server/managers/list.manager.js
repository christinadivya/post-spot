import Country from '../models/country_codes.model';
import City from '../models/city.model';
import Cars from '../models/static_cars.model';
import Fuel from '../models/fuel_type.model';
import State from '../models/state.model';
import About from '../models/about_us.model';
import Terms from '../models/terms.model';
import NotificationType from '../models/notification_type.model';
import responseCode from '../../../config/responseCode';
const _ = require('lodash'); 

function countryCode(req, callback) {
  Country.forge()
  .fetchAll()
  .then((country) => {
    let jsonString = JSON.stringify(country);
    let finalValue = JSON.parse(jsonString);  
    let top_countries = {"GBR": 0, "USA": 1, "ARE": 2};
    let top = new Array(3);
    finalValue.filter(element => { return Object.keys(top_countries).includes(element['country_code_three']) }).forEach(element => { top[top_countries[element['country_code_three']]] = element });
    let bottom = finalValue.filter(element => { return !Object.keys(top_countries).includes(element['country_code_three']) });    
    country = top.concat(bottom)
    callback(null, { data: country, code: responseCode.ok });
  }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
}

function fuels(req, callback) {
  Fuel.forge()
  .fetchAll()
  .then((fuels) => {
    console.log(fuels)
    callback(null, { data: fuels, code: responseCode.ok });
  }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
}

function city(req, callback) {
  City.where({ state_id : req.query.state_id})
  .fetchAll()
  .then((cities) => {
    console.log(cities)
    callback(null, { data: cities, code: responseCode.ok });
  }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
}

function state(req, callback) {
  State.where({ country_code_id : req.query.country_id})
  .fetchAll()
  .then((states) => {
    console.log(states)
    callback(null, { data: states, code: responseCode.ok });
  }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
}

function staticCars(req, callback) {
  let query = function (qb) {
    if(req.query.search != null || req.query.search != undefined) {
        qb.orWhere('car_name','LIKE', '%'+req.query.search+'%')
    }
  }
  Cars.where(query)
  .fetchAll()
  .then((cars) => {
    console.log(cars)
    callback(null, { data: cars, code: responseCode.ok });
  }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
}

function aboutUs(req, callback) {
  About.forge()
  .fetchAll()
  .then((about) => {
    callback(null, { data: about, code: responseCode.ok });
  }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
}

function termsCondition(req, callback) {
  Terms.forge()
  .fetchAll()
  .then((terms) => {
    callback(null, { data: terms, code: responseCode.ok });
  }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
}

function notificationType(req, callback) {
  NotificationType.forge()
  .fetchAll()
  .then((type) => {
    callback(null, { data: type, code: responseCode.ok });
  }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));
}


  export default { countryCode, staticCars, city, fuels, state, aboutUs, termsCondition, notificationType };
  