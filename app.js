"use strict";
/* { id: 1, name: 'Joan Rowling', description: 'This book was written for readers', 
  photo: '', totalCount: 7, avalCount: 3},
  { id: 3, name: 'Joan Rowling', description: 'This book was written for readers', 
  photo: '', totalCount: 7, avalCount: 3} */


if (
  document.URL.includes("index") ||
  location.pathname === "/" ||
  location.pathname === "/Local-Library-app/"
) {
  dbConnection.checkActiveUser();
} else if (document.URL.includes("user") || document.URL.includes("admin")) {
  dbConnection.ativeUserProfileRender();
}

if (document.URL.includes("search")) {
  dbConnection.renderSearchResults(
    window.location.search
      .slice(window.location.search.indexOf("=") + 1)
      .split("+")
      .join(" ")
      .trim()
  );
}

const signUpPopup = document.getElementById("signup-popup");
const signInPopup = document.getElementById("signin-popup");

const burgerMenu = document.getElementById("burger-menu");

const profileLink = document.getElementById("profile-link");

const signUpFirstName = document.getElementById("sign-up-first-name");
const signUpLastName = document.getElementById("sign-up-last-name");
const signUpEmail = document.getElementById("sign-up-email");
const signUpPassword = document.getElementById("sign-up-password");

const signInEmail = document.getElementById("sign-in-email");
const signInPassword = document.getElementById("sign-in-password");

const searchForm = document.getElementById("search-form");

searchForm.addEventListener("submit", function (e) {
  let input = document.getElementById("search-input").value;
  if (!input) {
    e.preventDefault();
    alert("enter the beggining of book name");
  }
});

document.addEventListener("click", function (e) {
  // listeners for pop-ups - registration/logging in
  if (e.target.id === "signUp-button") {
    signUpPopup.classList.add("visible");
  }

  if (e.target.id == "signup-popup" || e.target.id == "signin-popup") {
    signUpPopup.classList.remove("visible");
    signInPopup.classList.remove("visible");
  }

  if (e.target.id == "popup-close") {
    signUpPopup.classList.remove("visible");
  }
  if (e.target.id == "form-sign-in-button") {
    signUpPopup.classList.remove("visible");
    signInPopup.classList.add("visible");
  }
  if (e.target.id == "signIn-button") {
    signInPopup.classList.add("visible");
  }
  if (e.target.id == "sign-in-popup-close-button") {
    signInPopup.classList.remove("visible");
  }
  if (e.target.id == "form-sign-up-button") {
    signInPopup.classList.remove("visible");
    signUpPopup.classList.add("visible");
  }
  // REGISTRATION
  if (e.target.id == "signUp-submit-button") {
    e.preventDefault();
    userData.name = `${signUpFirstName.value} ${signUpLastName.value}`;
    userData.email = signUpEmail.value;
    userData.password = signUpPassword.value;
    userData.role = 1;
    dbConnection.signUp(userData);
  }
  //burger menu open/close
  if (e.target.id == "burger-button") {
    e.preventDefault();
    burgerMenu.style.left === "-15px"
      ? (burgerMenu.style.left = "-104vw")
      : (burgerMenu.style.left = "-15px");
  }
  //LOGGING IN
  // redirection to different pages according to user`s status
  if (e.target.id == "signIn-submit-button") {
    e.preventDefault();
    dbConnection.signIn(signInEmail.value, signInPassword.value);
  }
  //on click on profile - redirecting according to user`s role or alert if noy logged in
  if (e.target.id == "profile-link") {
    e.preventDefault();
    dbConnection.profileLinkRedirect();
  }
  //on log-out button click - clearing active user Store and redirect to home.html
  if (e.target.id === "log-out-button") {
    dbConnection.clearActiveUserStore();
    if(document.URL.includes('artem-semenov')) {
      location.pathname = '/Local-Library-app/'
    } else location.href = "/";
  }
  //For User Page - to take book to read
  if (e.target.dataset.class === "take-book-to-read-btn") {
    let bookName = e.target.dataset.id;
    dbConnection.addBookToTheOrderList(bookName);
  }
  //for user page - return book
  if (e.target.dataset.class === "return-book-btn") {
    let bookName = e.target.dataset.id;
    dbConnection.returnBook(bookName);
  }
  if (e.target.id === 'home-link') {
    if (document.URL.includes('artem-semenov')) {
     location.pathname = '/Local-Library-app/'
    } else  location.href = "/";
  }
});

document.querySelectorAll(".accordBtn").forEach((el) => {
  el.addEventListener("click", function (e) {
    e.preventDefault();
    let content = this.nextElementSibling;
    if (content.style.maxHeight) {
      content.style.maxHeight = null;
    } else {
      content.style.maxHeight = content.scrollHeight + "px";
    }
  });
});

document.addEventListener("scroll", function (e) {
  burgerMenu.style.left === "-15px" ? (burgerMenu.style.left = "-104vw") : true;
});
