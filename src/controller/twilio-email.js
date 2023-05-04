const {
  TWILIO_SERVICE_SID,
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  SENDGRID_API_KEY,
} = process.env;
const client = require("twilio")(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, {
  lazyLoading: true,
});
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(SENDGRID_API_KEY);

const sendOtpEmail = async (req, res) => {
  const { email } = req.body;
  try {
    const otpResponse = await client.verify.v2
      .services(TWILIO_SERVICE_SID)
      .verifications.create({
        to: email,
        channel: "email",
      });
    res.status(200).send(otpResponse);
    // : ${JSON.stringify(otpResponse)}
    console.log(otpResponse);
  } catch (error) {
    res
      .status(error?.status || 400)
      .send(error?.message || "Something went wrong!");
  }
};

const verifyOtpEmail = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const verifiedResponse = await client.verify.v2
      .services(TWILIO_SERVICE_SID)
      .verificationChecks.create({
        to: email,
        code: otp,
      });
    res.status(200).send(verifiedResponse);
    // : ${JSON.stringify(verifiedResponse)}
  } catch (error) {
    res
      .status(error?.status || 400)
      .send(error?.message || "Something went wrong!");
  }
};

exports.sendOtpEmail = sendOtpEmail;
exports.verifyOtpEmail = verifyOtpEmail;
