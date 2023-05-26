const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_SECRET,
  },
});

const sendMail = async (to, username, password) => {
  await smtpTransport.sendMail(
    {
      from: process.env.SMTP_FROM,
      to: to,
      subject: 'Password change request',
      text: '',
      html: `<h1>Hi <em>${username}</em>, your new password is ...</h1><p>${password}</p>`,
    },
    (err, info) => {
      if (err) {
        console.log(err);
      } else {
        console.log('Email sent: ' + info.response);
      }
    }
  );
  // console.log(sendResult)
};

// sendMail().catch(err => console.log(err))
module.exports = { sendMail };
