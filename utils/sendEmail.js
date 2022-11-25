const nodemailer = require("nodemailer");

exports.mailTransport = () =>
    nodemailer.createTransport({
        host: "smtp.mailtrap.io",
        port: 2525,
        auth: {
            user: process.env.SMS_USER,
            pass: process.env.SMS_PASS,
        },
    });
