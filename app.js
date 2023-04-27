const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors")
app.use(express.json());

const mongoUrl =
  "mongodb+srv://thanhhao:matkhau@cluster0.2qjoujj.mongodb.net/?retryWrites=true&w=majority";

mongoose
  .connect(mongoUrl, {
    useNewUrlParser: true,
  })
  .then(() => {
    console.log("Connected to database");
  })
  .catch((e) => console.log(e));

require("./userDetail");

const User = mongoose.model("UserInfo");

app.post("/register", async (req, res) => {
  const { username, lname, fname, DOB, email, passportNo, password } = req.body;
  try {
    await User.create({
      username,
      lname,
      fname,
      DOB,
      email,
      passportNo,
      password,
    });
    res.send({ status: "Ok" });
  } catch (error) {
    res.send(error);
  }
});

app.listen(8000, () => {
  console.log("Server started");
});
