const mongoose = require("mongoose");

const userDetailsShema = new mongoose.Schema(
  {
    username: String,
    lname: String,
    fname: String,
    DOB: Date,
    email: String,
    passportNo: Number,
    password: String,
  },
  {
    collection: "UserInfo",
  }
);

mongoose.model("UserInfo", userDetailsShema);
