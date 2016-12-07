import dgram from 'dgram';
import {Controller} from './models/models';


module.exports = function initializeUdpServer(broadcastPort) {
  const broadcast_socket = dgram.createSocket('udp4');

  broadcast_socket.on('message', async (data, rinfo) => {
    let dataString = data.toString();
    const chunks = dataString.split(',');
    const identity = chunks[0].split('=')[1];
    const controllerPort = chunks[1].split('=')[1];
    const controllerAddress = rinfo.address;
    //console.log(`Got broadcast update from ${controllerAddress}:${controllerPort} = ${identity}`);

    try {
  		await Controller.findOneAndUpdate(
  			{identity},
  			{identity, address: controllerAddress, port: controllerPort},
  			{upsert: true}
  		).exec();
  		return;
  	} catch(error) {
  		console.error('Problem ' + JSON.stringify(error));
  	}
  });

  broadcast_socket.bind(broadcastPort, '0.0.0.0');
}
