import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getFirestore, collection, getDocs, orderBy, query } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";
import { addDoc } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";
import { deleteDoc, doc } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBmS3PF33c4BHzgjKuM0LUSu_wpIFQSNvk",
  authDomain: "peer-tutor-a1076.firebaseapp.com",
  projectId: "peer-tutor-a1076",
  storageBucket: "peer-tutor-a1076.firebasestorage.app",
  messagingSenderId: "677806357185",
  appId: "1:677806357185:web:c74d94070bf86997517240"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app); // Firestore instance
const auth = getAuth(); // Auth instance


// Function to load and display all submitted questions on the Tutor Dashboard
async function loadQuestions() {
  const questionsList = document.getElementById("questionsList");
  questionsList.innerHTML = ''; // Clear existing list

  try {
    // Fetch all questions from Firestore
    const q = query(collection(db, "questions"), orderBy("timestamp", "desc"));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
      const question = doc.data().question;
      const userId = doc.data().userId;
      const questionId = doc.id; // Get document ID (question ID)

      // Create the list item to display the question
      const li = document.createElement("li");
      li.textContent = question;

      // Add edit/delete buttons if needed
      const editButton = document.createElement("button");
      editButton.textContent = "Edit";
      editButton.onclick = function() {
        editQuestion(questionId);
      };
      
      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete";
      deleteButton.onclick = function() {
        deleteQuestion(questionId);
      };

      const repliesList = document.createElement("div");
      repliesList.id = `repliesList-${questionId}`;
            li.appendChild(repliesList);


      const replyButton = document.createElement("button");
      replyButton.textContent = "Reply";
      replyButton.onclick = function() {
        // You can toggle visibility of a reply form here or open a modal
       if (!document.getElementById(`replyForm-${questionId}`)) {
          const replyForm = document.createElement("form");
          replyForm.id = `replyForm-${questionId}`;
          replyForm.innerHTML = `
            <input type="text" id="replyText-${questionId}" placeholder="Write your reply" />
            <button type="submit">Submit Reply</button>
          `;
        
        // Add event listener to the reply form
        replyForm.addEventListener('submit', async (event) => {
          event.preventDefault();

          const replyText = document.getElementById(`replyText-${questionId}`).value.trim(); // Get the reply text

          if (!replyText) {
            showMessage("Please provide a valid reply and question ID.", "replyMessage");
            return;
          }

          try {
            const user = auth.currentUser;
            if (!user) {
              showMessage("You need to be logged in to reply.", "replyMessage");
              return;
            }

            // Add the reply to the subcollection of the specific question
            const replyRef = await addDoc(
              collection(db, "questions", questionId, "replies"), // Using subcollection "replies"
              {
                replyText: replyText,
                userId: user.uid, // Associate the reply with the logged-in user
                timestamp: new Date()
              }
            );

            showMessage("Reply submitted successfully!", "replyMessage");
            document.getElementById(`replyText-${questionId}`).value = ''; // Clear the input field

            loadReplies(questionId); // Reload replies
          } catch (e) {
            console.error("Error adding reply: ", e);
            showMessage('Error submitting reply.', 'replyMessage');
          }
        });

        // Append the reply form to the question list item (li)
      
      li.appendChild(replyForm);
       }
      };
  li.appendChild(editButton);
      li.appendChild(deleteButton);
      li.appendChild(replyButton); // Append the Reply button
      li.appendChild(repliesList); // Append the replies list container
      // Append the question to the list
      questionsList.appendChild(li);

      loadReplies(questionId);


    });
  } catch (error) {
    console.error("Error fetching questions: ", error);
    showMessage('Error fetching questions.', 'questionMessage');
  }
}

// Function to edit the question (e.g., for the tutor)
function editQuestion(questionId) {
  // You can implement the edit functionality here
  alert(`Editing question with ID: ${questionId}`);
}

// Function to delete the question
async function deleteQuestion(questionId) {
  try {
    await deleteDoc(doc(db, "questions", questionId));
    showMessage('Question deleted successfully.', 'questionMessage');
    loadQuestions(); // Reload questions after deletion
  } catch (error) {
    console.error("Error deleting question: ", error);
    showMessage('Error deleting question.', 'questionMessage');
  }
}

// Function to load replies for a specific question
function loadReplies(questionId) {
  const repliesList = document.getElementById(`repliesList-${questionId}`);

  if (!repliesList) {
    console.error("Replies list element not found.");
    return;
  }

  repliesList.innerHTML = ''; // Clear existing replies
  // Fetch all replies from Firestore (subcollection of the question document)
  const repliesRef = collection(db, "questions", questionId, "replies");
  getDocs(repliesRef)
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const reply = doc.data().replyText;
        const li = document.createElement("li");
        li.textContent = reply;
        repliesList.appendChild(li);
      });
    })
    .catch((error) => {
      console.error("Error fetching replies: ", error);
    });
}

function showMessage(message, divId) {
  const messageDiv = document.getElementById(divId);

  // Check if the messageDiv exists before modifying its properties
  if (messageDiv) {
    messageDiv.style.display = "block";
    messageDiv.innerHTML = message;
    messageDiv.style.opacity = 1;

    setTimeout(function () {
      messageDiv.style.opacity = 0;
    }, 5000);
  } else {
    console.error(`Element with ID ${divId} not found. Unable to display message.`);
  }
}


// Call the function to load questions when the page loads
loadQuestions();
