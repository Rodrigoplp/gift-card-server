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
const Generator     = require('./gift-card-number.js');
const Response     = require('../etc/responses.json');


// REST API

// MARK: welcome

router.all('/welcome', (req, res) => {
  res.status(200).json({
    success: true,
    message: Response.r1[req.body.language]
  });
});

// MARK: - Extractors

// MARK: extract client
function extractClient(payload) {
  let client_id = payload._id;
  let merchant_id = payload.merchant_id;
  let branch_id = payload.branch_id;
  let client_name = payload.client_name;
  let client_email = payload.client_email;
  let street = payload.street;
  let street_2 = payload.street_2;
  let city = payload.city;
  let province = payload.province;
  let postal_code = payload.postal_code;
  let country = payload.country;
  let telephone = payload.telephone;
  let cellular = payload.cellular;
  let telephone_other = payload.telephone_other;
  let birthday = payload.birthday;
  
  return {
    client_id,
    merchant_id,
    branch_id,
    client_name,
    client_email,
    street,
    street_2,
    city,
    province,
    postal_code,
    country,
    telephone,
    cellular,
    telephone_other,
    birthday
  }
}

// MARK: extract gift card
function extractGiftCard(payload) {
  let gift_card_id = payload._id;
  let gift_card_number = payload.gift_card_number;
  let merchant_id = payload.merchant_id;
  let branch_id = payload.branch_id;
  let balance = payload.balance;
  let points = payload.points;
  
  return {
    gift_card_id,
    gift_card_number,
    merchant_id,
    branch_id,
    balance,
    points
  }
}

// MARK: extract transaction
function extractTransaction(payload) {
  let transaction_id = payload._id;
  let merchant_id = payload.merchant_id;
  let branch_id = payload.branch_id;
  let client_id = payload.client_id;
  let workstation_id = payload.workstation_id;
  let serial_number = payload.serial_number;
  let employee_id = payload.employee_id;
  let employee_number = payload.employee_number;
  let invoice = payload.invoice;
  let type = payload.type;
  let gift_card_id = payload.gift_card_id;
  let gift_card_number = payload.gift_card_number;
  let points_amount = payload.points_amount;
  let remainder = payload.remainder;
  let cancelled_transaction_id = payload.cancelled_transaction_id;
  let cancelled = payload.cancelled;
  let message = payload.message;
  
  return {
    transaction_id,
    merchant_id,
    branch_id,
    client_id,
    workstation_id,
    serial_number,
    employee_id,
    employee_number,
    invoice,
    type,
    gift_card_id,
    gift_card_number,
    points_amount,
    remainder,
    cancelled_transaction_id,
    cancelled,
    message
  }
}


// MARK: - Registration

// MARK: add branch
router.post('/addBranch', (req, res, next) => {
  if (!req.body.name) {
    return res.status(400).json({
      success: false,
      error_code: 'e1',
      messsage: Response.r2[req.body.language]
    });
  }
  
  // Search for equal branches already in database for this Merchant
  Branch.findOne({ merchant_id: req.body.merchant_id, name: req.body.name }, (err, doc) => {
    if (err) return res.status(500).json({
			success: false,
			message: Response.r0[req.body.language],
			error_code: 'e0'
		});
		if (!doc) next();
    else {
      return res.status(409).json({
        success: false,
        error_code: 'e2',
        message: Response.r3[req.body.language]
      })
    };
  })
}, (req, res, next) => {
  // Get the next available branch number
  Branch.findOne({ merchant_id: req.body.merchant_id }).sort({ number: -1 }).limit(1).exec((err, doc) => {
    if (err) return res.status(500).json({
			success: false,
			message: Response.r0[req.body.language],
			error_code: 'e0'
		});
		if (!doc) {
      req.body.number = 1;
      next();
    }
    else {
      req.body.number = doc.number + 1;
      next();
    }
  });
}, (req, res) => {
  // Create a new branch
  const newBranch = new Branch(req.body);
	newBranch.save((err, doc) => {
    if (err) return res.status(500).json({
			success: false,
			message: Response.r0[req.body.language],
			error_code: 'e0'
		});
		
    return res.status(200).json({
  		success: true,
  		message: Response.r4[req.body.language],
      branch_id: doc._id
  	});
	});
});

