import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBmS3PF33c4BHzgjKuM0LUSu_wpIFQSNvk",
  authDomain: "peer-tutor-a1076.firebaseapp.com",
  projectId: "peer-tutor-a1076",
  storageBucket: "peer-tutor-a1076.firebasestorage.app",
  messagingSenderId: "677806357185",
  appId: "1:677806357185:web:a8a6d253fd16ad8d517240"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);  // Firebase Auth instance
const db = getFirestore(app);  // Firestore instance

// Function to show messages to the user
function showMessage(message, divId) {
  var messageDiv = document.getElementById(divId);
  messageDiv.style.display = "block";
  messageDiv.innerHTML = message;
  messageDiv.style.opacity = 1;
  setTimeout(function () {
    messageDiv.style.opacity = 0;
  }, 5000);
}

// Handle the email form submission
const submitEmail = document.getElementById('submitEmail');
submitEmail.addEventListener('click', (event) => {
  event.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value; // Make sure the password field exists

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      const userData = {
        email: email,
      };

      // Save user data to Firestore
      const docRef = doc(db, "users", user.uid);
      setDoc(docRef, userData)
        .then(() => {
          showMessage('Account Created Successfully', 'signUpMessage');
          // Redirect or take any other action after success
          // window.location.href = "home.html";  // Uncomment for redirection
        })
        .catch((error) => {
          console.error("Error writing document: ", error);
        });
    })
    .catch((error) => {
      const errorCode = error.code;
      if (errorCode === 'auth/email-already-in-use') {
        showMessage('Email Address Already Exists !!!', 'signUpMessage');
      } else {
        showMessage('Unable to create User', 'signUpMessage');
      }
    });
});
