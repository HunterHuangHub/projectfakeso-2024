// Profile Document Schema
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const profile = new Schema({
    username: String,
    email: String,
    password: String,
    register_date: Date,
    rep: Number,
    questions: [{ type: Schema.Types.ObjectId, ref: "Question" }],
    isAdmin: Boolean
});

module.exports = mongoose.model("Profile", profile)