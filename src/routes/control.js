import {Router} from 'express';
import dgram from 'dgram';
import {Controller} from '../models/models';
import _ from 'lodash';
import babelPolyfill from 'babel-polyfill';
import passport from 'passport';

const router = Router();
const unicast_socket = dgram.createSocket('udp4');

function authenticate(req, res, next) {
  passport.authenticate('token', (err, token, info) => {
    if (err) {
      return next(err);
    }

    if (!token) {
      return res.status(401).json({message: "Incorrect token credentials"});
    }
//    console.log("Auth alright");
    req.user = token;
    next();
  })(req,res,next);
}

/* GET watched cities listing with alerts. */
router.get('/', authenticate, async function(req, res) {
	try {
		const controllers = await Controller.find({}).exec();
		return res.status(200).send(controllers);
	} catch(err) {
		console.error(err);
		res.status(400).send(err);
	}
});

const COMMAND_TYPE_STRING = {
	SET: 'SET',
	ON: 'ON',
	OFF: 'OFF',
}

const COMMAND_TYPE = {
	SET: 0xA0,
	ON: 0xA1,
	OFF: 0xA2
};

const getCommandValueAsByteArray = command => {
	if(!command.value || command.value.length !== 6) {
		throw new Error('RGB value not provided');
	}
	const array = [];
	array[0] = parseInt(command.value.substring(0,2), 16);
	array[1] = parseInt(command.value.substring(2,4), 16);
	array[2] = parseInt(command.value.substring(4,6), 16);
	return array;
};

const createPayload = command => {
	let payload;
	const type = COMMAND_TYPE[command.type];

	if (type === COMMAND_TYPE.SET) {
		const value = getCommandValueAsByteArray(command);
		payload = Buffer.alloc(4);
		payload.writeUInt8(type, 0);
		payload.writeUInt8(value[0], 1);
		payload.writeUInt8(value[1], 2);
		payload.writeUInt8(value[2], 3);
	} else {
		payload = Buffer.alloc(1);
		payload.writeUInt8(type, 0);
	}

	return payload;
};

const sendCommand = (controller, payloadByteArray) => {
	console.log(`Send command to ${controller.address}:${controller.port}`);
	unicast_socket.send(
		new Buffer(payloadByteArray),
		0,
		payloadByteArray.length,
		controller.port,
		controller.address,
		err => {
			if(err) {
				console.log(JSON.stringify(err));
			} else {
				console.log('All good');
			}
		}
	);
};

const savePayloadIfProvided = async (controller, command) => {
	if(command.type === 'SET') {
		controller.data = getCommandValueAsByteArray(command);
		await controller.save();
	}
	return new Promise(resolve => resolve(controller));
}

router.put('/:identity', authenticate, async function(req, res) {
	const {identity} = req.params;
	const command = req.body;
//	console.log('In PUT method');
	if (command.type && _.includes(_.keys(COMMAND_TYPE), command.type)) {
		try {
			let controller = await Controller.findOne({identity}).exec();
//			console.log("found controller");
			controller = await savePayloadIfProvided(controller, command);
//			console.log("command saved");
			sendCommand(controller, createPayload(command));
			console.log("command sent to controller");
			res.status(200).send(controller);
		} catch(e) {
			console.error(e);
			res.status(400).send(e);
		}
	} else {
		res.status(400).send({
			message: 'Command type and value must be defined'
		});
	}
});

export default router;
