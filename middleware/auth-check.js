'use strict';

const Merchant    = require('mongoose').model('Merchant');
const config      = require('../etc');
const atob        = require('abab').atob;
const Response    = require('../etc/responses.json');


module.exports = (req, res, next) => {
  var lang;
  if (req.query.language) {
    lang = req.query.language;
  }
  else if (req.body.language) {
    lang = req.body.language;
  }
  else {
    req.body.language = 'en';
  }
  
  if (!req.headers.authorization) {
    return res.status(401).json({
      success: false,
      message: Response.r81[lang],
      error_code: 'e51'
    })
	}
  
  const decoded = atob(req.headers.authorization.split(/ /)[1]);
  const userId = decoded.split(/:/)[0];
  const pwd = decoded.split(/:/)[1];
  
  return Merchant.findById(userId, (userErr, user) => {
    // Check user id
    if (userErr || !user) {
      return res.status(401).json({
        success: false,
        message: 'UserId ' + userId + Response.r82[lang]
      });
    }
    
    // Check password
    return user.comparePassword(pwd, (pwdErr, isMatch) => {
      if (pwdErr) {
        return done(pwdErr);
      }
      
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: Response.r83[lang]
        })
      }
      
      if (!req.body.merchant_id) {
        req.body.merchant_id = userId;
      }
      else {
        console.log('Merchant déjà');
      }
      
      return next();
    })
  });
};
