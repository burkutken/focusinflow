const firebaseConfig = {
  apiKey: "AIzaSyBHTlrAetOq7ECMZLrwsu9nb7SlKglEvoo",
  authDomain: "focuspocus-adhd.firebaseapp.com",
  projectId: "focuspocus-adhd",
  appId: "1:131592796704:web:4ccb45a0e2a3fb0bafda45"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

function login() {
  const email = document.getElementById("signin-email").value.trim();
  const password = document.getElementById("signin-password").value;

  if (!email || !password) {
    alert("Please enter both email and password.");
    return;
  }

  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      window.location.href = "index.html";
    })
    .catch((error) => {
      alert(error.message);
    });
}

function signup() {
  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value;

  if (!email || !password) {
    alert("Please enter both email and password.");
    return;
  }

  auth.createUserWithEmailAndPassword(email, password)
    .then(() => {
      alert("Sign-up successful! Redirecting to login...");
      window.location.href = "signin.html";
    })
    .catch((error) => {
      alert(error.message);
    });
}
