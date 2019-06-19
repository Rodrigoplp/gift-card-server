'use strict';

const Merchant      = require('mongoose').model('Merchant');
const Branch        = require('mongoose').model('Branch');
const GiftCard      = require('mongoose').model('GiftCard');
const Response     = require('../etc/responses.json');


/*
 * Gather date, merchant_id, branch_id and gift card sequence
 * to generate a gift_card_number
*/
module.exports = (req, res, next) => {
  getMerchantNumber(req, res);
}

// MARK: get merchant number
function getMerchantNumber(req, res) {
  // Merchant number
  Merchant.findOne({ _id: req.body.merchant_id }, (err, doc) => {
    if (err || !doc) return res.status(500).json({
      success: false,
      message: Response.r0[req.body.language],
      error_code: 'e0'
    });
    else {
      // Make sure the merchant number always has 3 digits
      var numberString = doc.number.toString();
      if (numberString.length === 1) {
        numberString = "00" + numberString;
      }
      else if (numberString.length === 2) {
        numberString = "0" + numberString;
      }
      
      req.body.merchant_number = numberString;
      req.body.merchant_name = doc.merchant_name;
      getBranchNumber(req, res);
    }
  });
}

// MARK: get branch number
function getBranchNumber(req, res) {
  // Branch number
  Branch.findOne({ _id: req.body.branch_id }, (err, doc) => {
    if (err) return res.status(500).json({
      success: false,
      message: Response.r0[req.body.language],
      error_code: 'e0'
    });
    if (!doc) {
      // This Merchant has only the main office, no branches.
      req.body.branch_number = req.body.merchant_id;
      req.body.branch_number = "00";
      req.body.branch_name = req.body.merchant_name;
    }
    else {
      // Make sure the branch number always has 2 digits
      var numberString = doc.number.toString();
      if (numberString.length === 1) {
        numberString = "0" + numberString;
      }
      
      req.body.branch_number = numberString;
      req.body.branch_name = doc.branch_name;
    }
    
    generateCardNumber(req, res);
  });
}

// MARK: generate card number
function generateCardNumber(req, res) {
  // Get date
  var d = new Date();
  var year = d.getFullYear().toString().substr(-2);
  var month = (d.getMonth() + 1).toString();
  if (month.length === 1) {
    month = "0" + month;
  }
  var day = d.getDate().toString();
  if (day.length === 1) {
    day = "0" + day;
  }
  
  // Get next available card number
  GiftCard.findOne({ merchant_id: req.body.merchant_id, branch_id: req.body.branch_id }).sort({ number: -1 }).limit(1).exec((err, doc) => {
    var numberString;
    
    if (err) return res.status(500).json({
      success: false,
      message: Response.r0[req.body.language],
      error_code: 'e0'
    });
    if (!doc) {
      req.body.number = 1;
      numberString = '1';
    }
    else {
      req.body.number = doc.number + 1;
      numberString = req.body.number.toString();
    }
    
    // Make sure the card number always has 4 digits
    if (numberString.length === 1) {
      numberString = "000" + numberString;
    }
    else if (numberString.length === 2) {
      numberString = "00" + numberString;
    }
    else if (numberString.length === 3) {
      numberString = "0" + numberString;
    }
    
    // Trim numbers with more than 4 digits. The date components will guarantee the cardNumber uniqueness.
    else if (numberString.length >= 4) {
      numberString = numberString.slice(-4);
    }
    
    // Finally compose complete card number
    const cardNumber =
      year +
      month +
      day +
      req.body.merchant_number +
      req.body.branch_number +
      numberString
    
    req.body.gift_card_number = cardNumber;
    
    addGiftCard(req, res);
  });
}

// MARK: add gift card
function addGiftCard(req, res) {
  req.body.balance = 0;
  req.body.points = 0;
  var msg;
  if (res.locals.fromAddClient) {
    msg = Response.r78[req.body.language];
  }
  else {
    msg = Response.r79[req.body.language];
  }
  
  var newGiftCard = new GiftCard(req.body);
  newGiftCard.save((err, doc) => {
    if (err) {
      // Gift card number not unique due to simultaneous creation
      console.log('Gift card number not unique due to simultaneous creation. New number assigned automatically.');
      const number = Number(req.body.gift_card_number) + 1;
      req.body.gift_card_number = number.toString();
      newGiftCard = new GiftCard(req.body);
      newGiftCard.save((err2, doc2) => {
        if (err2) {
          return res.status(400).json({
            success: false,
            message: Response.r80[req.body.language],
            error: 'e32'
          });
        }
        else {
          return res.status(200).json({
            success: true,
            message: msg,
            client_name: req.body.client_name,
            client_id: req.body.client_id,
            gift_card_number: doc2.gift_card_number,
            merchant_name: req.body.merchant_name,
            branch_name: req.body.branch_name,
            balance: doc2.balance,
            points: doc2.points
          });
        }
      })
    }
    else {
      return res.status(200).json({
        success: true,
        message: msg,
        client_name: req.body.client_name,
        client_id: req.body.client_id,
        gift_card_number: doc.gift_card_number,
        merchant_name: req.body.merchant_name,
        branch_name: req.body.branch_name,
        balance: doc.balance,
        points: doc.points
      });
    }
  });
}
