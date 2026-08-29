import dotenv from "dotenv";
dotenv.config({ quiet: true });

import nodemailer from "nodemailer";

//! env values are ALWAYS strings. so NODEMAILER_SECURE="false" was still
//! coming out as true (a non empty string is truthy), and the mail was
//! trying to use SSL on a port that expects STARTTLS.
//? port 465 --> secure true, port 587 --> secure false
const port = Number(process.env.NODEMAILER_PORT) || 587;
const secure = process.env.NODEMAILER_SECURE === "true" || port === 465;

const mailTransport = nodemailer.createTransport({
  host: process.env.NODEMAILER_HOST,
  port,
  secure,
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASSWORD,
  },
});

export default mailTransport;
