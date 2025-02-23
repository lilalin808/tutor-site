let usersForNotifications = []; // Store email addresses for notifications

// Endpoint to save the email
app.post("/save-email", (req, res) => {
  try {
    const { email } = req.body; // Get the email from the request body
    if (!email) {
      return res.status(400).send({ message: "Invalid email address." });
    }

    // Save the email in your database or in-memory array (for simplicity, we're using an array here)
    usersForNotifications.push(email);

    // Send a success response
    res
      .status(200)
      .send({ success: true, message: "Email saved successfully!" });
  } catch (error) {
    console.error("Error saving email:", error);
    res.status(500).send({ message: "Error saving email." });
  }
});
