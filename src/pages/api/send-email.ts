import nodemailer from "nodemailer";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  console.log("Incoming request:", req.method);

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { name, phone, productName, price, time, description, image } = req.body;

    if (!name || !phone || !productName || !price || !time) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: "videosoundevent@gmail.com",
        pass: "auax ldqj nyts yeqw",
      },
    });

    await transporter.verify();
    console.log("Transporter configured successfully");

    const mailOptions = {
      from: `"Callback" <videosoundevent@gmail.com>`,
      to: "videosoundevent@gmail.com",
      subject: `New request: ${Array.isArray(productName) ? productName.join(", ") : productName}`,
      text: `
        Name: ${name}
        Phone: ${phone}
        Product(s): ${Array.isArray(productName) ? productName.join(", ") : productName}
        Price(s): ${Array.isArray(price) ? price.join(", ") : price}
        Time: ${time}
        Description: ${description || "No description"}
        Image: ${image || "No image"}
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");

    return res.status(200).json({ message: "Email sent successfully" });
  } catch (err: any) {
    console.error("Send error:", err.message);
    return res
      .status(500)
      .json({ message: "Failed to send email", error: err.message });
  }
}