// MARK: add workstation
router.post('/addWorkstation', (req, res, next) => {
  if (!req.body.branch_id) {
    req.body.branch_id = req.body.merchant_id;
  }
  
  // Get the next available workstation number
  Workstation.findOne({ merchant_id: req.body.merchant_id }).sort({ number: -1 }).limit(1).exec((err, doc) => {
    if (err) return res.status(500).json({
			success: false,
			message: Response.r0[req.body.language],
			error_code: 'e0'
		});
		if (!doc) {
      req.body.number = 1;
      next();
    }
    else {
      req.body.number = doc.number + 1;
      next();
    }
  })
}, (req, res) => {
  const newWorkstation = new Workstation(req.body);
	newWorkstation.save((err, doc) => {
    if (err) return res.status(500).json({
			success: false,
			message: Response.r0[req.body.language],
			error_code: 'e0'
		});
		
    return res.status(200).json({
  		success: true,
  		message: Response.r5[req.body.language],
      workstation_id: doc._id
  	});
	});
});

// MARK: add employee
router.post('/addEmployee', (req, res, next) => {
  if (!req.body.employee_name) {
    return res.status(400).json({
      success: false,
      error_code: 'e3',
      messsage: Response.r6[req.body.language]
    });
  }
  
  if (!req.body.branch_id) {
    req.body.branch_id = req.body.merchant_id;
  }
  
  // Check for employees with the same name at this Merchant
  Employee.findOne({merchant_id: req.body.merchant_id, employee_name: req.body.employee_name}, (err, doc) =>{
    if (err) return res.status(500).json({
			success: false,
			message: Response.r0[req.body.language],
			error_code: 'e0'
		});
		if (!doc) next();
    else {
      return res.status(400).json({
        success: false,
        error_code: 'e4',
        messsage: Response.r7[req.body.language]
      });
    }
  });
}, (req, res, next) => {
  // Get next available employee number
  Employee.findOne({ branch_id: req.body.branch_id }).sort({ employee_number: -1 }).limit(1).exec((err, doc) => {
    if (err) return res.status(500).json({
			success: false,
			message: Response.r0[req.body.language],
			error_code: 'e0'
		});
		if (!doc) {
      req.body.employee_number = 1;
      next();
    }
    else {
      req.body.employee_number = doc.employee_number + 1;
      next();
    }
  })
}, (req, res) => {
  const newEmployee = new Employee(req.body);
	newEmployee.save((err, doc) => {
    if (err) return res.status(500).json({
			success: false,
			message: Response.r0[req.body.language],
			error_code: 'e0'
		});
		
    return res.status(200).json({
  		success: true,
  		message: Response.r8[req.body.language],
      employee_number: doc.employee_number,
      employee_id: doc._id
  	});
	});
});

