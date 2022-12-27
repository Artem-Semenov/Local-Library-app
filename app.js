"use strict";
/* { id: 1, name: 'Joan Rowling', description: 'This book was written for readers', 
  photo: '', totalCount: 7, avalCount: 3},
  { id: 3, name: 'Joan Rowling', description: 'This book was written for readers', 
  photo: '', totalCount: 7, avalCount: 3} */
/* const request = window.indexedDB.open('libraryDB', 1)

request.onerror = function(e) {
  console.log('error with DB');
}

request.onupgradeneeded = function(e) {
  db = e.target.result
  const users = db.createObjectStore('users', {keyPath: 'ssn'})

  users.createIndex('name', 'name',{unique: false})

  users.createIndex('email', 'email', {unique: true})

  for (let i in customerData) {
    users.add(customerData[i])
  }
  
  const transaction = db.transaction('readwrite')



  transaction.oncomplete = function(event) {
    alert("All done!");
  };
  
  transaction.onerror = function(event) {
    // Don't forget to handle errors!
  };
  
  const objectStore = transaction.objectStore("users");
  for (var i in customerData) {
    var request = objectStore.add(customerData[i]);
    request.onsuccess = function(event) {
      // event.target.result == customerData[i].ssn;
    };
  }
  db.transaction("customers").objectStore("customers").get("444-44-4444").onsuccess = function(event) {
    alert("Name for SSN 444-44-4444 is " + event.target.result.name);
  };
  
}


 */




  dbConnection.checkActiveUser()






  
    


let index = 0;

const burgerButton = document.getElementById("burger-button");
const popupCloseButton = document.getElementById("popup-close");

const formSignInButton = document.getElementById("form-sign-in-button");
const signUpPopup = document.getElementById("signup-popup");
const signInPopupCloseButton = document.getElementById(
  "sign-in-popup-close-button"
);
const formSignUpButton = document.getElementById("form-sign-up-button");
const signInPopup = document.getElementById("signin-popup");
const signInButton = document.getElementById("signIn-button");
const burgerMenu = document.getElementById("burger-menu");

const profileLink = document.getElementById('profile-link')

const signUpSubmitButton = document.getElementById("signUp-submit-button");
const signInSubmitButton = document.getElementById("signIn-submit-button");

const signUpFirstName = document.getElementById("sign-up-first-name");
const signUpLastName = document.getElementById("sign-up-last-name");
const signUpEmail = document.getElementById("sign-up-email");
const signUpPassword = document.getElementById("sign-up-password");

const signInEmail = document.getElementById("sign-in-email");
const signInPassword = document.getElementById("sign-in-password");



const logOutButton = document.getElementById('log-out-button');;
const signUpButton = document.getElementById("signUp-button");


profileLink.addEventListener('click', function(e) {
  dbConnection.profileLinkRedirect()
})

document.addEventListener("click", function (e) {

  if (e.target.id === 'signUp-button') {
    signUpPopup.classList.add("visible");
  };


  if (e.target.id == "signup-popup" || e.target.id == "signin-popup") {
    signUpPopup.classList.remove("visible");
    signInPopup.classList.remove("visible");
  };

  if (e.target.id == "popup-close") {
    signUpPopup.classList.remove("visible");
  };
  if (e.target.id == "form-sign-in-button") {
    signUpPopup.classList.remove("visible");
  signInPopup.classList.add("visible");
  };
  if (e.target.id == "signIn-button") {
    signInPopup.classList.add("visible");
  };
  if (e.target.id == "sign-in-popup-close-button") {
    signInPopup.classList.remove("visible");
  };
  if (e.target.id == "form-sign-up-button") {
    signInPopup.classList.remove("visible");
    signUpPopup.classList.add("visible");
  };

});





burgerButton.addEventListener("click", function (e) {
  // burgerMenu.classList.add('visible')
  burgerMenu.style.left === "-15px"
    ? (burgerMenu.style.left = "-104vw")
    : (burgerMenu.style.left = "-15px");
});

document.addEventListener("scroll", function (e) {
  // burgerMenu.classList.remove('visible')
  burgerMenu.style.left === "-15px" ? (burgerMenu.style.left = "-100vw") : true;
});

/**
 * REGISTRATION
 */
signUpSubmitButton.addEventListener("click", function (e) {
  e.preventDefault();
  userData.name = `${signUpFirstName.value} ${signUpLastName.value}`;
  userData.email = signUpEmail.value;
  userData.password = signUpPassword.value;
  userData.role = 1;
  console.log(userData);

  dbConnection.signUp(userData);
});

/**
 * LOGGING IN
 * redirection to different pages according to user`s status
 */
signInSubmitButton.addEventListener("click", function (e) {
  e.preventDefault();
dbConnection.signIn(signInEmail.value, signInPassword.value)
});

/**
 * Logging out
 */

