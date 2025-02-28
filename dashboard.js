import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getFirestore, collection, getDocs, orderBy, query } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";
import { addDoc } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

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

// Function to show messages to the user
function showMessage(message, divId) {
  const messageDiv = document.getElementById(divId);
  messageDiv.style.display = "block";
  messageDiv.innerHTML = message;
  messageDiv.style.opacity = 1;
  setTimeout(function () {
    messageDiv.style.opacity = 0;
  }, 5000);
}

// Function to handle replying to a question
const replyForm = document.getElementById('replyForm');
replyForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  
  const questionId = document.getElementById('questionId').value.trim();  // Get the question ID
  const replyText = document.getElementById('replyText').value.trim();  // Get the reply text
  
  if (!replyText || !questionId) {
    showMessage("Please provide a valid reply and question ID.", "replyMessage");
    return;
  }

  try {
    // Get current user (so we can associate the reply with their user ID)
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
        userId: user.uid,  // Associate the reply with the logged-in user
        timestamp: new Date()
      }
    );

    showMessage("Reply submitted successfully!", "replyMessage");
    document.getElementById('replyText').value = ''; // Clear the input field

    // Optionally, reload replies or questions (if you want to display them right away)
    loadReplies(questionId);
  } catch (e) {
    console.error("Error adding reply: ", e);
    showMessage('Error submitting reply.', 'replyMessage');
    repliesList.appendChild(li);  // Add each reply to the repliesList
questionElement.appendChild(repliesList);  // Add the replies list to the question element

  }
});

// Function to load replies for a specific question
function loadReplies(questionId) {
  const repliesList = document.getElementById("repliesList");
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

// Load replies for a question when the page loads (pass the questionId)
loadReplies("sampleQuestionId"); // Replace with actual question ID

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

      // Optionally, add the user ID or other information
      const questionDetails = document.createElement("div");
      questionDetails.textContent = `Posted by user ID: ${userId}`;
      li.appendChild(questionDetails);

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
      repliesList.id="repliesList";

      const replyForm = document.createElement("form");
      replyForm.id="replyForm";
  replyForm.innerHTML = `
  <input type="text" id="replyText" placeholder="Write your reply" />
  <input type="hidden" id="questionId" value="${questionId}" />
  <button type="submit">Submit Reply</button>
`;


      li.appendChild(editButton);
      li.appendChild(deleteButton);
      li.appendChild(repliesList);

      // Append the question to the list
      questionsList.appendChild(li);
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

// Call the function to load questions when the page loads
loadQuestions();