// MARK: add client
// Adding a client automatically creates a gift-card
router.post('/addClient', (req, res, next) => {
  if (!req.body.client_name) {
    return res.status(400).json({
      success: false,
      message: Response.r9[req.body.language],
      error_code: 'e5'
    });
  }
  
  if (!req.body.client_email) {
    return res.status(400).json({
      success: false,
      message: Response.r10[req.body.language],
      error_code: 'e6'
    });
  }
  
  if (!req.body.branch_id) {
    Branch.find({ merchant_id: req.body.merchant_id }, (err, doc) => {
      if (err) return res.status(500).json({
  			success: false,
  			message: Response.r0[req.body.language],
  			error_code: 'e0'
  		});
  		else if (doc.length === 0) {
        req.body.branch_id = req.body.merchant_id;
      }
      else if (doc.length > 1) {
        return res.status(400).json({
          success: false,
          message: Response.r11[req.body.language],
          error_code: 'e7'
        });
      }
    });
  }
  
  // Check if this client name already exists in this Merchant's database
  Client.findOne({ merchant_id: req.body.merchant_id, name: req.body.client_name }, (err, doc) => {
    if (err) return res.status(500).json({
			success: false,
			message: Response.r0[req.body.language],
			error_code: 'e0'
		});
		if (doc) {
      return res.status(400).json({
        success: false,
        message: Response.r12[req.body.language],
        error_code: 'e8',
        client_name: doc.name,
        client_id: doc._id
      });
    }
    else {
      next();
    }
  });
}, (req, res, next) => {
  // Get next available client number for this merchant
  Client.findOne({ merchant_id: req.body.merchant_id }).sort({ number: -1 }).limit(1).exec((err, doc) => {
    if (err) return res.status(500).json({
			success: false,
			message: Response.r0[req.body.language],
			error_code: 'e0'
		});
		if (!doc) {
      req.body.number = 1;
      next();
    }
    else {
      req.body.number = doc.number + 1;
      next();
    }
  })
}, (req, res) => {
  // Create next client
  const newClient = new Client(req.body);
	newClient.save((err, doc) => {
    if (err) return res.status(500).json({
			success: false,
			message: Response.r0[req.body.language],
			error_code: 'e0'
		});
		req.body.client_id = doc._id;
    req.body.client_name = doc.client_name;
    
    // Proceed to create a gift card for this new client
    res.locals.fromAddClient = true;
    Generator(req, res);
	});
});

  // MARK: add gift card
router.post('/addGiftCard', (req, res) => {
  if (!req.body.client_id) {
    return res.status(400).json({
      success: false,
      error_code: 'e9',
      message: Response.r13[req.body.language]
    });
  }
  
  if (!req.body.branch_id) {
    return res.status(400).json({
      success: false,
      error_code: 'e10',
      message: Response.r14[req.body.language]
    });
  }
  
  Generator(req, res);
});


// MARK: - Editing records

// MARK: edit merchant
router.put('/editMerchant', (req, res) => {
  if (!req.body.data) {
    return res.status(400).json({
      success: false,
      message: Response.r15[req.body.language],
      error_code: 'e11'
    });
  }
  
  Merchant.findOneAndUpdate({_id: req.body.merchant_id}, {$set: req.body.data}, {new: true}, (err, doc) => {
    if (err) return res.status(500).json({
			success: false,
			message: Response.r0[req.body.language],
			error_code: 'e0'
		});
		else if (!doc) {
      return res.status(400).json({
        success: false,
        message: Response.r16[req.body.language],
        error_code: 'e12'
      });
    }
    else
	    return res.status(200).json({
				success: true,
				message: Response.r17[req.body.language],
        merchant_id: doc._id,
        merchant_name: doc.merchant_name,
        merchant_email: doc.merchant_email
			});
	});
});

// MARK: edit branch
router.put('/editBranch', (req, res) => {
  if (!req.body.branch_id) {
    return res.status(400).json({
      success: false,
      message: Response.r11[req.body.language],
      error_code: 'e7'
    });
  }
  if (!req.body.data) {
    return res.status(400).json({
      success: false,
      message: Response.r15[req.body.language],
      error_code: 'e11'
    });
  }
  
  Branch.findOneAndUpdate({_id: req.body.branch_id}, {$set: req.body.data}, {new: true}, (err, doc) => {
    if (err) return res.status(500).json({
			success: false,
			message: Response.r0[req.body.language],
			error_code: 'e0'
		});
		else if (!doc) {
      return res.status(400).json({
        success: false,
        message: Response.r18[req.body.language],
        error_code: 'e13'
      });
    }
    else {
      return res.status(200).json({
        success: true,
        message: Response.r19[req.body.language],
        branch_id: doc._id,
        branch_name: doc.branch_name,
        street: doc.street,
        street_2: doc.street_2,
        city: doc.city,
        province: doc.province,
        postal_code: doc.postal_code,
        country: doc.country,
        telephone: doc.telephone,
        cellular: doc.cellular,
        telephone_other: doc.telephone_other
      });
    }
  });
});

