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

const DB_NAME = "library";

class DBconnection {
  db = null;
  /**
   * @type {IDBOpenDBRequest | null}
   */
  openRequest = null;
  constructor() {}
  transaction;
  callbackFn;
  storeName;
  request = null;
  // result = null;

  open(callbackFn) {
    this.callbackFn = callbackFn;
    // this.booksStore = booksStore;
    this.openRequest = indexedDB.open(DB_NAME, 1);

    this.openRequest.onsuccess = this.onSuccess;
    this.openRequest.onupgradeneeded = this.onUpgradeNeeded;

    this.openRequest.onerror = this.onError;
  }

  onSuccess = (e) => {
    this.db = e.target.result;
    console.log(this.db);

    /* db.onversionchange = function () {
        db.close();
        alert("База данных устарела, пожалуйста, перезагрузите страницу.");
      }; */
    // console.log("onSuccess", this.db);

    this.callbackFn();
  };

  onUpgradeNeeded = (e) => {
    this.db = e.target.result;

    switch (e.oldVersion) {
      case 0:

      case 1:
    }
    console.log("onUpgradeNeeded", this.db, e);

    if (!this.db.objectStoreNames.contains("books")) {
      this.objectStore = this.db.createObjectStore("books", {
        keyPath: "id",
        autoIncrement: true,
      });
      this.objectStore.createIndex("name", "name", { unique: true });
    }

    if (!this.db.objectStoreNames.contains("users")) {
      this.objectStore = this.db.createObjectStore("users", {
        keyPath: "id",
        autoIncrement: true,
      });
      this.objectStore.createIndex("email", "email", { unique: true });
    }
    if (!this.db.objectStoreNames.contains("orders")) {
      this.db.createObjectStore("orders", {
        keyPath: "id",
        autoIncrement: true,
      });
    }
  };
  onError = (e) => {
    console.log("onError", e);
  };

  /**
   * METHOD TO ADD OBJECTS TO STORE
   * 1 - used by admin to add books to the store
   * 2 - used by users to add users to the store
   * 3 - used by users to add books to the orders
   */
  addToTheStore = (storeName, data, type) => {
    this.storeName = storeName;
    this.type = type;
    this.data = data;
    this.request = indexedDB.open(DB_NAME, 1);
    this.request.onsuccess = this.addtoTheStoreOnSuccess;
    this.request.onerror = this.onError;
  };
  addtoTheStoreOnSuccess = (e) => {
    // console.log("adding to the store");
    this.db = this.request.result;
    // console.log(this.data);
    this.transaction = this.db.transaction([this.storeName], "readwrite");
    // console.log(this.transaction);
    this.storeName = this.transaction.objectStore(this.storeName);
    console.log(this.storeName);
    this.addRequest = this.storeName.add(this.data);
    this.transaction.onerror = this.addOnError;
    this.transaction.onsuccess = this.addOnSuccess;
    this.addRequest.onsuccess = this.addOnSuccess;
    this.request.onerror = this.addOnError;
  };
  addOnSuccess = (e) => {
    console.log("successfully added");
    if (this.type == "SucsSignUp") {
      alert("Registration successfull! Now you can sign in");
      signUpPopup.classList.remove("visible");
      signInPopup.classList.add("visible");
    }
  };
  addOnError = (e) => {
    console.log("error with adding item to store", e.target);
    alert("Error! This email is already used. Try another one.");
  };

  /**
   * METHOD TO GET INFO FROM THE DATABASE
   * 1 - used by anyone who access page to view list of available books
   * 2 - used by admin to get list of orders
   */

  getFromTheStore = (
    storeName,
    type,
    index = null,
    indexName = null,
    password = null
  ) => {
    this.type = type;
    this.index = index;
    this.storeName = storeName;
    this.indexName = indexName;
    this.password = password;
    this.request = indexedDB.open(DB_NAME, 1);

    this.request.onsuccess = this.getOnSuccess;
    this.request.onerror = this.getOnError;
  };

  getOnSuccess = (e) => {
    this.db = e.target.result;
    // console.log(e);
    this.transaction = this.db.transaction(this.storeName);

    this.storeName = this.transaction.objectStore(this.storeName);
    switch (this.type) {
      case "getAll":
        this.getRequest = this.storeName.getAll();
        this.getRequest.onsuccess = this.getRequestOnSuccess;
      case "index":
        this.index = this.storeName.index(this.index);
        this.getRequest = this.index.get(this.indexName);
        this.getRequest.onsuccess = this.indexRequestOnSuccess;
    }

    // console.log(this.getRequest);

    this.getRequest.onerror = this.getRequestOnError;
  };
  getOnError = (e) => {
    console.log("error with getting");
  };

  getRequestOnSuccess = (e) => {
    let result = this.getRequest.result;
    console.log(result);
  };

