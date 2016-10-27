import {default as mongoose, Schema} from 'mongoose';

const MonitoringSpecSchema = new Schema({
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
  },
	owner: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	}
});

const CityForecastSchema = new Schema({
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
});

const UserSchema = new Schema({
	id: String,
  name: String
});



export const User = mongoose.model('User', UserSchema);
export const MonitoringSpec = mongoose.model('MonitoringSpec', MonitoringSpecSchema);
export const Forecast = mongoose.model('Forecast', CityForecastSchema);
