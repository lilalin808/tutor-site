// functions/save-email.js

let usersForNotifications = []; // Store email addresses for notifications (in-memory)

exports.handler = async function (event, context) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: "Method Not Allowed" }),
    };
  }

  try {
    const { email } = JSON.parse(event.body); // Get the email from the request body

    // Validate email
    if (!email || !validateEmail(email)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Invalid email address." }),
      };
    }

    // Save the email in the array
    usersForNotifications.push(email);

    // Return a success response
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: "Email saved successfully!",
      }),
    };
  } catch (error) {
    console.error("Error saving email:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error saving email.", error: error.message }),
    };
  }
};

// Helper function to validate the email format
function validateEmail(email) {
  const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return re.test(email);
}
