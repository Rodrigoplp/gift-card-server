'use strict';

var mongoose  = require('mongoose');
var Schema    = mongoose.Schema;

var ClientSchema = new Schema({
  client_name: String,
  number: Number,
  street: String,
  street_2: String,
  city: String,
  province: String,
  postal_code: String,
  country: String,
  client_email: String,
  telephone: String,
  cellular: String,
  telephone_other: String,
  birthday: String,
  merchant_id: { type: Schema.Types.ObjectId, ref: 'Merchant' },
  branch_id: { type: Schema.Types.ObjectId, ref: 'Branch' }
}, {timestamps: true});

module.exports = mongoose.model('Client', ClientSchema);
