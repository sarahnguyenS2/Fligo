const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs")
app.use(express.json());
app.use(cors());

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
  const encryptedPassword = await bcrypt.hash(password, 10)
  try {
    const oldUser = User.findOne({email})
    if(oldUser) {
        res.send({error: "User is existed!"})
    }
    await User.create({
      username,
      lname,
      fname,
      DOB,
      email,
      passportNo,
      password: encryptedPassword,
    });
    res.send({ status: "Ok" });
  } catch (error) {
    res.send(error);
  }
});

app.listen(8000, () => {
  console.log("Server started");
});
