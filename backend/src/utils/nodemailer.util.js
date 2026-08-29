import mailTransport from "../config/nodemailer.config.js";

export const sendEmail = async (to, subject, text, html) => {
  const sentMail = await mailTransport.sendMail({
    from: process.env.NODEMAILER_EMAIL,
    to,
    subject,
    text,
    html,
  });

  //? only log while developing, render's log would get full of these
  if (process.env.NODE_ENV !== "production") {
    console.log("mail sent to", to, sentMail.messageId);
  }

  return sentMail;
};
