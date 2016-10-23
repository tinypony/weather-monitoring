var mongoose = require('mongoose');

const MonitoredCity = {
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

const CityForecast = {
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
}

const CityForecastSchema = new mongoose.Schema(CityForecast);

const UserSchema = new mongoose.Schema({
	id: String,
  	name: String,
  	monitored: [MonitoredCity]
});

export const User = mongoose.model('User', UserSchema);
export const City = mongoose.model('City', CityForecastSchema);