// MARK: edit workstation
router.put('/editWorkstation', (req, res) => {
  if (!req.body.workstation_id) {
    return res.status(400).json({
      success: false,
      message: Response.r20[req.body.language],
      error_code: 'e14'
    });
  }
  if (!req.body.data) {
    return res.status(400).json({
      success: false,
      message: Response.r15[req.body.language],
      error_code: 'e11'
    });
  }
  
  Workstation.findOneAndUpdate({_id: req.body.workstation_id}, {$set: req.body.data}, {new: true}, (err, doc) => {
    if (err) return res.status(500).json({
			success: false,
			message: Response.r0[req.body.language],
			error_code: 'e0'
		});
		else if (!doc) {
      return res.status(400).json({
        success: false,
        message: Response.r21[req.body.language],
        error_code: 'e15'
      });
    }
    else {
      return res.status(200).json({
        success: true,
        message: Response.r22[req.body.language],
        workstation_id: doc._id,
        serial_number: doc.serial_number,
        workstation_name: doc.workstation_name
      });
    }
  });
});

// MARK: edit client
router.put('/editClient', (req, res) => {
  if (!req.body.client_id) {
    return res.status(400).json({
      success: false,
      message: Response.r23[req.body.language],
      error_code: 'e16'
    });
  }
  if (!req.body.data) {
    return res.status(400).json({
      success: false,
      message: Response.r15[req.body.language],
      error_code: 'e11'
    });
  }
  
  Client.findOneAndUpdate({_id: req.body.client_id}, {$set: req.body.data}, {new: true}, (err, doc) => {
    if (err) return res.status(500).json({
			success: false,
			message: Response.r0[req.body.language],
			error_code: 'e0'
		});
		else if (!doc) {
      return res.status(400).json({
        success: false,
        message: Response.r24[req.body.language],
        error_code: 'e17'
      });
    }
    else {
      return res.status(200).json({
        success: true,
        message: Response.r25[req.body.language],
        client_id: doc._id,
        client_name: doc.client_name,
        client_email: doc.client_email,
        birthday: doc.birthday,
        street: doc.street,
        street_2: doc.street_2,
        city: doc.city,
        province: doc.province,
        postal_code: doc.postal_code,
        country: doc.country,
        telephone: doc.telephone,
        cellular: doc.cellular,
        telephone_other: doc.telephone_other
      });
    }
  });
});

// MARK: edit employee
router.put('/editEmployee', (req, res) => {
  if (!req.body.employee_id) {
    return res.status(400).json({
      success: false,
      message: Response.r26[req.body.language],
      error_code: 'e18'
    });
  }
  if (!req.body.data) {
    return res.status(400).json({
      success: false,
      message: Response.r15[req.body.language],
      error_code: 'e11'
    });
  }
  
  Employee.findOneAndUpdate({_id: req.body.employee_id}, {$set: req.body.data}, {new: true}, (err, doc) => {
    if (err) return res.status(500).json({
			success: false,
			message: Response.r0[req.body.language],
			error_code: 'e0'
		});
		else if (!doc) {
      return res.status(400).json({
        success: false,
        message: Response.r27[req.body.language],
        error_code: 'e19'
      });
    }
    else {
      return res.status(200).json({
        success: true,
        message: Response.r28[req.body.language],
        employee_id: doc._id,
        number: doc.number,
        employee_name: doc.employee_name
      });
    }
  });
});


// MARK: - Deleting records

// MARK: delete merchant
router.delete('/deleteMerchant', (req, res) => {
  Merchant.remove({_id: req.body.merchant_id}, (err) => {
    if (err) return res.status(500).json({
			success: false,
			message: Response.r0[req.body.language],
			error_code: 'e0'
		});
		else
		return res.status(200).json({
			success: true,
			message: Response.r29[req.body.language]
		});
	})
});

