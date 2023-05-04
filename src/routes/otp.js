const express = require('express')
const  router = express.Router()

const { sendOtpSms, verifyOtpSms } = require("../controller/twilio-sms")
const { sendOtpEmail, verifyOtpEmail } = require("../controller/twilio-email")

router.route('/send-otp-sms').post(sendOtpSms);
router.route('/verify-otp-sms').post(verifyOtpSms);
router.route('/send-otp-email').post(sendOtpEmail);
router.route('/verify-otp-email').post(verifyOtpEmail);

module.exports = router
