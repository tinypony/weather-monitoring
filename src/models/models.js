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

const ControllerSchema = new Schema({
	identity: {
		type: String,
		required: [true, 'Identity must be defined and be unique']
	},
	address: {
		type: String,
		required: [true, 'IP address of controller must be definend']
	},
	port: {
		type: Number,
		required: [true, 'Port number of the controller must be specified']
	},
	data: {
		type: Schema.Types.Mixed
	}
});

const TokenSchema = new Schema({
	value: { type: String, required: [true, 'Token value must be provided']}
});

TokenSchema.methods.verifyToken = function() {
	return true;
}
//
// export const User = mongoose.model('User', UserSchema);
// export const MonitoringSpec = mongoose.model('MonitoringSpec', MonitoringSpecSchema);
// export const Forecast = mongoose.model('Forecast', CityForecastSchema);
export const Controller = mongoose.model('Controller', ControllerSchema);
export const Token = mongoose.model('Token', TokenSchema);
