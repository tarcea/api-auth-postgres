const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const smtpTransport = nodemailer.createTransport({
  host: 'smtp-relay.sendinblue.com',
  port: 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_SECRET
  }
});

const sendMail = async (to, username, password) => {
  let sendResult = await smtpTransport.sendMail({
    from: process.env.SMTP_FROM,
    to: to,
    subject: 'Password change request',
    text: '',
    html: `<h1>Hi <em>${username}</em>, your new password is ...</h1><p>${password}</p>`
  });
  // console.log(sendResult)
};

// sendMail().catch(err => console.log(err))
module.exports = {sendMail};