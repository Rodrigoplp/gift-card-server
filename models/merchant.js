'use strict';

var mongoose     = require('mongoose');
var bcrypt       = require('bcrypt');
var Schema       = mongoose.Schema;

var MerchantSchema = new Schema({
  name: String,
  password: String,
  merchant_email: {
    type: String,
    index: { unique: true }
  },
  merchant_name: String,
  language: String,
  street: String,
  street_2: String,
  city: String,
  province: String,
  postal_code: String,
  country: String,
  telephone: String,
  cellular: String,
  telephone_other: String,
  number: Number
}, {timestamps: true});

MerchantSchema.methods.comparePassword = function comparePassword(password, callback) {
  bcrypt.compare(password, this.password, callback);
};

MerchantSchema.pre('save', function saveHook(next) {
  let user = this;

  // proceed only if password is modified or the user is new
	if (!user.isModified('password')) {
		return next();
	}

	return bcrypt.genSalt((saltError, salt) => {
		if (saltError) {
			return next(saltError);
		}
		return bcrypt.hash(user.password, salt, (hashError, hash) => {
			if (hashError) {
				return next(hashError);
			}
			// Replace password string with hash value
			user.password = hash;
			return next();
		});
	});
});

module.exports = mongoose.model('Merchant', MerchantSchema);
