'use strict';

var mongoose  = require('mongoose');
var Schema    = mongoose.Schema;

var WorkstationSchema = new Schema({
  serial_number: String,
  number: Number,
  merchant_id: { type: Schema.Types.ObjectId, ref: 'Merchant' },
  branch_id: { type: Schema.Types.ObjectId, ref: 'Branch' },
  workstation_name: String
}, {timestamps: true});

module.exports = mongoose.model('Workstation', WorkstationSchema);
