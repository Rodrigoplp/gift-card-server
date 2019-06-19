'use strict';

const express 			= require('express');
const router 				= new express.Router();
const Merchant      = require('mongoose').model('Merchant');
const Branch        = require('mongoose').model('Branch');
const Workstation   = require('mongoose').model('Workstation');
const Employee      = require('mongoose').model('Employee');
const Client        = require('mongoose').model('Client');
const GiftCard      = require('mongoose').model('GiftCard');
const Transaction   = require('mongoose').model('Transaction');
const Response     = require('../etc/responses.json');


// MARK: - Transactions

// MARK: validation
function validateTransaction(payload) {
  var errors = 'e39';
  let isFormValid = true;
  var message = Response.r61[req.body.language];
  
  if (!payload.money_amount) {
    isFormValid = false;
    message = Response.r62[req.body.language];
    errors = 'e40';
  }
  
  if (!payload.workstation_id && !payload.serial_number) {
    isFormValid = false;
    message = Response.r63[req.body.language];
    errors = 'e41';
  }
  
  if (!payload.employee_id) {
    isFormValid = false;
    message = Response.r64[req.body.language];
    errors = 'e42';
  }
  
  return {
    success: isFormValid,
    message,
    errors
  };
}


// MARK: reload GiftCard
router.put('/reloadGiftCard', (req, res, next) => {
  const validationResult = validateTransaction(req.body);
	if (!validationResult.success) {
		return res.status(400).json({
			success: false,
			message: validationResult.message,
			error_code: validationResult.errors
		});
	}
  
  // Retrieve serial_number to make sure it gets registered in the transaction
  if (!req.body.serial_number) {
    Workstation.findOne({_id: req.body.workstation_id}, (err, doc) => {
      if (err) {
        return res.status(500).json({
    			success: false,
    			message: Response.r0[req.body.language],
    			error_code: 'e0'
    		});
      }
  		else if (!doc) {
        return res.status(400).json({
          success: false,
          message: Response.r21[req.body.language],
          error_code: 'e15'
        });
      }
      else {
        req.body.serial_number = doc.serial_number;
        next();
      }
    });
  }
}, (req, res, next) => {
  
  // Retrieve employee number to guarantee it will be registered in the transaction
  Employee.findOne({_id: req.body.employee_id}, (err, doc) => {
    if (err) {
      return res.status(500).json({
  			success: false,
  			message: Response.r0[req.body.language],
  			error_code: 'e0'
  		});
    }
    else if (!doc) {
      return res.status(400).json({
        success: false,
        message: Response.r27[req.body.language],
        error_code: 'e19'
      });
    }
    else {
      req.body.employee_number = doc.employee_number;
      next();
    }
  });
  
}, (req, res, next) => {
  if (req.body.gift_card_id) {
    GiftCard.findOneAndUpdate(
      {_id: req.body.gift_card_id},
      {$inc: {balance: req.body.money_amount}},
      {new: true},
      (err, doc) => {
        if (err) {
          return res.status(500).json({
      			success: false,
      			message: Response.r0[req.body.language],
      			error_code: 'e0'
      		});
        }
        else if (!doc) {
          return res.status(400).json({
            success: false,
            message: Response.r54[req.body.language],
            error_code: 'e28'
          });
        }
        else {
          req.body.success = true;
          req.body.balance = doc.balance;
          req.body.branch_id = doc.branch_id;
          req.body.client_id = doc.client_id;
          req.body.gift_card_id = doc._id;
          req.body.gift_card_number = doc.gift_card_number;
          req.body.message = Response.r65[req.body.language];
          
          next();
        }
    });
  }
  else if (req.body.gift_card_number) {
    GiftCard.findOneAndUpdate(
      {gift_card_number: req.body.gift_card_number},
      {$inc: {balance: req.body.money_amount}},
      {new: true},
      (err, doc) => {
        if (err) {
          return res.status(500).json({
      			success: false,
      			message: Response.r0[req.body.language],
      			error_code: 'e0'
      		});
        }
        else if (!doc) {
          return res.status(400).json({
            success: false,
            message: Response.r54[req.body.language],
            error_code: 'e28'
          });
        }
        else {
          req.body.success = true;
          req.body.balance = doc.balance;
          req.body.branch_id = doc.branch_id;
          req.body.client_id = doc.client_id;
          req.body.gift_card_id = doc._id;
          req.body.gift_card_number = doc.gift_card_number;
          req.body.message = Response.r65[req.body.language];
          
          next();
        }
    });
  }
  else {
    return res.status(500).json({
      success: false,
      message: Response.r0[req.body.language],
      error_code: 'e0'
    });
  }
});


