const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const port = 5001;

// Middleware to parse incoming JSON data
app.use(bodyParser.json());
app.use(cors()); // Enable CORS to allow frontend to make requests

// In-memory array to store questions (for demonstration purposes)
let questions = [];

const transporter = nodemailer.createTransport({
  service: "gmail", // or use your email service
  auth: {
    user: "lilahlin@gmail.com", // Use environment variables
    pass: "dvrt sgxy fqpu joyi",
  },
});

// Root route
app.get("/", (req, res) => {
  res.send("Welcome to the Homework Question Submission API!");
});

// Endpoint for submitting questions
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

app.get("/questions", (req, res) => {
  res.status(200).send(questions);
});

// Endpoint for submitting answers
app.post(`/submit-reply`, (req, res) => {
  const { id, reply } = req.body;
  console.log("Received reply:", { id, reply });

  // Validate that reply is a non-empty string
  if (!reply || reply.trim() === "") {
    return res.status(400).send({ message: "No reply provided" });
  }

  // Validate that a user ID is provided

  // Find the question by its ID
  const question = questions.find((q) => q.id === id);

  // If the question is not found, return an error
  if (!question) {
    return res.status(404).send({ message: "Question not found" });
  }

  // Ensure that the 'replies' array exists (in case the question doesn't already have replies)
  if (!question.replies) {
    question.replies = []; // Initialize replies array if it doesn't exist
  }
  // Add the reply with a timestamp
  question.replies.push({
    text: reply,
    id: Date.now(), // Generate a unique ID for each reply
  });

  res.status(200).send({ message: "Reply submitted successfully!" });
});

app.put(`/edit-reply/:id`, (req, res) => {
  try {
    const { id } = req.params;
    const { reply, questionId } = req.body;

    console.log("Received ID:", id);
    console.log("Received reply:", reply);
    console.log("Received questionId:", questionId);

    const question = questions.find((q) => q.id === questionId);
    if (!question)
      return res.status(404).send({ message: "Question not found" });

    const replyIndex = question.replies.findIndex((r) => r.id === id);
    if (replyIndex === -1)
      return res.status(404).send({ message: "Reply not found" });

    // Update the reply text
    question.replies[replyIndex].reply = reply;

    res
      .status(200)
      .send({ success: true, message: "Reply updated successfully" });
  } catch (error) {
    console.error("Error updating reply:", error);
    res
      .status(500)
      .send({ message: "An error occurred while updating the reply" });
  }
});
// Assuming each question has an array of replies
app.delete("/delete-reply", (req, res) => {
  const { questionId, replyId, userId } = req.body;

  const question = questions.find((q) => q.id === questionId);
  if (!question) {
    return res.status(404).json({ message: "Question not found" });
  }

  const replyIndex = question.replies.findIndex(
    (reply) => reply.id === replyId
  );
  if (replyIndex === -1) {
    return res.status(404).json({ message: "Reply not found" });
  }

  // Ensure the current user can only delete their own replies
  if (question.replies[replyIndex].userId !== userId) {
    return res
      .status(403)
      .json({ message: "Unauthorized to delete this reply" });
  }

  // Remove the reply
  question.replies.splice(replyIndex, 1);
  return res.status(200).json({ message: "Reply deleted successfully" });
});

app.delete(`/delete-question/:questionId`, (req, res) => {
  try {
    console.log("Received request to /delete-question");
    const id = parseInt(req.params.questionId);
    console.log("Received question ID:", id);

    // Check if the ID is valid
    if (isNaN(id)) {
      return res.status(400).send({ message: "Invalid question ID" });
    }

    // Check if the questions array exists
    if (!Array.isArray(questions)) {
      throw new Error("Questions is not an array");
    }

    const initialLength = questions.length;

    // Instead of reassigning questions, we directly modify it
    questions = questions.filter((item) => item.id !== id); // Remove the question with the matching ID

    // Check if the question was found and deleted
    if (questions.length < initialLength) {
      res.status(200).send({ message: `Item with ID ${id} deleted.` });
    } else {
      res.status(404).send({ message: `Item with ID ${id} not found.` });
    }
  } catch (error) {
    console.error("Error in delete operation:", error); // Log the error
    res
      .status(500)
      .send({ message: "Internal server error", error: error.message });
  }
});

// Endpoint to edit a question
app.put("/edit-question/:questionId", (req, res) => {
  const { questionId } = req.params;
  const { question } = req.body;

  // Find the question by its ID
  const existingQuestion = questions.find((q) => q.id === parseInt(questionId));
  if (!existingQuestion) {
    return res
      .status(404)
      .send({ success: false, message: "Question not found" });
  }

  // Update the question text
  existingQuestion.question = question;

  // Return success response
  res
    .status(200)
    .send({ success: true, message: "Question updated successfully" });
});

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

let users = [];
// Signup route
app.post("/signup", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res
      .status(400)
      .json({ success: false, message: "Email  are required" });
  }

  // Check if the user already exists
  const existingUser = users.find((user) => user.email === email);
  if (existingUser) {
    return res
      .status(400)
      .json({ success: false, message: "User already exists" });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create new user object
  const newUser = {
    id: users.length + 1, // Simple increment ID for new users (in production, use a unique ID from the database)
    email,
    password: hashedPassword,
  };

  // Add new user to the users array
  users.push(newUser);

  // Generate JWT token
  const token = jwt.sign({ userId: newUser.id }, "your-secret-key", {
    expiresIn: "1h",
  });

  res.status(201).json({ success: true, userId: newUser.id, token });
});

// Route to handle user sign-up

// Route to handle login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Email and password are required" });
  }

  // Find user by email
  const user = users.find((user) => user.email === email);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  // Compare password with hashed password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid credentials" });
  }

  // Generate JWT token (optional for extra security)
  const token = jwt.sign({ userId: user.id }, "your-secret-key", {
    expiresIn: "1h",
  });

  res.status(200).json({ success: true, userId: user.id, token });
});

// Start the server
app.listen(5001, () => {
  console.log(`Server is running on http://localhost:5001`);
});
