import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getFirestore, collection, getDocs, orderBy, query } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";

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

      li.appendChild(editButton);
      li.appendChild(deleteButton);

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