// MARK: delete branch
router.delete('/deleteBranch', (req, res) => {
  if (!req.body.branch_id) {
    return res.status(400).json({
      success: false,
      message: Response.r30[req.body.language],
      error_code: 'e20'
    });
  }
  Branch.remove({_id: req.body.branch_id}, (err) => {
    if (err) return res.status(500).json({
			success: false,
			message: Response.r0[req.body.language],
			error_code: 'e0'
		});
		else {
      return res.status(200).json({
  			success: true,
  			message: Response.r31[req.body.language]
  		});
    }
	})
});

// MARK: delete workstation
router.delete('/deleteWorkstation', (req, res) => {
  if (!req.body.workstation_id) {
    return res.status(400).json({
      success: false,
      message: Response.r32[req.body.language],
      error_code: 'e21'
    });
  }
  Workstation.remove({_id: req.body.workstation_id}, (err) => {
    if (err) return res.status(500).json({
			success: false,
			message: Response.r0[req.body.language],
			error_code: 'e0'
		});
		else {
      return res.status(200).json({
  			success: true,
  			message: Response.r33[req.body.language]
  		});
    }
	})
});

// MARK: delete client
router.delete('/deleteClient', (req, res) => {
  if (!req.body.client_id) {
    return res.status(400).json({
      success: false,
      message: Response.r23[req.body.language],
      error_code: 'e16'
    });
  }
  Client.remove({_id: req.body.client_id}, (err) => {
    if (err) return res.status(500).json({
			success: false,
			message: Response.r0[req.body.language],
			error_code: 'e0'
		});
		else {
      return res.status(200).json({
  			success: true,
  			message: Response.r34[req.body.language]
  		});
    }
	})
});

// MARK: delete branch
router.delete('/deleteEmployee', (req, res) => {
  if (!req.body.employee_id) {
    return res.status(400).json({
      success: false,
      message: Response.r35[req.body.language],
      error_code: 'e22'
    });
  }
  Employee.remove({_id: req.body.employee_id}, (err) => {
    if (err) return res.status(500).json({
			success: false,
			message: Response.r0[req.body.language],
			error_code: 'e0'
		});
		else {
      return res.status(200).json({
  			success: true,
  			message: Response.r36[req.body.language]
  		});
    }
	})
});

// MARK: delete gift card
router.delete('/deleteGiftCard', (req, res) => {
  if (!req.body.gift_card_id && !req.body.gift_card_number) {
    return res.status(400).json({
      success: false,
      message: Response.r37[req.body.language],
      error_code: 'e24'
    });
  }
  if (req.body.gift_card_id) {
    GiftCard.remove({_id: req.body.gift_card_id}, (err) => {
      if (err) return res.status(500).json({
  			success: false,
  			message: Response.r0[req.body.language],
  			error_code: 'e0'
  		});
  		else {
        return res.status(200).json({
    			success: true,
    			message: Response.r38[req.body.language]
    		});
      }
  	});
  }
  else if (req.body.gift_card_number) {
    GiftCard.remove({gift_card_number: req.body.gift_card_number}, (err) => {
      if (err) return res.status(500).json({
  			success: false,
  			message: Response.r0[req.body.language],
  			error_code: 'e0'
  		});
  		else {
        return res.status(200).json({
    			success: true,
    			message: Response.r38[req.body.language]
    		});
      }
  	})
  }
});


// MARK: - Query

