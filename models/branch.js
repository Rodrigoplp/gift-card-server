'use strict';

var mongoose  = require('mongoose');
var Schema    = mongoose.Schema;

var BranchSchema = new Schema({
  branch_name: String,
  number: Number,
  street: String,
  street_2: String,
  city: String,
  province: String,
  postal_code: String,
  country: String,
  telephone: String,
  cellular: String,
  telephone_other: String,
  merchant_id: { type: Schema.Types.ObjectId, ref: 'Merchant' }
}, {timestamps: true});

module.exports = mongoose.model('Branch', BranchSchema);
