const { Decimal128 } = require("mongodb");
const mongoose = require("mongoose");

const flightDetailSchema = new mongoose.Schema(
    {
        flight_number: String,
        airline: String,
        departure: String,
        departure_code: String,
        departure_time: Date,
        arrival: String,
        arrival_code: String,
        arrival_time: Date,
        price: Decimal128,
        class: String,
        baggage: String
    },
    {
        collection: "Flight"
    }
)

mongoose.model("UserInfo", userDetailsShema);