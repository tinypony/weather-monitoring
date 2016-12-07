import {Controller} from './models/models';

module.exports = async function() {
	try {
		await Controller.findOneAndUpdate(
			{identity: 'bed-light'},
			{identity: 'bed-light', address: '192.168.1.9', port: 3456, data: [0x99, 0x99, 0x99]},
			{upsert: true}
		).exec();
		return;
	} catch(error) {
		console.error('Problem initialzing database ' + JSON.stringify(error));
	}
};