// MARK: redeem GiftCard
router.put('/redeemGiftCard', (req, res, next) => {
  const validationResult = validateTransaction(req.body);
	if (!validationResult.success) {
		return res.status(400).json({
			success: false,
			message: validationResult.message,
			errors: validationResult.errors
		});
	}
  
  // Retrieve serial_number to make sure it gets registered in the transaction
  if (!req.body.serial_number) {
    Workstation.findOne({_id: req.body.workstation_id}, (err, doc) => {
      if (err) {
        return res.status(500).json({
    			success: false,
    			message: Response.r0[req.body.language],
    			error_code: 'e0'
    		});
      }
      else if (!doc) {
        return res.status(400).json({
          success: false,
          message: Response.r21[req.body.language],
          error_code: 'e15'
        });
      }
      else {
        req.body.serial_number = doc.serial_number;
        next();
      }
    });
  }
}, (req, res, next) => {
  // Retrieve employee number to guarantee it will be registered in the transaction
  Employee.findOne({_id: req.body.employee_id}, (err, doc) => {
    if (err) {
      return res.status(500).json({
  			success: false,
  			message: Response.r0[req.body.language],
  			error_code: 'e0'
  		});
    }
    else if (!doc) {
      return res.status(400).json({
        success: false,
        message: Response.r27[req.body.language],
        error_code: 'e19'
      });
    }
    else {
      req.body.employee_number = doc.employee_number;
      next();
    }
  });
  
}, (req, res, next) => {
  if (req.body.gift_card_id) {
    GiftCard.findOne({_id: req.body.gift_card_id}, (err, doc) => {
      if (err) {
        return res.status(500).json({
    			success: false,
    			message: Response.r0[req.body.language],
    			error_code: 'e0'
    		});
      }
      else if (!doc) {
        return res.status(400).json({
          success: false,
          message: Response.r54[req.body.language],
          error_code: 'e28'
        });
      }
      else {
        if (req.body.money_amount <= doc.balance) {
          GiftCard.findOneAndUpdate(
            {_id: req.body.gift_card_id},
            {$inc: {balance: -req.body.money_amount}},
            {new: true},
            (err, doc2) => {
              if (err) return res.status(500).json({
                success: false,
                message: Response.r0[req.body.language],
                error_code: 'e0'
              });
              else {
                req.body.success = true;
                req.body.balance = doc2.balance;
                req.body.branch_id = doc2.branch_id;
                req.body.client_id = doc2.client_id;
                req.body.gift_card_id = doc2._id;
                req.body.gift_card_number = doc2.gift_card_number;
                req.body.message = Response.r66[req.body.language];

                next();
              }
          });
        }
        else {
          return res.status(200).json({
            success: false,
            message: Response.r67[req.body.language],
            error_code: 'e44',
            giftCardBalance: doc.balance
          });
        }
      }
    });
  }
  else if (req.body.gift_card_number) {
    GiftCard.findOne({gift_card_number: req.body.gift_card_number}, (err, doc) => {
      if (err) {
        return res.status(500).json({
    			success: false,
    			message: Response.r0[req.body.language],
    			error_code: 'e0'
    		});
      }
      else if (!doc) {
        return res.status(400).json({
          success: false,
          message: Response.r54[req.body.language],
          error_code: 'e28'
        });
      }
      else {
        if (req.body.money_amount <= doc.balance) {
          GiftCard.findOneAndUpdate(
            {gift_card_number: req.body.gift_card_number},
            {$inc: {balance: -req.body.money_amount}},
            {new: true},
            (err, doc2) => {
              if (err) {
                return res.status(500).json({
            			success: false,
            			message: Response.r0[req.body.language],
            			error_code: 'e0'
            		});
              }
              else {
                req.body.success = true;
                req.body.balance = doc2.balance;
                req.body.branch_id = doc2.branch_id;
                req.body.client_id = doc2.client_id;
                req.body.gift_card_id = doc2._id;
                req.body.gift_card_number = doc2.gift_card_number;
                req.body.message = Response.r66[req.body.language];

                next();
              }
          });
        }
        else if (req.body.enforce) {
          GiftCard.findOneAndUpdate(
            {gift_card_number: req.body.gift_card_number},
            {$set: {balance: 0}},
            {new: true},
            (err, doc2) => {
              if (err) {
                return res.status(500).json({
            			success: false,
            			message: Response.r0[req.body.language],
            			error_code: 'e0'
            		});
              }
              else {
                req.body.success = true;
                req.body.balance = doc2.balance;
                req.body.gift_card_id = doc2._id;
                req.body.branch_id = doc2.branch_id;
                req.body.client_id = doc2.client_id;
                req.body.gift_card_number = doc2.gift_card_number;
                req.body.remainder = req.body.money_amount - doc.balance;
                req.body.message = Response.r66[req.body.language];

                next();
              }
          });
        }
        else {
          return res.status(200).json({
            success: false,
            message: Response.r67[req.body.language],
            error_code: 'e44',
            giftCardBalance: doc.balance
          });
        }
      }
    });
  }
});


