require('dotenv').config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const twilioRouter = require("./src/routes/otp");

app.use(express.json());
app.use(cors());
app.use("/otp/", twilioRouter);

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

// User Data
require("./src/models/UserModel");
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
});
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });

  if (!user) {
    return res.json({ error: "User NOT found!" });
  }

  if (await bcrypt.compare(password, user.password)) {
    const token = jwt.sign({ username: user.username }, JWT_SECRET, {
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

    const username = user.username;
    User.findOne({ username: username })
      .then((data) => {
        res.send({ status: "Ok", data: data });
      })
      .catch((error) => {
        res.send({ status: "Error", data: error });
      });
  } catch (error) {
    console.log(e);
  }
});

app.post("/reset-password", async (req, res) => {
  const { contact, newPassword } = req.body;

  try {
    const user = await User.findOne({
      $or: [{ email: contact }, { phoneNo: contact }],
    });

    if (!user) {
      return res.json({ error: "User NOT found!" });
    }

    const encryptedPassword = await bcrypt.hash(newPassword, 10);
    user.password = encryptedPassword;
    await user.save();

    return res.json({ status: "Ok", message: "Password reset successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error!" });
  }
});

require("./src/models/FlightModel");
const Flight = mongoose.model("Flight");
app.post("/flight", async (req, res) => {
  const {
    flight_number,
    airline,
    img,
    departure,
    departure_code,
    departure_time,
    arrival,
    arrivalCode,
    arrival_time,
    price,
    ticket_class,
    baggage,
  } = req.body;

  const newFlight = new Flight({
    flight_number,
    airline,
    img,
    departure,
    departure_code,
    departure_time,
    arrival,
    arrivalCode,
    arrival_time,
    price,
    ticket_class,
    baggage,
  });

  try {
    const saveFlight = await newFlight.save();
    res.json({ status: "Ok", data: saveFlight });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Flight Data
app.get("/flights", async (req, res) => {
  const { departure, arrival, date } = req.query;

  try {
    const flights = await Flight.find({
      departure,
      arrival,
      date,
    });
    if (flights) {
      // console.log(departure, arrival);
      res.json({ status: "Ok", data: flights });
    } else {
      res.status(404).json({ error: "Flight not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(8000, () => {
  console.log("Server started");
});
