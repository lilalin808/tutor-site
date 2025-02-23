window.submitEmail = async function () {
    const email = document.getElementById("email").value;

    if (!email || !validateEmail(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    // Send the email to the backend
    fetch("http://localhost:5001/save-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert("Email saved successfully! You will receive notifications.");
        } else {
          alert("Failed to save the email.");
        }
      })
      .catch((error) => {
        console.error("Error submitting email:", error);
        alert("An error occurred while submitting your email.");
      });
  };

  // Simple email validation function
  function validateEmail(email) {
    const re = /^[a-zA-Z0-9._-]+@[a-zAZ0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  }

  async function sendNotificationEmail(question) {
    // Iterate over the list of users who want to receive notifications
    usersForNotifications.forEach((email) => {
      const mailOptions = {
        from: "no-reply@yourdomain.com", // Your email address
        to: email, // Send to each user's email
        subject: "New Homework Question Submitted",
        text: `A new homework question has been submitted:\n\n${question}`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending email:", error);
        } else {
          console.log("Email sent: " + info.response);
        }
      });
    });
  }