// MARK: get merchants
router.get('/getMerchants', (req, res) => {
  Merchant.find(req.query, (err, doc) => {
    if (err) return res.status(500).json({
			success: false,
			message: Response.r0[req.body.language],
			error_code: 'e0'
		});
		else if (!doc) {
      return res.status(200).json({
        success: true,
        message: Response.r39[req.body.language]
      });
    }
    else {
      var array = [];
      for (var i = 0; i<doc.length; i++) {
        let foo = doc[i];
        let merchant_id = foo._id;
        let merchant_name = foo.merchant_name;
        let merchant_email = foo.merchant_email;
        let street = foo.street;
        let street_2 = foo.street_2;
        let city = foo.city;
        let province = foo.province;
        let postal_code = foo.postal_code;
        let country = foo.country;
        let telephone = foo.telephone;
        let cellular = foo.cellular;
        let telephone_other = foo.telephone_other;
        
        let filtered = {
          merchant_id,
          merchant_name,
          merchant_email,
          street,
          street_2,
          city,
          province,
          postal_code,
          country,
          telephone,
          cellular,
          telephone_other
        }
        array.push(filtered);
      }
      
      return res.status(200).json({
        success: true,
        message: Response.r40[req.body.language],
        merchants: array
      });
    }
  });
});

// MARK: get branches
router.get('/getBranches', (req, res) => {
  if (!req.query.merchant_id) {
    return res.status(400).json({
      success: false,
      message: Response.r41[req.body.language],
      error_code: 'e25'
    });
  }
  Branch.find(req.query, (err, doc) => {
    if (err) return res.status(500).json({
			success: false,
			message: Response.r0[req.body.language],
			error_code: 'e0'
		});
		else if (!doc) {
      return res.status(200).json({
        success: true,
        message: Response.r42[req.body.language]
      });
    }
    else {
      var array = [];
      for (var i = 0; i<doc.length; i++) {
        let foo = doc[i];
        let branch_id = foo._id;
        let merchant_id = foo.merchant_id;
        let branch_name = foo.branch_name;
        let telephone = foo.telephone;
        let filtered = {
          branch_id,
          merchant_id,
          branch_name,
          telephone
        }
        array.push(filtered);
      }
      
      return res.status(200).json({
        success: true,
        message: Response.r43[req.body.language],
        branches: array
      });
    }
  });
});

// MARK: get workstations
router.get('/getWorkstations', (req, res) => {
  Workstation.find(req.query, (err, doc) => {
    if (err) return res.status(500).json({
			success: false,
			message: Response.r0[req.body.language],
			error_code: 'e0'
		});
		else if (!doc) {
      return res.status(200).json({
        success: true,
        message: Response.r44[req.body.language]
      });
    }
    else {
      var array = [];
      for (var i = 0; i<doc.length; i++) {
        let foo = doc[i];
        let workstation_id = foo._id;
        let merchant_id = foo.merchant_id;
        let branch_id = foo.branch_id;
        let workstation_name = foo.workstation_name;
        let serial_number = foo.serial_number;
        let filtered = {
          workstation_id,
          merchant_id,
          branch_id,
          workstation_name,
          serial_number
        }
        array.push(filtered);
      }
      
      return res.status(200).json({
        success: true,
        message: Response.r45[req.body.language],
        workstations: array
      });
    }
  });
});

// MARK: get clients
router.get('/getClients', (req, res) => {
  if (!req.query.merchant_id) {
    return res.status(400).json({
      success: false,
      message: Response.r41[req.body.language],
      error_code: 'e25'
    });
  }
  Client.find(req.query, (err, doc) => {
    if (err) return res.status(500).send({ error: err });
    else if (!doc) {
      return res.status(200).json({
        success: true,
        message: Response.r46[req.body.language]
      });
    }
    else {
      var array = [];
      for (var i = 0; i<doc.length; i++) {
        let foo = doc[i];
        let filtered = extractClient(foo);
        array.push(filtered);
      }
      
      return res.status(200).json({
        success: true,
        message: Response.r47[req.body.language],
        clients: array
      });
    }
  });
});

