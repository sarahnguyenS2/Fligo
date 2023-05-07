const { Decimal128 } = require("mongodb");
const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema({
    username: { type: String, default: null },
    seat: { type: String, default: null },
    status: { type: String, default: null },
    firstname: { type: String, default: null },
    lastname: { type: String, default: null },
    dateOfBirth: { type: Date, default: null },
    passport: { type: String, default: null },
    expiryDate: { type: Date, default: null },
    title: { type: String, default: null },
    bookTime: { type: Date, default: Date.now },
    nationality: { type: String, default: null }
  });

const flightDetailSchema = new mongoose.Schema(
    {
        flight_number: String,
        airline: String,
        img: String,
        departure: String,
        departure_code: String,
        departure_time: Date,
        arrival: String,
        arrival_code: String,
        arrival_time: Date,
        price: Decimal128,
        class: String,
        baggage: String,
        tickets: { type: [ticketSchema], default: [] }
    },
    {
        collection: "Flight"
    }
)

mongoose.model("Flight", flightDetailSchema);