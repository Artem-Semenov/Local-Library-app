'use strict'
dbConnection.ativeUserProfileRender()

const burgerButton = document.getElementById("burger-button");
const burgerMenu = document.getElementById("burger-menu");
const signUpPopup = document.getElementById('signup-popup')
const signInPopup = document.getElementById("signin-popup");
const signUpSubmitButton = document.getElementById("signUp-submit-button");
const signInSubmitButton = document.getElementById("signIn-submit-button");
const signUpFirstName = document.getElementById("sign-up-first-name");
const signUpLastName = document.getElementById("sign-up-last-name");
const signUpEmail = document.getElementById("sign-up-email");
const signUpPassword = document.getElementById("sign-up-password");

const signInEmail = document.getElementById("sign-in-email");
const signInPassword = document.getElementById("sign-in-password");



const profileLink = document.getElementById('profile-link')
profileLink.addEventListener('click', function(e) {
  dbConnection.profileLinkRedirect()
})


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


document.addEventListener('click', function(e) {
  
  if (e.target.dataset.id ==='accordBTn'){
    let content = e.target.nextElementSibling
    if (content.style.maxHeight) {
      content.style.maxHeight = null;
   } else {
     content.style.maxHeight = content.scrollHeight + "px";
   }
  }   
  if (e.target.id === 'log-out-button') {
    dbConnection.clearActiveUserStore()
    location.reload();
  };
  if (e.target.id === 'signIn-button') {
    signInPopup.classList.add("visible");
  };
  if (e.target.id == "form-sign-in-button") {
    signUpPopup.classList.remove("visible");
  signInPopup.classList.add("visible");
  };
  if (e.target.id == "form-sign-up-button") {
    signInPopup.classList.remove("visible");
  signUpPopup.classList.add("visible");
  };
  if (e.target.id == "sign-in-popup-close-button") {
    signInPopup.classList.remove("visible");
  };
  if (e.target.id == "popup-close") {
    signUpPopup.classList.remove("visible");
  };
  if (e.target.id == "signup-popup" || e.target.id == "signin-popup") {
    signUpPopup.classList.remove("visible");
    signInPopup.classList.remove("visible");
  };
})
signUpSubmitButton.addEventListener("click", function (e) {
  e.preventDefault();
  userData.name = `${signUpFirstName.value} ${signUpLastName.value}`;
  userData.email = signUpEmail.value;
  userData.password = signUpPassword.value;
  userData.role = 1;
  console.log(userData);

  dbConnection.signUp(userData);
});
signInSubmitButton.addEventListener("click", function (e) {
  e.preventDefault();
dbConnection.signIn(signInEmail.value, signInPassword.value)
});





document.querySelectorAll('.accordBtn').forEach(el => {

  el.addEventListener('click', function(e) {
    let content = this.nextElementSibling;
    if (content.style.maxHeight) {
      content.style.maxHeight = null;
   } else {
     content.style.maxHeight = content.scrollHeight + "px";
   }
  })
})

