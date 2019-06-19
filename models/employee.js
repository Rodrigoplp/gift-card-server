'use strict';

var mongoose  = require('mongoose');
var Schema    = mongoose.Schema;

var EmployeeSchema = new Schema({
  merchant_id: { type: Schema.Types.ObjectId, ref: 'Merchant' },
  branch_id: { type: Schema.Types.ObjectId, ref: 'Branch' },
  employee_number: Number,
  employee_name: String
}, {timestamps: true});

module.exports = mongoose.model('Employee', EmployeeSchema);
