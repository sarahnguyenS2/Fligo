const { TWILIO_SERVICE_SID, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } =
  process.env;
const client = require("twilio")(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, {
  lazyLoading: true,
});

const sendOtpSms = async (req, res) => {
  const { countryCode, phoneNumber } = req.body;
  try {
    const otpResponse = await client.verify.v2
      .services(TWILIO_SERVICE_SID)
      .verifications.create({
        to: `+${countryCode || "84"}${phoneNumber}`,
        channel: "sms",
      });
    // .then(verification => console.log("Send: ",verification.status));;
    res
      .status(200)
      .send(otpResponse);
  } catch (error) {
    res
      .status(error?.status || 400)
      .send(error?.message || "Something went wrong!");
  }
};

const verifyOtpSms = async (req, res) => {
  const { countryCode, phoneNumber, otp } = req.body;
  try {
    const verifiedResponse = await client.verify.v2
      .services(TWILIO_SERVICE_SID)
      .verificationChecks.create({
        to: `+${countryCode || "84"}${phoneNumber}`,
        code: otp,
      });
    // .then(verification_check => console.log("verify: ", verification_check.status));;
    res
      .status(200)
      .send(verifiedResponse);
  } catch (error) {
    res
      .status(error?.status || 400)
      .send(error?.message || "Something went wrong!");
  }
};

exports.sendOtpSms = sendOtpSms;
exports.verifyOtpSms = verifyOtpSms;
