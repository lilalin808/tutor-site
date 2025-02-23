app.post("/submit-question", async (req, res) => {
  try {
    console.log("Received request to /submit-question");

    const { question } = req.body;
    console.log("Received question:", question);

    if (!question || question.trim() === "") {
      console.log("No question provided or question is empty");
      return res.status(400).send({ message: "No question provided" });
    }

    // Add question to the in-memory array (for demo purposes)
    const newQuestion = {
      id: Date.now(),
      question,
    };
    questions.push(newQuestion);

    // Send email to each user in the array
    for (let email of usersForNotifications) {
      const mailOptions = {
        from: "no-reply@yourdomain.com", // Your email address
        to: email, // Send to each user's email
        subject: "New Homework Question Submitted",
        text: `A new homework question has been submitted:\n\n${question}`,
      };

      console.log("Sending email to", email);
      const info = await transporter.sendMail(mailOptions);
      console.log("Email sent successfully to", email, ":", info.response);
    }

    res.status(200).send({ message: "Question submitted successfully!" });
  } catch (error) {
    console.error("Error during request processing:", error);
    res
      .status(500)
      .send({ message: "Failed to send email", error: error.message });
  }
});
