import dotenv from "dotenv";
dotenv.config({ quiet: true });

//! right now the app is running on COD only.
//? paypal-rest-sdk is not installed, so importing it directly was crashing the server.
//? so we import it only if the package is there AND the keys are filled in .env
//? to turn online payment on --> npm i paypal-rest-sdk  and fill the PAYPAL_ keys in .env

let paypal = null;

if (process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET) {
  try {
    const paypalModule = await import("paypal-rest-sdk");
    paypal = paypalModule.default;

    paypal.configure({
      mode: process.env.PAYPAL_MODE || "sandbox",
      client_id: process.env.PAYPAL_CLIENT_ID,
      client_secret: process.env.PAYPAL_CLIENT_SECRET,
    });

    console.log("Paypal configured, online payment is ON");
  } catch (error) {
    console.log("paypal-rest-sdk is not installed, online payment is OFF");
  }
} else {
  console.log("Paypal keys not found in .env, online payment is OFF");
}

export default paypal;
