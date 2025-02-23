document.addEventListener("DOMContentLoaded", function () {
  fetchQuestions(); // Call the function after DOM is fully loaded

  const questionForm = document.getElementById("questionForm");
  const submitButton = document.getElementById("submit");

  async function fetchQuestions() {
    const token = localStorage.getItem("authToken");
    const currentUserId = localStorage.getItem("currentUserId");

    
    try {
      const response = await fetch("http://localhost:5001/questions");
      const questions = await response.json();
      const myQuestionsContainer = document.getElementById(
        "myQuestionsContainer"
      );

      const allQuestionsContainer = document.getElementById(
        "allQuestionsContainer"
      );
      myQuestionsContainer.innerHTML = "";
      allQuestionsContainer.innerHTML = "";

      if (questions.length === 0) {
        allQuestionsContainer.innerHTML = "<p>No questions submitted yet.</p>";
      } else {
        const isDashboard =
          window.location.pathname.includes("/dashboard.html");
        console.log(window.location.pathname); // Debug: Check if path includes 'dashboard.html'

        questions.forEach((question) => {
          const questionElement = document.createElement("div");
          questionElement.classList.add("question");
          questionElement.id = `question-${question.id}`; // Add the id to the main parent div
          question.replies = question.replies || []; // Ensure 'replies' is an empty array if undefined
          const isOwnQuestion = question.userId === currentUserId; // Check if the question belongs to the current user

          questionElement.innerHTML = `
          <div class="container">
  <p class="question-text"><strong>${question.question}</strong></p>
  ${
    isOwnQuestion || isDashboard
      ? `
   <button onclick="deleteQuestion(${question.id})"> Delete</button> 
        <button class="edit-button" onclick="editQuestion(${question.id})">edit</button> 
 `
      : ""
  }
              <div class="replies" id="replies-${question.id}">
                ${question.replies
                  .map((reply) => {
                    return `
                      <div class="reply" id="reply-${question.id}-${reply.id}">
                        <p class="reply-text">${reply.text}</p>
                        ${
                          isOwnQuestion || isDashboard
                            ? `
                          <button onclick="deleteReply(${reply.id}, ${question.id})">Delete</button>
                        `
                            : ""
                        }
                      </div>
                    `;
                  })
                  .join("")}
              </div>
               ${
                 isOwnQuestion || isDashboard
                   ? `
    <input type="text" id="newReplyInput-${question.id}" placeholder="Your reply" />
          <button onclick="submitReply(${question.id})">Submit Reply</button>
         `
                   : ""
               }
          <div>
        `;
          if (isOwnQuestion) {
            myQuestionsContainer.appendChild(questionElement);
            allQuestionsContainer.appendChild(questionElement);
          } else {
            allQuestionsContainer.appendChild(questionElement);
          }
        });
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  }

  // Listen for form submission to add a new question
  if (questionForm && submitButton) {
    questionForm.addEventListener("submit", async (event) => {
      event.preventDefault(); // Prevent the default form submission

      const question = document.getElementById("question").value;

      if (!question) {
        alert("Please enter a question.");
        return;
      }

      console.log("Submitting question:", question);

      try {
        const response = await fetch("http://localhost:5001/submit-question", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ question }),
        });

        const data = await response.json();
        console.log("Server response:", data);

        if (response.ok) {
          alert("Question submitted successfully!");
          fetchQuestions(); // Reload questions after submission
        } else {
          alert(`Failed to submit: ${data.message || "Unknown error"}`);
        }
      } catch (error) {
        console.error("Error submitting question:", error);
        alert("There was an error submitting your question.");
      }
    });
  } else {
    console.error("Form or submit button not found.");
  }

  window.editQuestion = function (questionId) {
    const questionElement = document.getElementById(`question-${questionId}`);
    if (!questionElement) {
      console.error("Question element not found!");
      return;
    }

    const questionText = questionElement.querySelector(".question-text");
    if (!questionText) {
      console.error("Question text element not found!");
      return;
    }

    // Replace the question text with an input field pre-filled with the current question
    const inputField = document.createElement("input");
    inputField.type = "text";
    inputField.id = `editInput-${questionId}`;
    inputField.value = questionText.textContent.trim(); // Set the current question as the input value

    // Replace the question text with the input field
    questionText.replaceChild(inputField, questionText.firstChild);

    // Find and hide the "Edit" button
    const editButton = questionElement.querySelector(".edit-button");
    if (editButton) {
      editButton.style.display = "none"; // Hide the "Edit" button
    } else {
      console.error("Edit button not found!");
    }

    // Remove any existing "Save" button (if any)
    const existingSaveButton = questionElement.querySelector(".save-button");
    if (existingSaveButton) {
      existingSaveButton.remove(); // Remove the "Save" button if it exists
    }

    // Create the "Save" button
    const saveButton = document.createElement("button");
    saveButton.textContent = "Save";
    saveButton.classList.add("save-button"); // Add a class to identify the button
    saveButton.onclick = function () {
      saveEditedQuestion(questionId, inputField.value, questionElement);
    };

    // Insert the "Save" button in place of the "Edit" button (after it)
    questionElement.appendChild(saveButton); // Insert Save button after the Edit button
  };

  window.saveEditedQuestion = function (questionId, newText, questionElement) {
    console.log(`Attempting to save edited question with ID: ${questionId}`);

    fetch(`http://localhost:5001/edit-question/${questionId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question: newText }),
    })
      .then((response) => {
        console.log("Response received:", response); // Log the response for better debugging
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json(); // Return the JSON if the response is okay
      })
      .then((data) => {
        console.log("Data received from backend:", data); // Log the response data for debugging

        if (data.success) {
          // Check if the elements exist before trying to modify them
          const questionTextElement =
            questionElement.querySelector(".question-text");
          if (questionTextElement) {
            questionTextElement.textContent = newText; // Update the question text
          } else {
            console.error("questionTextElement not found.");
          }
          const editButton = questionElement.querySelector(".edit-button");
          if (editButton) {
            editButton.style.display = "inline-block"; // Show the "Edit" button
            editButton.textContent = "Edit";
            editButton.onclick = function () {
              editQuestion(questionId);
            };
          } else {
            console.error("editButton not found.");
          }
          const saveButton = questionElement.querySelector(".save-button");
          if (saveButton) {
            saveButton.remove(); // Remove the "Save" button
          } else {
            console.error("Save button not found.");
          }
        } else {
          alert("Failed to save the edited question.");
        }
      })
      .catch((error) => {
        console.error("Error saving edited question:", error); // Log the error message
        alert("Error saving the edited question: " + error.message); // Show a user-friendly alert with the error message
      });
  };

  // Assuming currentUserId and question.id are accessible
  window.deleteReply = async function (replyId, questionId) {
    try {
      const response = await fetch("http://localhost:5001/delete-reply", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ questionId, replyId }),
      });

      const data = await response.json();
      if (data.message === "Reply deleted successfully") {
        // Find the reply element and remove it from the DOM
        const replyElement = document.getElementById(`reply-${replyId}`);
        if (replyElement) {
          replyElement.remove(); // Remove the reply from the UI
        }
      } else {
        alert(data.message);
      }
      fetchQuestions();
    } catch (error) {
      console.error("Error deleting reply:", error);
      alert("An error occurred while deleting the reply.");
    }
  };

  // Function to handle deleting a question
  window.deleteQuestion = async function (questionId) {
    try {
      console.log("deleteQuestion function called with ID:", questionId);

      const response = await fetch(
        `http://localhost:5001/delete-question/${questionId}`,
        {
          method: "DELETE",
        }
      );
      //const data = await response.json();

      if (response.ok) {
        //alert(data.message); // Show success message
        // Optionally, remove the question from the DOM immediately
        const questionElement = document.getElementById(
          `question-${questionId}`
        );
        if (questionElement) {
          questionElement.remove(); // Remove the deleted question from the page
        }
        // } else {
        // alert(data.message || "Failed to delete the question.");
      }
    } catch (error) {
      console.error("Error deleting question:", error);
      alert("Failed to delete  question.");
    }
  };

  // Function to submit an answer to a question (make sure this is globally accessible)
  window.submitReply = async function (questionId) {
    console.log("submitReply function called with questionId:", questionId);
    const replyInput = document.getElementById(`newReplyInput-${questionId}`);
    if (!replyInput) {
      console.error(
        `Input field for reply not found for question ${questionId}`
      );
      return;
    }
    const reply = replyInput.value.trim();
    if (!reply) {
      alert("Please provide a reply.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5001/submit-reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: questionId, // Send the question ID
          reply: reply, // Send the answer provided by the user
        }),
      });

      const data = await response.json();
      console.log("Server Response:", data); // Log the response to see more details

      alert(data.message);

      if (response.ok) {
        // Append the new reply to the replies container without removing old ones
        const repliesContainer = document.getElementById(
          `replies-${questionId}`
        );

        const newReplyElement = document.createElement("p");
        newReplyElement.classList.add(`newReply-${questionId}`); // You can assign a dynamic class or ID
        newReplyElement.textContent = reply;
        repliesContainer.appendChild(newReplyElement);

        // Clear the input field after the reply is submitted
        replyInput.value = "";
        fetchQuestions(); // Reload questions (optional, you could also add just the new reply)
      } else {
        alert("Failed to submit the reply."); // Show failure message if response is not ok
      }
    } catch (error) {
      console.error("Error submitting reply:", error);
      alert("Failed to submit the reply.");
    }
  };

  // Function to submit the email for notifications
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

  // Load questions on page load
  window.onload = fetchQuestions;
});