// MARK: get client details
router.get('/getClientDetails', (req, res, next) => {
  var empty = true;
  for (var i in req.query) {
    empty = false;
    break;
  }
  if (empty) {
    return res.status(400).json({
      success: false,
      message: Response.r48[req.body.language],
      error_code: 'e27'
    })
  }
  
  Client.findOne(req.query, (err, doc) => {
    if (err) return res.status(500).send({ error: err });
    else if (!doc) {
      return res.status(200).json({
        success: false,
        message: Response.r46[req.body.language],
        error_code: 'e26'
      });
    }
    else {
      res.locals.client = extractClient(doc);
      next();
    }
  });
}, (req, res, next) => {
  GiftCard.find({client_id: res.locals.client.client_id}, (err, doc) => {
    if (err) return res.status(500).json({
			success: false,
			message: Response.r0[req.body.language],
			error_code: 'e0'
		});
		else if (doc) {
      var array = [];
      for (var i = 0; i<doc.length; i++) {
        let foo = doc[i];
        let filtered = extractGiftCard(foo);
        array.push(filtered);
      }
      res.locals.gift_cards = array;
    }
    
    next();
  });
}, (req, res, next) => {
  Transaction.find({client_id: res.locals.client.client_id}, (err, doc) => {
    if (err) return res.status(500).json({
			success: false,
			message: Response.r0[req.body.language],
			error_code: 'e0'
		});
		else if (doc) {
      var array = [];
      for (var i = 0; i<doc.length; i++) {
        let foo = doc[i];
        let filtered = extractTransaction(foo);
        array.push(filtered);
      }
      res.locals.transactions = array;
    }
    
    next();
  });
}, (req, res, next) => {
  return res.status(200).json({
    success: true,
    message: Response.r49[req.body.language],
    details: res.locals
  })
});

// MARK: get employees
router.get('/getEmployees', (req, res) => {
  Employee.find(req.query, (err, doc) => {
    if (err) return res.status(500).json({
			success: false,
			message: Response.r0[req.body.language],
			error_code: 'e0'
		});
		else if (!doc) {
      return res.status(200).json({
        success: true,
        message: Response.r50[req.body.language]
      });
    }
    else {
      var array = [];
      for (var i = 0; i<doc.length; i++) {
        let foo = doc[i];
        let employee_id = foo._id;
        let merchant_id = foo.merchant_id;
        let branch_id = foo.branch_id;
        let employee_name = foo.employee_name;
        let employee_number = foo.employee_number;
        
        let filtered = {
          employee_id,
          merchant_id,
          branch_id,
          employee_name,
          employee_number
        }
        array.push(filtered);
      }
      
      return res.status(200).json({
        success: true,
        message: Response.r51[req.body.language],
        employees: array
      });
    }
  });
});

// MARK: get gift cards
router.get('/getGiftCards', (req, res) => {
  GiftCard.find(req.query, (err, doc) => {
    if (err) return res.status(500).json({
			success: false,
			message: Response.r0[req.body.language],
			error_code: 'e0'
		});
		else if (!doc) {
      return res.status(200).json({
        success: true,
        message: Response.r52[req.body.language]
      });
    }
    else {
      var array = [];
      for (var i = 0; i<doc.length; i++) {
        let foo = doc[i];
        let filtered = extractGiftCard(foo);
        array.push(filtered);
      }
      
      return res.status(200).json({
        success: true,
        message: Response.r53[req.body.language],
        gift_cards: array
      });
    }
  });
});

