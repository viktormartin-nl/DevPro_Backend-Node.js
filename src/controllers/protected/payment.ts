import { Request, Response } from "express";
import Stripe from "stripe";
const stripe = new Stripe("sk_test_4eC39HqLyjWDarjtT1zdp7dc");


import express from 'express'

import cors from 'cors'


const app = express()

// middleware
app.use(express.json())
app.use(cors())

export const addPayment = async (req: Request, res: Response) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: 1000,
            product_data: {
              name: "test",
            },
          },
        },
      ],
      customer_email: "test@gmail.com",

      success_url: "http://127.0.0.1:5500/test.html", //redirect url for frontend when success
      cancel_url: "http://127.0.0.1:5500/test.html", //redirect url for frontend when cancel
    });
    
    res.redirect(303, session.url as string);
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong");
  }
};
