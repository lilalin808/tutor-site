import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import {getAuth, onAuthStateChanged, signOut} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import{getFirestore, getDoc, doc} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js"

const firebaseConfig = {
  apiKey: "AIzaSyBmS3PF33c4BHzgjKuM0LUSu_wpIFQSNvk",
    authDomain: "peer-tutor-a1076.firebaseapp.com",
    projectId: "peer-tutor-a1076",
    storageBucket: "peer-tutor-a1076.firebasestorage.app",
    messagingSenderId: "677806357185",
    appId: "1:677806357185:web:be5149be7ba68343517240"
  };
 
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);

  const auth=getAuth();
  const db=getFirestore();

  onAuthStateChanged(auth, (user)=>{
    const loggedInUserId=localStorage.getItem('loggedInUserId');
    if(loggedInUserId){
        console.log(user);
        const docRef = doc(db, "users", loggedInUserId);
        getDoc(docRef)
        .then((docSnap)=>{
            if(docSnap.exists()){
                const userData=docSnap.data();
                document.getElementById('loggedUserEmail').innerText=userData.email;

            }
            else{
                console.log("no document found matching id")
            }
        })
        .catch((error)=>{
            console.log("Error getting document");
        })
    }
    else{
        console.log("User Id not Found in Local storage")
    }
  })

  const logoutButton=document.getElementById('logout');

  logoutButton.addEventListener('click',()=>{
    localStorage.removeItem('loggedInUserId');
    signOut(auth)
    .then(()=>{
        window.location.href='index.html';
    })
    .catch((error)=>{
        console.error('Error Signing out:', error);
    })
  })


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
        const response = await fetch("https://lilalin808.github.io/.netlify/functions/submit-question", {
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

  
  // Load questions on page load
  window.onload = fetchQuestions;
});
