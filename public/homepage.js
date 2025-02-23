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

// Get the form and input elements
const questionForm = document.getElementById('questionForm');
const questionInput = document.getElementById('question');
const submitButton = document.getElementById('submit');

// Add event listener to handle form submission
questionForm.addEventListener('submit', async (event) => {
  event.preventDefault(); // Prevent the default form submission

  const question = questionInput.value.trim(); // Get the value of the question input

  if (!question) {
    alert('Please enter a question!');
    return;
  }

  try {
    // Send the question data to the Netlify function
    const response = await fetch('https://tutor-site.netlify.app/.netlify/functions/submit-question', {
      method: 'POST', // Ensure the HTTP method is POST
      headers: {
        'Content-Type': 'application/json', // Set the content type as JSON
      },
      body: JSON.stringify({ question }), // Send the question in the body of the request
    });

    // Handle response
    if (response.ok) {
      const result = await response.json();
      console.log('Question submitted successfully:', result.message);
      alert('Your question has been submitted successfully!');
    } else {
      const error = await response.json();
      console.error('Error submitting question:', error.message);
      alert('There was an error submitting your question.');
    }
  } catch (error) {
    console.error('Error submitting question:', error);
    alert('There was an error with the network. Please try again later.');
  }
});

