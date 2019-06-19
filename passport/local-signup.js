const Merchant        = require('mongoose').model('Merchant');
const localStrategy   = require('passport-local').Strategy;

module.exports = new localStrategy({
	usernameField: 'merchant_email',
	passwordField: 'password',
	session: false,
	passReqToCallback: true
}, (req, email, password, done) => {
	const userData = {
		merchant_email: email.trim(),
		password: password.trim(),
		merchant_name: req.body.merchant_name.trim(),
		number: req.body.number
	};
	
	const newMerchant = new Merchant(userData);
  newMerchant.save((err, doc) => {
    if (err) {
			console.log('Err: ' + err);
      return done(err);
    }
		
    return done(null, doc);
  });
});
