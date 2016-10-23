var express = require('express');
var router = express.Router();

import {User, City} from '../models/models';
import _ from 'lodash';
import babelPolyfill from 'babel-polyfill';

const findFirstBreach = (forecast, threshold, direction) => {
	return _.find(forecast, entry => {
		if(direction === 'larger') {
			return entry.temp > threshold;
		} else if(direction === 'smaller') {
			return entry.temp < threshold;
		}
	});
};

function configureWatch() {
	/* GET watched cities listing with alerts. */
	router.get('/', async function(req, res) {
		try {
			const user = await User.findOne().exec();
			const cities = await City.find({}).exec();

			const monitoredCitiesWithAlerts = _.map(user.monitored, monitoringSpec => {
				const latestForecast = _.find(cities, {name: monitoringSpec.name});
				const firstBreach = findFirstBreach(latestForecast.forecast, monitoringSpec.threshold, monitoringSpec.direction);
				const plainSpec = _.pick(monitoringSpec, 'name', 'threshold', 'direction');

				if(_.isUndefined(firstBreach)) {
					return _.assign({}, plainSpec, {alert: {breached: false}});
				} else {
					return _.assign({}, plainSpec, {alert: {
						breached: true,
						temp: firstBreach.temp,
						time: firstBreach.time,
						timeTxt: new Date(firstBreach.time * 1000)
					}});
				}
			});
			res.status(200).send(monitoredCitiesWithAlerts);
		} catch(err) {
			res.status(400).send(err);
		}
	});

	router.delete('/:cityName', async function(req, res) {
		const cityNameToDelete = req.params.cityName;
		const user = await User.findOne().exec();
		const existingEntry = _.find(user.monitored, {name: cityNameToDelete});

		// A new city is being added
		if(!_.isUndefined(existingEntry)) {
			const idx = _.indexOf(user.monitored, existingEntry);
			user.monitored.splice(idx, 1);
			await user.save();
			res.status(200).send();
		} else {
			res.status(404).send({
				message: 'City is not monitored'
			});
		}

	});

	router.post('/', async function(req, res) {
		const user = await User.findOne().exec();
		const newCity = req.body;

		const existingEntry = _.find(user.monitored, {name: newCity.name});
		// A new city is being added
		if(_.isUndefined(existingEntry)) {
			user.monitored.push(newCity);
			const cityForecast = new City({name: newCity.name});
			await cityForecast.save();
		} else {
			const idx = _.indexOf(user.monitored, existingEntry);
			// Replace existing city at index
			user.monitored.splice(idx, 1, newCity);
		}

		await user.save();
		res.status(200).send();		
	});

	return router;
}

module.exports = configureWatch;
