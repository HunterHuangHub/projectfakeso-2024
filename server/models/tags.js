// Tag Document Schema
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tag = new Schema({
    name: String
});

module.exports = mongoose.model("Tag", tag)