// MARK: cancel transaction
router.post('/cancelTransaction', (req, res, next) => {
  if (!req.body.transaction_id) {
    return res.status(400).json({
      success: false,
      message: Response.r68[req.body.language],
      error_code: 'e45'
    });
  }
  
  if (!req.body.employee_id) {
    return res.status(400).json({
      success: false,
      message: Response.r64[req.body.language],
      error_code: 'e42'
    });
  }
  
  // Retrieve employee number to guarantee it will be registered in the transaction
  Employee.findOne({_id: req.body.employee_id}, (err, doc) => {
    if (err) {
      return res.status(500).json({
  			success: false,
  			message: Response.r0[req.body.language],
  			error_code: 'e0'
  		});
    }
    else if (!doc) {
      return res.status(400).json({
        success: false,
        message: Response.r27[req.body.language],
        error_code: 'e19'
      });
    }
    else {
      req.body.employee_number = doc.employee_number;
      next();
    }
  });
  
}, (req, res, next) => {
  Transaction.findOneAndUpdate(
    {_id: req.body.transaction_id},
    {$set: {cancelled: true}},
    {new: true},
    (err, doc) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: Response.r0[req.body.language],
          error_code: 'e0'
        });
      }
      else if (!doc) {
        return res.status(400).json({
          success: false,
          message: Response.r69[req.body.language],
          error_code: 'e46'
      });
    }
    else {
      if (doc.type === 'Redeem') {
        res.locals.gift_card_id = doc.gift_card_id;
        res.locals.amount = doc.money_amount;
        res.locals.transaction_id = req.body.transaction_id;
        res.locals.doc = doc;
        
        next();
      }
      else if (doc.type === 'Reload') {
        res.locals.gift_card_id = doc.gift_card_id;
        res.locals.amount = -doc.money_amount;
        res.locals.transaction_id = req.body.transaction_id;
        res.locals.doc = doc;
        
        next();
      }
      else if (doc.type === 'Activation'){
        res.locals.gift_card_id = doc.gift_card_id;
        res.locals.transaction_id = req.body.transaction_id;
        res.locals.doc = doc;
        
        next();
      }
      else if (doc.type === 'Remittance') {
        res.locals.gift_card_id = doc.gift_card_id;
        res.locals.amount = doc.remainder;
        res.locals.transaction_id = req.body.transaction_id;
        res.locals.doc = doc;
        
        next();
      }
    }
  });
}, (req, res, next) => {
  if (res.locals.doc.type == 'Activation') {
    GiftCard.findOneAndRemove({ _id: res.locals.gift_card_id }, (err, doc) => {
      if (err) {
        return res.status(500).json({
    			success: false,
    			message: Response.r0[req.body.language],
    			error_code: 'e0'
    		});
      }
      else if (!doc) {
        return res.status(400).json({
          success: false,
          message: Response.r54[req.body.language],
          error_code: 'e28'
        });
      }
      else {
        req.body.success = true;
        req.body.balance = doc.balance;
        req.body.branch_id = doc.branch_id;
        req.body.client_id = doc.client_id;
        req.body.gift_card_id = doc._id;
        req.body.gift_card_number = doc.gift_card_number;
        req.body.type = 'Cancel';
        req.body.cancelled_transaction_id = res.locals.transaction_id;
        req.body.message = Response.r70[req.body.language];
        
        next();
      }
    });
  }
  else {
    GiftCard.findOneAndUpdate(
      {_id: res.locals.gift_card_id},
      {$inc: {balance: res.locals.amount}},
      {new: true},
      (err, doc) => {
        if (err) {
          return res.status(500).json({
      			success: false,
      			message: Response.r0[req.body.language],
      			error_code: 'e0'
      		});
        }
        else if (!doc) {
          return res.status(400).json({
            success: false,
            message: Response.r54[req.body.language],
            error_code: 'e28'
          });
        }
        else {
          req.body.success = true;
          req.body.balance = doc.balance;
          req.body.branch_id = doc.branch_id;
          req.body.client_id = doc.client_id;
          req.body.gift_card_id = doc._id;
          req.body.gift_card_number = doc.gift_card_number;
          req.body.type = 'Cancel';
          req.body.cancelled_transaction_id = res.locals.transaction_id;
          req.body.message = Response.r71[req.body.language];
          
          next();
        }
      }
    );
  }
});

