import nodemailer from "nodemailer";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  console.log("Incoming request:", req.method, "Body:", req.body);

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Validate payload
    const { name, phone, productName, price, time, description, image } =
      req.body;

    if (!name || !phone || !productName || !price || !time) {
      console.error("Missing required fields:", {
        name,
        phone,
        productName,
        price,
        time,
      });
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Configure nodemailer transport
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER || "mark.lindt.crm@gmail.com",
        pass: process.env.SMTP_PASS || "efnk zbyn soda uotw",
      },
    });

    // Verify SMTP connection
    try {
      await transporter.verify();
      console.log("SMTP transporter verified successfully");
    } catch (verifyError: any) {
      console.error("SMTP verification failed:", verifyError.message);
      return res.status(500).json({
        message: "Failed to verify SMTP transporter",
        error: verifyError.message,
      });
    }

    // Prepare email content
    const mailOptions = {
      from: `"Callback" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_TO || process.env.SMTP_USER,
      subject: `New request: ${
        Array.isArray(productName) ? productName.join(", ") : productName
      }`,
      text: `
        Name: ${name}
        Phone: ${phone}
        Product(s): ${
          Array.isArray(productName) ? productName.join(", ") : productName
        }
        Price(s): ${Array.isArray(price) ? price.join(", ") : price}
        Time: ${time}
        Description: ${description || "No description"}
        Image: ${image || "No image"}
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");

    return res.status(200).json({ message: "Email sent successfully" });
  } catch (err: any) {
    console.error("Send email error:", err.message, err.stack);
    return res.status(500).json({
      message: "Failed to send email",
      error: err.message || "Internal server error",
    });
  }
}