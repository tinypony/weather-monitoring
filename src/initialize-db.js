var User = require('./models/models.js').User;

const TEST_USER_NAME = 'Test User';

module.exports = function() {
	return User.findOne({name: TEST_USER_NAME})
		.exec()
		.catch(err => console.err('Problem initialzing database ' + JSON.stringify(err)))
		.then(user => {
			if(!user) {
				var newUser = new User({name: TEST_USER_NAME, monitored: [], id: ''});
				return newUser.save();
			}

			return user;
		});
}