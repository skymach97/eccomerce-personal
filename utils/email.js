const nodemailer = require('nodemailer');
const sendinBlue = require('nodemailer-sendinblue-transport');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Natours <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (
      process.env.NODE_ENV === 'production ' ||
      process.env.NODE_ENV === 'production'
    ) {
      return nodemailer.createTransport({
        service: 'SendinBlue', // no need to set host or port etc.
        auth: {
          user: 'shouryamundra@gmail.com',
          pass: 'VFhjwRDaYd1CL3gW'
        }
      });
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_POST,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  async send(template, subject) {
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject
    });

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html)
    };

    await this.newTransport().sendMail(mailOptions);
  }

  async sendVerifyEmail() {
    await this.send('verify', 'Verify Your Email');
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours Family!');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 10 minutes)'
    );
  }
};
