'use strict';

var mongoose  = require('mongoose');
var Schema    = mongoose.Schema;

var TransactionSchema = new Schema({
  merchant_id: { type: Schema.Types.ObjectId, ref: 'Merchant' },
  client_id: { type: Schema.Types.ObjectId, ref: 'Client' },
  branch_id: { type: Schema.Types.ObjectId, ref: 'Branch' },
  employee_id: { type: Schema.Types.ObjectId, ref: 'Employee' },
  workstation_id: { type: Schema.Types.ObjectId, ref: 'Workstation' },
  serial_number: String,
  invoice: String,
  type: String,
  gift_card_id: { type: Schema.Types.ObjectId, ref: 'GiftCard' },
  gift_card_number: String,
  loyalty_card_id: { type: Schema.Types.ObjectId, ref: 'LoyaltyCard' },
  money_amount: Number,
  points_amount: Number,
  cancelled_transaction_id: { type: Schema.Types.ObjectId, ref: 'Transaction'},
  cancelled: Boolean,
  remainder: Number,
  message: String
}, {timestamps: true});

module.exports = mongoose.model('Transaction', TransactionSchema);
