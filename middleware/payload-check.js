'use strict';

const express     = require('express');
const router      = new express.Router();
const Response    = require('../etc/responses.json');

router.use((req, res, next) => {
  var lang;
  if (req.query.language) {
    lang = req.query.language;
  }
  else if (req.body.language) {
    lang = req.body.language;
  }
  else {
    lang = 'en';
  }
  
  const error = {};

  if (!req.body.merchant_id) {
    return res.status(400).json({
      success: false,
      message: Response.r84[lang],
      error_code: 'e38'
    });
  }
  
  next();
});

module.exports = router;