// MARK: get gift card details
router.get('/getGiftCardDetails', (req, res, next) => {
  if (!req.query.gift_card_id && !req.query.gift_card_number) {
    return res.status(400).json({
      success: false,
      message: Response.r37[req.body.language],
      error_code: 'e24'
    })
  }
  else if (req.query.gift_card_id){
    GiftCard.findOne({ _id: req.query.gift_card_id }, (err, doc) => {
      if (err) return res.status(500).json({
  			success: false,
  			message: Response.r0[req.body.language],
  			error_code: 'e0'
  		});
  		else if (!doc) {
        return res.status(400).json({
          success: false,
          message: Response.r54[req.body.language],
          error_code: 'e28'
        });
      }
      else {
        res.locals.balance = doc.balance;
        res.locals.points = doc.points;
        res.locals.merchant_id = doc.merchant_id,
        res.locals.branch_id = doc.branch_id;
        res.locals.client_id = doc.client_id;
        res.locals.gift_card_number = doc.gift_card_number;
        next();
      }
    });
  }
  else if (req.query.gift_card_number){
    GiftCard.findOne({ gift_card_number: req.query.gift_card_number }, (err, doc) => {
      if (err) return res.status(500).json({
  			success: false,
  			message: Response.r0[req.body.language],
  			error_code: 'e0'
  		});
  		else if (!doc) {
        return res.status(400).json({
          success: false,
          message: Response.r54[req.body.language],
          error_code: 'e28'
        });
      }
      else {
        res.locals.balance = doc.balance;
        res.locals.points = doc.points;
        res.locals.merchant_id = doc.merchant_id,
        res.locals.branch_id = doc.branch_id;
        res.locals.client_id = doc.client_id;
        res.locals.gift_card_number = doc.gift_card_number;
        next();
      }
    });
  }
}, (req, res, next) => {
  Merchant.findOne(res.locals.merchant_id, (err, doc) => {
    if (err) return res.status(500).json({
			success: false,
			message: Response.r0[req.body.language],
			error_code: 'e0'
		});
		else if (!doc) {
      return res.status(400).json({
        success: false,
        message: Response.r55[req.body.language],
        error_code: 'e29'
      });
    }
    else {
      res.locals.merchant_name = doc.merchant_name;
      next();
    }
  });
}, (req, res, next) => {
  Client.findOne(res.locals.client_id, (err, doc) => {
    if (err) return res.status(500).json({
			success: false,
			message: Response.r0[req.body.language],
			error_code: 'e0'
		});
		else if (!doc) {
      return res.status(400).json({
        success: false,
        message: Response.r56[req.body.language],
        error_code: 'e30'
      });
    }
    else {
      res.locals.client_name = doc.client_name;
      next();
    }
  });
}, (req, res) => {
  Branch.findOne(res.locals.branch_id, (err, doc) => {
    if (err) return res.status(500).json({
			success: false,
			message: Response.r0[req.body.language],
			error_code: 'e0'
		});
		else if (!doc) {
      return res.status(200).json({
        success: true,
        message: Response.r57[req.body.language],
        gift_card_number: res.locals.gift_card_number,
        client_name: res.locals.client_name,
        merchant_name: res.locals.merchant_name,
        branch_name: res.locals.merchant_name,
        balance: res.locals.balance,
        points: res.locals.points,
      });
    }
    else {
      return res.status(200).json({
        success: true,
        message: Response.r57[req.body.language],
        gift_card_number: res.locals.gift_card_number,
        client_name: res.locals.client_name,
        merchant_name: res.locals.merchant_name,
        branch_name: doc.branch_name,
        balance: res.locals.balance,
        points: res.locals.points,
      });
    }
  });
});

// MARK: get transactions
router.get('/getTransactions', (req, res) => {
  if (!req.query) {
    return res.status(400).json({
      success: false,
      message: Response.r58[req.body.language],
      error_code: 'e31'
    });
  }
  Transaction.find(req.query, (err, doc) => {
    if (err) return res.status(500).json({
			success: false,
			message: Response.r0[req.body.language],
			error_code: 'e0'
		});
		else if (!doc) {
      return res.status(200).json({
        success: true,
        message: Response.r59[req.body.language]
      });
    }
    else {
      var array = [];
      for (var i = 0; i<doc.length; i++) {
        let foo = doc[i];
        let filtered = extractTransaction(foo);
        array.push(filtered);
      }
      
      return res.status(200).json({
        success: true,
        message: Response.r59[req.body.language],
        transactions: array
      });
    }
  });
});


module.exports = router;
