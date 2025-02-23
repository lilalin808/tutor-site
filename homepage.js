// Initialize Firebase before calling any Firebase services
 import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, orderBy, query } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";

 
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

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
// Firebase configuration

// Initialize Firebase
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

// Handle question submission
const questionForm = document.getElementById('questionForm');
questionForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  
  const questionText = document.getElementById('question').value.trim();

  // Make sure the question is not empty
  if (!questionText) {
    showMessage('Please enter a valid question.', 'questionMessage');
    return;
  }

  try {
    // Get current user (so we can associate the question with their user ID)
    const user = auth.currentUser;
    if (!user) {
      showMessage('You need to be logged in to submit a question.', 'questionMessage');
      return;
    }

    // Save question to Firestore
    const docRef = await addDoc(collection(db, "questions"), {
      question: questionText,
      userId: user.uid, // Associate the question with the logged-in user
      timestamp: new Date()
    });

    showMessage('Question submitted successfully!', 'questionMessage');
    document.getElementById('question').value = ''; // Clear the input field

    // Optionally, reload the list of questions (if you want to display them right away)
    loadQuestions();
  } catch (e) {
    console.error("Error adding document: ", e);
    showMessage('Error submitting question.', 'questionMessage');
  }
});

// Function to load and display all submitted questions
async function loadQuestions() {
  const questionsList = document.getElementById("questionsList");
  questionsList.innerHTML = ''; // Clear existing list

  try {
    // Fetch all questions from Firestore
    const q = query(collection(db, "questions"), orderBy("timestamp", "desc"));
    const querySnapshot = await getDocs(q);
    
    querySnapshot.forEach((doc) => {
      const question = doc.data().question;
      const li = document.createElement("li");
      li.textContent = question;
      questionsList.appendChild(li);
    });
  } catch (error) {
    console.error("Error fetching questions: ", error);
  }
}

// Load questions when the page loads
loadQuestions();