// MARK: empty gift card (remittance)
router.post('/emptyGiftCard', (req, res, next) => {
  if (!req.body.gift_card_id && !req.body.gift_card_number) {
    return res.status(400).json({
      success: false,
      error_code: 'e24',
      message: Response.r37[req.body.language]
    });
  }
  if (!req.body.branch_id) {
    return res.status(400).json({
      success: false,
      error_code: 'e7',
      message: Response.r11[req.body.language]
    });
  }
  if (!req.body.employee_id) {
    return res.status(400).json({
      success: false,
      message: Response.r64[req.body.language],
      error_code: 'e42'
    });
  }
  
  // Retrieve employee number to guarantee it will be registered in the transaction
  Employee.findOne({_id: req.body.employee_id}, (err, doc) => {
    if (err) {
      return res.status(500).json({
  			success: false,
  			message: Response.r0[req.body.language],
  			error_code: 'e0'
  		});
    }
    else if (!doc) {
      return res.status(400).json({
        success: false,
        message: Response.r27[req.body.language],
        error_code: 'e19'
      });
    }
    else {
      req.body.employee_number = doc.employee_number;
      next();
    }
  });
  
}, (req, res, next) => {
  if (req.body.gift_card_id) {
    GiftCard.findOne({ _id: req.body.gift_card_id }, (err, doc) => {
      if (err) {
        return res.status(500).json({
    			success: false,
    			message: Response.r0[req.body.language],
    			error_code: 'e0'
    		});
      }
      else if (!doc) {
        return res.status(400).json({
          success: false,
          message: Response.r54[req.body.language],
          error_code: 'e28'
        });
      }
      else {
        res.locals.balance = doc.balance;
        req.body.gift_card_number = doc.gift_card_number;
        next();
      }
    });
  }
  else if (req.body.gift_card_number) {
    GiftCard.findOne({ gift_card_number: req.body.gift_card_number }, (err, doc) => {
      if (err) {
        return res.status(500).json({
    			success: false,
    			message: Response.r0[req.body.language],
    			error_code: 'e0'
    		});
      }
      else if (!doc) {
        return res.status(400).json({
          success: false,
          message: Response.r54[req.body.language],
          error_code: 'e28'
        });
      }
      else {
        res.locals.balance = doc.balance;
        req.body.gift_card_id = doc._id;
        next();
      }
    });
  }
}, (req, res, next) => {
  if (res.locals.balance > 5) {
    return res.status(400).json({
      sucess: false,
      error_code: 'e47',
      message: Response.r72[req.body.language]
    });
  }
  else if (res.locals.balance == 0) {
    return res.status(400).json({
      sucess: false,
      error_code: 'e48',
      message: Response.r73[req.body.language]
    });
  }
  next();
}, (req, res, next) => {
  Branch.findOne({ _id: req.body.branch_id }, (err, doc) => {
    if (err) {
      return res.status(500).json({
  			success: false,
  			message: Response.r0[req.body.language],
  			error_code: 'e0'
  		});
    }
    if (!doc) {
      return res.status(400).json({
        success: false,
        message: Response.r18[req.body.language],
        error_code: 'e13'
      });
    }
    else {
      if (doc.province !== 'QC') {
        return res.status(400).json({
          success: false,
          message: Response.r74[req.body.language] + doc.province + '.',
          error_code: 'e49'
        });
      }
      else {
        GiftCard.findOneAndUpdate(
          {gift_card_number: req.body.gift_card_number},
          {$set: {balance: 0}},
          {new: true},
          (err, doc2) => {
            if (err) {
              return res.status(500).json({
                success: false,
                message: Response.r0[req.body.language],
                error_code: 'e0'
              });
            }
            else {
              req.body.success = true;
              req.body.balance = doc2.balance;
              req.body.gift_card_id = doc2._id;
              req.body.branch_id = req.body.branch_id;
              req.body.client_id = doc2.client_id;
              req.body.gift_card_number = doc2.gift_card_number;
              req.body.remainder = res.locals.balance;
              req.body.type = 'Remittance';
              req.body.message = Response.r75[req.body.language];

              next();
            }
        });
      }
    }
  });
});

// MARK: - Record transaction
router.use((req, res) => {
  if (req.body.success) {
    const newTransaction = new Transaction(req.body);
    newTransaction.save((err, doc) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: Response.r0[req.body.language],
          error_code: 'e0'
        });
      }
      
      return res.status(200).json({
        success: true,
        message: Response.r76[req.body.language] + req.body.message,
        transaction_id: doc._id,
        type: req.body.type,
        balance: req.body.balance,
        remainder: req.body.remainder
      })
    });
  }
  else {
    return res.status(400).json({
      success: false,
      message: Response.r77[req.body.language],
      error_code: 'e50'
    });
  }
});


module.exports = router;
