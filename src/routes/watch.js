var express = require('express');
var router = express.Router();

import {User, Forecast, MonitoringSpec} from '../models/models';
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
			const user = await User.findOne().exec(); //imagine we retrieve the authenticated user rather than the only created one
			const monitored = await MonitoringSpec.find({owner: user._id});
			const cities = await Forecast.find({}).exec();

			const monitoredCitiesWithAlerts = _.map(monitored, monitoringSpec => {
				const latestForecast = _.find(cities, {name: monitoringSpec.name});
				const firstBreach = findFirstBreach(latestForecast.forecast, monitoringSpec.threshold, monitoringSpec.direction);
				const plainSpec = _.pick(monitoringSpec, '_id', 'name', 'threshold', 'direction', 'owner');

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

	router.delete('/:id', async function(req, res) {
		const {id} = req.params;
		const user = await User.findOne().exec(); //imagine we retrieve the authenticated user rather than the only created one
		await MonitoringSpec.findOne({owner: user._id, _id: id}).remove().exec();
		res.status(200).send();
	});

	router.post('/', async function(req, res) {
		const user = await User.findOne().exec(); //imagine we retrieve the authenticated user rather than the only created one
		const newSpec = new MonitoringSpec(_.assign({}, req.body, {owner: user._id}));

		const savedSpec = await newSpec.save();
		res.status(201).send(savedSpec);
	});

	router.put('/:id', async function(req, res) {
		const {id} = req.params;
		const user = await User.findOne().exec(); //imagine we retrieve the authenticated user rather than the only created one
		const monitoringSpec = await MonitoringSpec
			.findOneAndUpdate(
				{ _id: id, owner: user._id },
				_.omit(req.body, 'owner'), 	//don't allow to overwrite the owner
				{ new: true }
			).exec();

		res.status(200).send(monitoringSpec);
	});

	return router;
}

module.exports = configureWatch;
