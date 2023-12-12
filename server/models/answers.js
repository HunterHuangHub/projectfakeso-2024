// Answer Document Schema
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const answer = new Schema({
    text: String,
    ans_by: String,
    ans_date_time: Date
});

module.exports = mongoose.model("Answer", answer)