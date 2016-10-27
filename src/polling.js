import _ from 'lodash';
import {Forecast, MonitoringSpec} from './models//models';
import http from 'http';
import babelPolyfill from 'babel-polyfill';

const processData = data => {
	return {
		name: data.city.name,
		forecast: _.map(data.list, entry => ({ time: entry.dt, temp: entry.main.temp }))
	};
};

function delay(timeout) {
	return new Promise(resolve => setTimeout(resolve, timeout));
}


const getUrlForCity = (name, apiKey) => `http://api.openweathermap.org/data/2.5/forecast?q=${name}&units=metric&APPID=${apiKey}`;

/**
 * Function for checking weather forecast for the specified city
 *
 * @param {String} name - the name of the city.
 * @returns {Promise} - a promise that is resolved with json response from http://api.openweathermap.org/data/2.5/forecast.
 */
function checkCity(name, apiKey) {
	return new Promise((resolve, reject) => {
		//Create http request to openweathermap
		const request = http.get(getUrlForCity(name, apiKey), response => {
			//reject promise if received status code other than 200
			if(response.statusCode !== 200) {
				reject(new Error(`Failed to check weather for ${name}: ${request.statusCode}`));
			} else {
				//read body and parse json object from it.
		      	const body = [];
		      	response.on('data', chunk => body.push(chunk));
		      	response.on('end', () => {
		      		try {
		      			const bodyStr = body.join('');
		      			const jsonResponse = JSON.parse(bodyStr);
		      			resolve(jsonResponse);
		      		} catch (err) {
								console.console.error(err);
		      			reject(err);
		      		}
		      	});
			}
		});

		request.on('error', err => reject(err));
	});
};

//Async function that reads all cities in the system and checks forecast for each of them
async function checkConfiguredCities(apiKey, checkInterval) {
	try {
		const cities = await MonitoringSpec.find({}).exec();

		if(cities.length === 0) {
			await delay(checkInterval);
		} else {
			for(let i=0; i < cities.length; i++) {
				const {name} = cities[i];
				const jsonResponse = await checkCity(name, apiKey);
				const {forecast} = processData(jsonResponse);
			 	await Forecast.findOneAndUpdate({name}, {name, forecast}, {upsert: true}).exec();
				console.log(`Checked: ${name}`);
				await delay(checkInterval);
			}
		}
	} catch(error) {
		console.log(error);
		await delay(checkInterval);
	}

	return new Promise(resolve => resolve());
}


function setupWeatherPolling(apiKey, checkInterval) {
	let checkTimeout;

	async function runCheck(apiKey, checkInterval) {
		const result = await checkConfiguredCities(apiKey, checkInterval);
		setTimeout(runCheck.bind(null, apiKey, checkInterval), checkInterval);
	};

	runCheck(apiKey, checkInterval);
}

module.exports = setupWeatherPolling;
