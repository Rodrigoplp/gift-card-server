'use strict';

const Merchant    = require('mongoose').model('Merchant');

module.exports = (req, res, next) => {
  if (req.body.language) {
    return next();
  }
  else if (req.query.language) {
    req.body.language = req.query.language;
    return next();
  }
  else {
    Merchant.findOne({_id: req.body.merchant_id}, (err, doc) => {
      if (err) return res.status(500).json({
  			success: false,
  			message: 'Server error / Erreur de serveur',
  			error_code: 'e0'
  		});
  		else if (!doc) {
        return res.status(400).json({
          success: false,
          message: "Merchant not found / Merchant pas encontré",
          error_code: 'e12'
        });
      }
      else {
        req.body.language = doc.language;
        return next();
      }
    });
  }
}
