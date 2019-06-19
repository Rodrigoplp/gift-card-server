'use strict';

var mongoose  = require('mongoose');
var Schema    = mongoose.Schema;

var GiftCardSchema = new Schema({
  gift_card_number: String,
  merchant_id: { type: Schema.Types.ObjectId, ref: 'Merchant' },
  client_id: { type: Schema.Types.ObjectId, ref: 'Client' },
  branch_id: { type: Schema.Types.ObjectId, ref: 'Branch' },
  number: Number,
  balance: Number,
  points: Number
}, {timestamps: true});

module.exports = mongoose.model('GiftCard', GiftCardSchema);
