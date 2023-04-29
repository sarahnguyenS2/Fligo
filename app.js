const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

app.use(express.json());
app.use(cors());

const JWT_SECRET =
  "dasncajsidjaiocosjidjasiiha()dansnaijishahhcashdiashiasda?[]cdjsijoerwkncskjd";
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
  const {
    username,
    firstname,
    lastname,
    dayOfBirth,
    email,
    phoneNo,
    password,
  } = req.body;
  const encryptedPassword = await bcrypt.hash(password, 10);
  try {
    const oldUser = await User.findOne({ email });
    if (oldUser) {
      return res.json({ error: "User has been existed!" });
    }
    await User.create({
      username,
      firstname,
      lastname,
      dayOfBirth,
      email,
      phoneNo,
      password: encryptedPassword,
    });
    res.send({ status: "Ok" });
  } catch (error) {
    res.send({ error: "Error" });
  }
});

// API check email has been registered
app.post("/check-email", async (req, res) => {
  const { email } = req.body;
  try {
    const oldUser = await User.findOne({ email });
    if (oldUser) {
      return res.json({ status: "failed" });
    }
    res.json({ status: "success" });
  } catch (error) {
    res.send(error);
  }
})
app.post("/login", async (req, res) => {
  const { contact, password } = req.body;

  let user;
  if (contact.includes("@")) {
    user = await User.findOne({ email: contact });
  } else {
    user = await User.findOne({ phoneNo: contact });
  }

  if (!user) {
    return res.json({ error: "User NOT found!" });
  }

  if (await bcrypt.compare(password, user.password)) {
    const token = jwt.sign({email: user.email}, JWT_SECRET, {
      expiresIn: "15m",
    });
    if (res.status(201)) {
      return res.json({ status: "Ok", data: token });
    } else {
      return res.json({ error: "Error" });
    }
  }
  res.json({ status: "Error", error: "Invalid Password!" });
});

app.post("/userData", async (req, res) => {
  const { token } = req.body;
  try {
    const user = jwt.verify(token, JWT_SECRET, (err, res) => {
      if (err) {
        return "Token expired";
      }
      return res;
    });
    console.log(user);
    if (user == "Token expired") {
      return res.send({ status: "error", data: "Token expired" });
    }

    const useremail = user.email;
    User.findOne({ email: useremail })
      .then((data) => {
        res.send({ status: "Ok", data: data });
      })
      .catch((error) => {
        res.send({ status: "Error", data: error });
      });
  } catch (error) {console.log(e)}
});

app.listen(8000, () => {
  console.log("Server started");
});

// module.exports = app;