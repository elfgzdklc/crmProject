const nodemailer = require("nodemailer");

module.exports = async (email, subject, html) => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: Boolean(process.env.SMTP_SECURE), // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER, // generated ethereal user
            pass: process.env.SMTP_PASS, // generated ethereal password
        }
    });

    const mailOptions = {
        from: process.env.SMTP_FROM, // sender address
        to: email, // list of receivers
        subject: subject, // Subject line
        html: html
    };
    transporter.sendMail(mailOptions, function (err, info) {
        if (err) {
            console.log(err);
        } else {
            console.log(info);
        }
    });
}
