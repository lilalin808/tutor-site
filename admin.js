import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";
import { getFirestore, setDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";


  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyBmS3PF33c4BHzgjKuM0LUSu_wpIFQSNvk",
    authDomain: "peer-tutor-a1076.firebaseapp.com",
    projectId: "peer-tutor-a1076",
    storageBucket: "peer-tutor-a1076.firebasestorage.app",
    messagingSenderId: "677806357185",
    appId: "1:677806357185:web:fbf30db23a4cc7da517240"
  };


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore(app);

// Check if the logged-in user is an admin
onAuthStateChanged(auth, (user) => {
  if (user) {
    // Check if the current user is an admin (you can hardcode the admin email or use Firestore)
    checkIfAdmin(user.email);
  } else {
    window.location.href = 'login.html';  // Redirect to login if not authenticated
  }
});

// Function to check if the user is an admin
function checkIfAdmin(email) {
  const adminEmail = "admin@example.com";  // Replace this with your admin email
  if (email !== adminEmail) {
    alert("You are not an admin.");
    window.location.href = "index.html";  // Redirect if the user is not an admin
  }
}

// Handle role assignment form submission
const assignRoleForm = document.getElementById('assignRoleForm');
assignRoleForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  
  const email = document.getElementById('email').value.trim();
  const role = document.getElementById('role').value;

  if (!email) {
    showMessage("Please enter an email.", "adminMessage");
    return;
  }

  try {
    const userDocRef = doc(db, "users", email);  // Assuming emails are used as document IDs
    const userSnapshot = await getDoc(userDocRef);

    if (userSnapshot.exists()) {
      // User exists, assign the role
      await setDoc(doc(db, "userRoles", email), { role });

      showMessage(`Role of ${role} assigned to ${email} successfully.`, "adminMessage");
    } else {
      showMessage(`No user found with email: ${email}`, "adminMessage");
    }
  } catch (error) {
    console.error("Error assigning role: ", error);
    showMessage("Error assigning role. Please try again.", "adminMessage");
  }
});

// Function to display messages to the admin
function showMessage(message, divId) {
  const messageDiv = document.getElementById(divId);
  messageDiv.style.display = "block";
  messageDiv.innerHTML = message;
  messageDiv.style.opacity = 1;
  setTimeout(() => {
    messageDiv.style.opacity = 0;
  }, 5000);
}
