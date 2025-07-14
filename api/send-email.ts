import nodemailer from "nodemailer";
import fetch from "node-fetch";
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

    // Configure nodemailer transport with fallback to hardcoded values
    const smtpUser = process.env.SMTP_USER || "mark.lindt.crm@gmail.com";
    const smtpPass = process.env.SMTP_PASS || "efnk zbyn soda uotw";
    const smtpTo = process.env.SMTP_TO || "mark.lindt.crm@gmail.com";

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: smtpUser,
        pass: smtpPass,
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

    // Prepare email attachments and content
    const attachments = [];
    let imageHtml = image ? `<p>Image: <a href="${image}">${image}</a></p>` : "<p>Image: No image</p>";

    // Fetch and attach image if provided
    if (image) {
      try {
        const imageResponse = await fetch(image);
        if (!imageResponse.ok) {
          throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
        }
        const imageBuffer = await imageResponse.buffer();
        const imageContentType = imageResponse.headers.get("content-type") || "image/jpeg";

        attachments.push({
          filename: "product-image.jpg",
          content: imageBuffer,
          cid: "product@image", // Unique Content-ID for embedding
        });

        imageHtml = `<p><img src="cid:product@image" alt="Product Image" style="max-width: 100%; height: auto;" /></p>`;
      } catch (fetchError: any) {
        console.error("Failed to fetch image:", fetchError.message);
        imageHtml = `<p>Image: <a href="${image}">${image}</a> (Failed to embed)</p>`;
      }
    }

    // Prepare email content
    const mailOptions = {
      from: `"Callback" <${smtpUser}>`,
      to: smtpTo,
      subject: `Order: ${name}`,
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
      html: `
        <h2>Order Details</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Product(s):</strong> ${
          Array.isArray(productName) ? productName.join(", ") : productName
        }</p>
        <p><strong>Price(s):</strong> ${
          Array.isArray(price) ? price.join(", ") : price
        }</p>
        <p><strong>Time:</strong> ${time}</p>
        <p><strong>Description:</strong> ${description || "No description"}</p>
        ${imageHtml}
      `,
      attachments,
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