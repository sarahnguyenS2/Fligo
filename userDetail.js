const mongoose = require("mongoose");

const userDetailsShema = new mongoose.Schema(
  {
    username: String,
    lname: String,
    fname: String,
    DOB: Date,
    email: {type: String, unique: true},
    passportNo: Number,
    password: String,
  },
  {
    collection: "UserInfo",
  }
);

mongoose.model("UserInfo", userDetailsShema);
