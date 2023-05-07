const mongoose = require("mongoose");

const userDetailsShema = new mongoose.Schema(
  {
    username: {type: String, unique},
    firstname: String,
    lastname: String,
    dayOfBirth: Date,
    email: {type: String, unique: true},
    phoneNo: String,
    password: String,
  },
  {
    collection: "UserInfo",
  }
);

mongoose.model("UserInfo", userDetailsShema);
