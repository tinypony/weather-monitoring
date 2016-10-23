'use strict';

Object.defineProperty(exports, "__esModule", {
       value: true
});
var mongoose = require('mongoose');

var MonitoredCity = {
       name: {
              type: String,
              required: [true, 'Specify city name']
       },
       threshold: {
              type: Number,
              required: [true, 'Specify threshold']
       },
       direction: {
              type: String,
              required: [true, 'Specify "larger" or "smaller"']
       }
};

var CityForecast = {
       name: {
              type: String,
              required: [true, 'Specify city name']
       },
       forecast: {
              type: [{
                     time: Number,
                     temp: Number
              }],
              default: []
       }
};

var CityForecastSchema = new mongoose.Schema(CityForecast);

var UserSchema = new mongoose.Schema({
       id: String,
       name: String,
       monitored: [MonitoredCity]
});

var User = exports.User = mongoose.model('User', UserSchema);
var City = exports.City = mongoose.model('City', CityForecastSchema);