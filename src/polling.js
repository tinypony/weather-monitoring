import _ from 'lodash';
import {City} from './models//models';
import http from 'http';
import babelPolyfill from 'babel-polyfill';

const API_KEY = '2b8c19a1a75a38433d095d240db82bc9';
const CHECK_DELAY = 2000;

const processData = data => {
	return {
		name: data.city.name,
		forecast: _.map(data.list, entry => ({ time: entry.dt, temp: entry.main.temp }))
	};
};

function delay(timeout) {
	return new Promise(resolve => setTimeout(resolve, timeout));
}


const getUrlForCity = name => `http://api.openweathermap.org/data/2.5/forecast?q=${name}&units=metric&APPID=${API_KEY}`;

/**
 * Function for checking weather forecast for the specified city
 *
 * @param {String} name - the name of the city.
 * @returns {Promise} - a promise that is resolved with json response from http://api.openweathermap.org/data/2.5/forecast.
 */
function checkCity(name) {
	return new Promise((resolve, reject) => {
		//Create http request to openweathermap
		const request = http.get(getUrlForCity(name), response => {
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
		      		} catch (er) {
		      			reject(err);
		      		}
		      	});
			}
		});

		request.on('error', err => reject(err));
	});
};

//Async function that reads all cities in the system and checks forecast for each of them
async function checkConfiguredCities() {
	try {
		const cities = await City.find({}).exec();

		if(cities.length === 0) {
			await delay(CHECK_DELAY);
		} else {

			for(let i=0; i < cities.length; i++) {
				const {name, _id} = cities[i];

				let jsonResponse = await checkCity(name);
				const {forecast} = processData(jsonResponse);

				await City.findByIdAndUpdate(_id, {$set: {forecast}}).exec();
				
				console.log(`Checked: ${name}`);
				await delay(CHECK_DELAY);
			}
		}	
		
	} catch(error) {
		console.log('Something went wrong');
		console.log(error);
		await delay(CHECK_DELAY);
	}

	return new Promise(resolve => resolve());
}


function setupWeatherPolling() {
	let checkTimeout;

	async function runCheck() {
		const result = await checkConfiguredCities();
		setTimeout(runCheck, CHECK_DELAY);
	};

	runCheck();
	
}

module.exports = setupWeatherPolling;