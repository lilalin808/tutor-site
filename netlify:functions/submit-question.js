// functions/submit-question.js

const nodemailer = require("nodemailer");

exports.handler = async function (event, context) {
  // Check if the request is a POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: "Method Not Allowed" }),
    };
  }

  try {
    const { question } = JSON.parse(event.body);

    if (!question || question.trim() === "") {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "No question provided" }),
      };
    }

    // Set up email transporter using nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,  // Use environment variables
        pass: process.env.EMAIL_PASS,  // Use environment variables
      },
    });

    const usersForNotifications = ["user1@example.com", "user2@example.com"]; // Example, replace with actual list

    // Send email to each user in the list
    for (let email of usersForNotifications) {
      const mailOptions = {
        from: "no-reply@yourdomain.com", // Your email
        to: email,
        subject: "New Homework Question Submitted",
        text: `A new homework question has been submitted:\n\n${question}`,
      };

      await transporter.sendMail(mailOptions);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Question submitted successfully!" }),
    };
  } catch (error) {
    console.error("Error during request processing:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to send email", error: error.message }),
    };
  }
};

