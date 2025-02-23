const saveEmail = async (email) => {
  const response = await fetch("/.netlify/functions/save-email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }), // Sending email in request body
  });

  if (response.ok) {
    const result = await response.json();
    console.log(result.message); // "Email saved successfully!"
  } else {
    const error = await response.json();
    console.error("Error saving email:", error.message);
  }
};

// Example usage
const email = "example@domain.com"; // This would be dynamically gathered from your form
saveEmail(email);
