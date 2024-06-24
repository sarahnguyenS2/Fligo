require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const twilioRouter = require("./src/routes/otp");

app.use(express.json());
app.use(cors({
  origin: 'https://fligo-capstone.vercel.app',
}));
app.use("/otp/", twilioRouter);

const JWT_SECRET =
  "dasncajsidjaiocosjidjasiiha()dansnaijishahhcashdiashiasda?[]cdjsijoerwkncskjd";
const mongoUrl =
  "mongodb+srv://thanhhao:matkhau@cluster0.2qjoujj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

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
      expiresIn: "1h",
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
  const { password } = req.body;
  let contact = req.body.contact;

  // if (!contact.includes("@")) {
  //   contact = contact.slice(1);
  // }
  contact.trim().startsWith("0") ? contact.trim().substring(1) : contact.trim();
  // console.log(contact, password);
  try {
    const user = await User.findOne({
      $or: [{ email: contact }, { phoneNo: contact }],
    });
    console.log(user);
    if (!user) {
      return res.status(400).json({ error: "User NOT found!" });
    }

    const encryptedPassword = await bcrypt.hash(password, 10);
    user.password = encryptedPassword;
    await user.save();

    return res
      .status(200)
      .json({ status: "Ok", message: "Password reset successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error!" });
  }
});

require("./src/models/FlightModel");
const Flight = mongoose.model("Flight");
const Ticket = mongoose.model("Ticket");

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

app.get("/logout", (req, res) => {
  // clear the token from the client side
  res.clearCookie("token");
  res.send({ status: "Ok", data: "Logged out successfully!" });
});

// Flight Data
app.get("/flights", async (req, res) => {
  const { departure, arrival, date } = req.query;
  // console.log(req.query);
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

app.post("/book-seat", async (req, res) => {
  const { flight_number, username, seat, airline } = req.body;
  // console.log(req.body);
  try {
    // console.log(flight_number);
    // console.log(seat);
    const flight = await Flight.findOne({ flight_number });
    if (!flight) {
      return res.status(404).json({ error: "Flight NOT found" });
    }
    const selectedTicket = flight.tickets.find((obj) => obj.seat === seat);
    const index = flight.tickets.findIndex((obj) => obj.seat === seat);
    // console.log(!selectedTicket);
    if (selectedTicket) {
      if (selectedTicket.status === "approved") {
        return res.status(400).json({ error: "Seat is not available" });
      }
      const diffInMins = Math.floor(
        Math.abs(Date.now() - selectedTicket.bookTime) / (1000 * 60)
      );
      if (diffInMins <= 15) {
        return res.status(400).json({ error: "Seat is not available" });
      } else {
        flight.tickets[index].username = username;
        await flight.save();
        return res.json({ message: "Ticket booked successfully" });
      }
    }
    const ticket = { username, seat, airline };
    flight.tickets.push(ticket);
    await flight.save();

    res.json({ message: "Ticket booked successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.patch("/book-seat", async (req, res) => {
  const {
    flight_number,
    seat,
    firstname,
    lastname,
    dateOfBirth,
    passport,
    expiryDate,
    title,
    nationality,
    paymentBill,
  } = req.body;
  // console.log(req.body);
  const flight = await Flight.findOne({ flight_number });
  if (!flight) {
    return res.status(404).json({ error: "Flight NOT found" });
  }
  const selectedTicketIndex = flight.tickets.findIndex(
    (obj) => obj.seat === seat
  );
  if (selectedTicketIndex === -1) {
    return res.status(404).json({ error: "Ticket NOT found" });
  }

  const generateReservationCode = () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  };

  // console.log(selectedTicketIndex);
  flight.tickets[selectedTicketIndex].firstname = firstname;
  flight.tickets[selectedTicketIndex].lastname = lastname;
  flight.tickets[selectedTicketIndex].status = "approved";
  flight.tickets[selectedTicketIndex].dateOfBirth = dateOfBirth;
  flight.tickets[selectedTicketIndex].passport = passport;
  flight.tickets[selectedTicketIndex].expiryDate = expiryDate;
  flight.tickets[selectedTicketIndex].title = title;
  flight.tickets[selectedTicketIndex].nationality = nationality;
  flight.tickets[selectedTicketIndex].reservationCode =
    generateReservationCode();
  flight.tickets[selectedTicketIndex].paymentBill = paymentBill;

  try {
    await flight.save();
    res.json({ message: "Ticket booked successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/flights/:flightNumber/tickets", async (req, res) => {
  try {
    const { flightNumber } = req.params;

    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const flight = await Flight.findOne({ flight_number: flightNumber });

    if (!flight) {
      return res.status(404).json({ message: "Flight not found" });
    }

    const filteredTickets = flight.tickets.filter((ticket) => {
      return (
        ticket.status === "approved" ||
        (ticket.status === "pending" && ticket.bookTime > fifteenMinutesAgo)
      );
    });
    // console.log(filteredTickets);
    res.json(filteredTickets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/tickets/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const flights = await Flight.find({ "tickets.username": username });
    const tickets = flights.reduce((acc, flight) => {
      const flightTickets = flight.tickets.filter(
        (ticket) => ticket.username === username && ticket.status === "approved"
      );
      return [...acc, ...flightTickets];
    }, []);

    res.status(200).json(tickets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/details", async (req, res) => {
  const { username, bookTime } = req.query
  try {
    const flights = await Flight.find({ "tickets.username": username, "tickets.bookTime": bookTime });
    const tickets = flights.reduce((acc, flight) => {
      const flightTickets = flight.tickets.filter((ticket) => ticket.username === username && ticket.bookTime.toISOString() === bookedTime);
      return [...acc, ...flightTickets];
    }, []);
    res.json(tickets)
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(8000, () => {
  console.log("Server started");
});
