const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const qr = require("qrcode");
const axios = require("axios");

let addr;
require("dotenv").config({ path: "../.env" });

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

var transport = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "896366eee03265",
    pass: "17c4ad0f67a62e",
  },
});

router.post("/getPlace", async (req, res) => {
  try {
    // console.log(req.body)
    const { Address } = req.body;
    addr = Address;
    console.log("The address is ", addr);
    res.status(200).json({ message: "Address sent successfully" });
  } catch (error) {
    console.log(error.message);
  }
});

router.post("/allocate-slot", async (req, res) => {
  try {
    const { vehicleNumber, email } = req.body;
    console.log(vehicleNumber);
    console.log(email);

    const qrCodeData = `${vehicleNumber}`;
    const qrCodeImage = await qr.toDataURL(qrCodeData);

    const mailOptions = {
      from: "team.morph.group@gmail.com",
      to: email,
      subject: `ParkNxt spot allocation`,
      html: `<h3>Your parking spot has been allocated. Show the QR code attached with the mail to the Admin present on the parking site.</h3><br><br><h3>Location to go: ${addr}</h3><h1><a href="https://www.mappls.com/place-parking-near-me?@zdata=MTMuMzI2Mjg0Kzc3LjEyODI2NSsxMSsxMy40MDgyODYsNzcuMDI1OTU1OzEzLjIzNzU3MCw3Ny4zNjc5MDUrcGFya2luZytlbCssK2luZA==ed">Click here</a> to go to the desired location</h1>`,
      attachments: [
        {
          filename: "token.png",
          content: qrCodeImage.split(";base64,").pop(),
          encoding: "base64",
        },
      ],
    };

    const mailOptions2 = {
      from: "team.morph.group@gmail.com",
      to: email,
      subject: `${vehicleNumber}`,
      text: `car with car number ${vehicleNumber} is arriving soon for location: ${addr}`,
      attachments: [
        {
          filename: "car-number.png",
          content: qrCodeImage.split(";base64,").pop(),
          encoding: "base64",
        },
      ],
    };

    // Use a counter to track the number of emails sent
    let emailsSent = 0;

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        console.error(error.message);
        res.status(500).json({ error: "Failed to send email" });
      } else {
        console.log("Email sent:", info.response);
        emailsSent++;

        // Check if all emails have been sent before sending the response
        if (emailsSent === 2) {
          console.log("All emails sent successfully");
          res.status(200).json({ message: "Spot allocated successfully" });
        }
      }
    });

    transport.sendMail(mailOptions2, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        console.error(error.message);
        res.status(500).json({ error: "Failed to send email" });
      } else {
        console.log("Email sent:", info.response);
        emailsSent++;

        // Check if all emails have been sent before sending the response
        if (emailsSent === 2) {
          console.log("All emails sent successfully");
          res.status(200).json({ message: "Spot allocated successfully" });
        }
      }
    });

  } catch (error) {
    console.error("Error allocating parking spot:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;