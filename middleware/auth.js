'use strict';

const express     = require('express');
const passport    = require('passport');
const validator   = require('validator');
const config      = require('../etc');
const router      = new express.Router();
const Merchant    = require('mongoose').model('Merchant');
const Response    = require('../etc/responses.json');


function validateSignupForm(payload, lang) {
	var errors = {};
	let isFormValid = true;
	let message = '';

	if (!payload || typeof payload.merchant_email !== 'string' || !validator.isEmail(payload.merchant_email)) {
		isFormValid = false;
		message = Response.r85[lang];
		errors = 'e33';
	}

	if (!payload || typeof payload.password !== 'string' || payload.password.trim().length < 3) {
		isFormValid = false;
		message = Response.r86[lang];
		errors = 'e34';
	}

	if (!payload || typeof payload.merchant_name !== 'string' || payload.merchant_name.trim().length === 0) {
		isFormValid = false;
		message = Response.r87[lang];
		errors = 'e35';
	}

	return {
		success: isFormValid,
		message,
		errors
	};
}

router.post('/signup', (req, res, next) => {
	var lang;
  if (req.query.language) {
    lang = req.query.language;
		res.locals.lang = lang;
  }
  else if (req.body.language) {
    lang = req.body.language;
		res.locals.lang = lang;
  }
  else {
    req.body.language = 'en';
		res.locals.lang = lang;
  }
  
	const validationResult = validateSignupForm(req.body, lang);
	if (!validationResult.success) {
		return res.status(400).json({
			success: false,
			message: validationResult.message,
			error_code: validationResult.errors
		});
	}
	
	// Get the next higher merchant number
	Merchant.findOne({}).sort({number: -1}).limit(1).exec((err, doc) => {
		if (err) return res.status(500).json({
			success: false,
			message: Response.r0[lang],
			error_code: 'e0'
		});
		if (!doc) {
			// There are no merchants on the database. Create the very first one.
      req.body.number = 1;
			next();
		}
		else {
			req.body.number = doc.number + 1;
      next();
		}
	});
}, (req, res, next) => {
	let lang = res.locals.lang;
	
	return passport.authenticate('local-signup', (err, doc) => {
		if (err) {
			if (err.name === 'MongoError' && err.code === 11000) {
				// the 11000 Mongo code is for a duplication email error
				// the 409 HTTP status code is for conflict error
				return res.status(409).json({
					success: false,
					message: Response.r90[lang],
					error_code: 'e36'
				});
			}

			return res.status(400).json({
				success: false,
				message: Response.r90[lang],
				error_code: 'e36'
			});
		}
		
		if (!doc) {
			return res.status(400).json({
				success: false,
				message: Response.r92[lang],
				error_code: 'e37'
			});
		}

		return res.status(200).json({
			success: true,
			message: 'Merchant ' + req.body.merchant_name + Response.r93[lang],
			merchant_id: doc._id
		});
	})(req, res, next);
});

module.exports = router;
