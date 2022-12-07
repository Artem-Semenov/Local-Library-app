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
    // console.log(this.db.transaction);

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
      this.db.createObjectStore("books", { keyPath: "id" });
    }
    if (!this.db.objectStoreNames.contains("users")) {
      this.db.createObjectStore("users", { keyPath: "id" });
    }
    if (!this.db.objectStoreNames.contains("orders")) {
      this.db.createObjectStore("orders", { keyPath: "id" });
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
  addToTheStore = (storeName, readWrite, data) => {
    this.storeName = storeName;
    this.readWrite = readWrite;
    this.data = data;
    this.request = indexedDB.open(DB_NAME, 1);
    this.request.onsuccess = this.addtoTheStoreOnSuccess;
    this.request.onerror = this.onError;
  };
  addtoTheStoreOnSuccess = (e) => {
    // console.log("adding to the store");
    this.db = this.request.result;
    // console.log(this.data);
    this.transaction = this.db.transaction([this.storeName], this.readWrite);
    // console.log(this.transaction);
    this.storeName = this.transaction.objectStore(this.storeName);
    this.addRequest = this.storeName.add(this.data);
    this.transaction.onerror = this.addOnError;
    this.transaction.onsuccess = this.addOnSuccess;
    this.addRequest.onsuccess = this.addOnSuccess;
    this.request.onerror = this.addOnError;
  };
  addOnSuccess = () => {
    console.log("successfully added");
  };
  addOnError = (e) => {
    console.log("error with adding item to store", e.target);
  };

/**
 * METHOD TO GET INFO FROM THE DATABASE
 * 1 - used by anyone who access page to view list of available books 
 * 2 - used by admin to get list of orders 
 */

getFromTheStore = (storeName) => {
  
this.storeName = storeName;
this.request = indexedDB.open(DB_NAME, 1);

this.request.onsuccess = this.getOnSuccess;
this.request.onerror = this.getOnError;
}

getOnSuccess = (e) => {
this.db = e.target.result;
// console.log(e);
this.transaction = this.db.transaction(this.storeName);

this.storeName = this.transaction.objectStore(this.storeName);
this.getRequest = this.storeName.getAll();
// console.log(this.getRequest);
this.getRequest.onsuccess = this.getRequestOnSuccess
this.getRequest.onerror = this.getRequestOnError
}
getOnError = (e) => {
  console.log('error with getting');
}

getRequestOnSuccess = (e) => {
  console.log('success getting from the store', this.getRequest.result);
}

getRequestOnError = (e) => {
  console.log('error with getting from the store');
}
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
 } 
 deleteOnSuccess = (e) => {
  this.db = e.target.result;
  this.transaction = this.db.transaction(this.storeName, 'readwrite');
  this.storeName = this.transaction.objectStore(this.storeName);
  this.deleteRequest = this.storeName.delete('2')
  this.deleteRequest.onsuccess = this.deleteRequestOnSuccess
  this.deleteRequest.onerror = this.deleteOnError
 }
 deleteRequestOnSuccess = () => {
  console.log('item was succesfully deleted');
 }
 deleteOnError = (e) => {
console.log('error with deleting item', e);
 }
} 



const bookData = {
  id: 1,
  name: "html",
  description: "also not bad book",
  photo: null,
  totalCount: 7,
  avalCount: 3,
};

const userData = {
  id: 1,
  name: 'admin',
  login: 'admin',
  password: 'admin',
  role: 101,
}

const dbConnection = new DBconnection();

dbConnection.open(() => {
  console.log("can work");
});



dbConnection.getFromTheStore('books')





let index = 0;
const burgerButton = document.getElementById("burger-button")
const popupCloseButton = document.getElementById("popup-close")
const signUpButton = document.getElementById('signUp-button')
const formSignInButton = document.getElementById('form-sign-in-button')
const signUpPopup = document.getElementById('signup-popup')
const signInPopupCloseButton = document.getElementById('sign-in-popup-close-button')
const formSignUpButton = document.getElementById('form-sign-up-button')
const signInPopup = document.getElementById('signin-popup')
const signInButton = document.getElementById('signIn-button')
const burgerMenu = document.getElementById('burger-menu')

const signUpSubmitButton = document.getElementById('signUp-submit-button')
const signInSubmitButton = document.getElementById('signIn-submit-button')



signUpButton.addEventListener('click', function(e) {
  signUpPopup.classList.add("visible")
})

document.addEventListener('click', function(e) {
  if (e.target.id == 'signup-popup' || e.target.id == 'signin-popup') {
    signUpPopup.classList.remove('visible')
    signInPopup.classList.remove('visible')
  };
  console.log(e.target);
})
popupCloseButton.addEventListener('click', function (e) {
  signUpPopup.classList.remove('visible')
  } 
  )

  formSignInButton.addEventListener('click', function(e) {
    signUpPopup.classList.remove('visible')
    signInPopup.classList.add('visible')
  })
  

signInButton.addEventListener('click', function(e) {
  signInPopup.classList.add('visible')
})

signInPopupCloseButton.addEventListener('click', function(e) {
  signInPopup.classList.remove('visible')
}) 


formSignUpButton.addEventListener('click', function(e) {
  signInPopup.classList.remove('visible')
  signUpPopup.classList.add('visible')

})


burgerButton.addEventListener('click', function(e) {
  // burgerMenu.classList.add('visible')
  burgerMenu.style.left == '-15px' ? burgerMenu.style.left = '-100vw' : burgerMenu.style.left = '-15px'
})

document.addEventListener('scroll', function(e) {
  // burgerMenu.classList.remove('visible')
  burgerMenu.style.left == '-15px' ? burgerMenu.style.left = '-100vw' : true
})