  indexRequestOnSuccess = (e) => {
    console.log(this.getRequest.result.password == this.password);
  };
  getRequestOnError = (e) => {
    console.log("error with getting from the store");
  };
  /**
   * METOD TO DELETE SPECIFIED ITEMS FROM THE SPECIFIED STORE
   * 1 - used by admin to delete users
   * 2 - used by admin to delete books
   * 3 - used by admin to delete orders
   * 4 - used by users to delete orders
   */

  deleteItem = (storeName, id) => {
    this.storeName = storeName;
    this.request = indexedDB.open(DB_NAME, 1);
    this.request.onsuccess = this.deleteOnSuccess;
    this.request.onerror = this.deleteOnError;
  };
  deleteOnSuccess = (e) => {
    this.db = e.target.result;
    this.transaction = this.db.transaction(this.storeName, "readwrite");
    this.storeName = this.transaction.objectStore(this.storeName);
    this.deleteRequest = this.storeName.delete("2");
    this.deleteRequest.onsuccess = this.deleteRequestOnSuccess;
    this.deleteRequest.onerror = this.deleteOnError;
  };
  deleteRequestOnSuccess = () => {
    console.log("item was succesfully deleted");
  };
  deleteOnError = (e) => {
    console.log("error with deleting item", e);
  };
}

const bookData = {
  name: "js",
  description: "qweqwnot bad book",
  photo: null,
  totalCount: 10,
  avalCount: 5,
};

const userData = {
  name: "Admin",
  email: "admin@gmail.com",
  password: "admin",
  role: 101,
};

const dbConnection = new DBconnection();

dbConnection.open(() => {
  console.log("can work");
});

// dbConnection.addToTheStore('users', userData)

let index = 0;
const burgerButton = document.getElementById("burger-button");
const popupCloseButton = document.getElementById("popup-close");
const signUpButton = document.getElementById("signUp-button");
const formSignInButton = document.getElementById("form-sign-in-button");
const signUpPopup = document.getElementById("signup-popup");
const signInPopupCloseButton = document.getElementById(
  "sign-in-popup-close-button"
);
const formSignUpButton = document.getElementById("form-sign-up-button");
const signInPopup = document.getElementById("signin-popup");
const signInButton = document.getElementById("signIn-button");
const burgerMenu = document.getElementById("burger-menu");

const signUpSubmitButton = document.getElementById("signUp-submit-button");
const signInSubmitButton = document.getElementById("signIn-submit-button");

const signUpFirstName = document.getElementById("sign-up-first-name");
const signUpLastName = document.getElementById("sign-up-last-name");
const signUpEmail = document.getElementById("sign-up-email");
const signUpPassword = document.getElementById("sign-up-password");

const signInEmail = document.getElementById("sign-in-email");
const signInPassword = document.getElementById("sign-in-password");

signUpButton.addEventListener("click", function (e) {
  signUpPopup.classList.add("visible");
});

document.addEventListener("click", function (e) {
  if (e.target.id == "signup-popup" || e.target.id == "signin-popup") {
    signUpPopup.classList.remove("visible");
    signInPopup.classList.remove("visible");
  }
});
popupCloseButton.addEventListener("click", function (e) {
  signUpPopup.classList.remove("visible");
});

formSignInButton.addEventListener("click", function (e) {
  signUpPopup.classList.remove("visible");
  signInPopup.classList.add("visible");
});

signInButton.addEventListener("click", function (e) {
  signInPopup.classList.add("visible");
});

signInPopupCloseButton.addEventListener("click", function (e) {
  signInPopup.classList.remove("visible");
});

formSignUpButton.addEventListener("click", function (e) {
  signInPopup.classList.remove("visible");
  signUpPopup.classList.add("visible");
});

burgerButton.addEventListener("click", function (e) {
  // burgerMenu.classList.add('visible')
  burgerMenu.style.left == "-15px"
    ? (burgerMenu.style.left = "-100vw")
    : (burgerMenu.style.left = "-15px");
});

document.addEventListener("scroll", function (e) {
  // burgerMenu.classList.remove('visible')
  burgerMenu.style.left == "-15px" ? (burgerMenu.style.left = "-100vw") : true;
});

signUpSubmitButton.addEventListener("click", function (e) {
  e.preventDefault();
  userData.name = `${signUpFirstName.value} ${signUpLastName.value}`;
  userData.email = signUpEmail.value;
  userData.password = signUpPassword.value;
  userData.role = 1;
  console.log(userData);

  dbConnection.addToTheStore("users", userData, "SucsSignUp");
});

signInSubmitButton.addEventListener("click", function (e) {
  e.preventDefault();

  dbConnection.getFromTheStore(
    "users",
    "index",
    "email",
    signInEmail.value,
    signInPassword.value
  );
});
