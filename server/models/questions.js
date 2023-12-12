// Question Document Schema
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const question = new Schema({
    title: String,
    summary: String,
    text: String,
    tags: [{ type: Schema.Types.ObjectId, ref: "Tag"}],
    answers: [{ type: Schema.Types.ObjectId, ref: "Answer"}],
    asked_by: String,
    ask_date_time: Date,
    views: Number,
    reputation: Number
});

module.exports = mongoose.model("Question", question)