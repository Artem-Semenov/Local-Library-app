const DB_NAME = "library";
const DB_VERSION = 2;

class DBconnection {
  constructor() {}
  db = null;
  callbackFn;
  openRequest = null;
  transaction;
  storeName;
  request = null;
  role = null;

  open(callbackFn) {
    this.callbackFn = callbackFn;
    this.openRequest = indexedDB.open(DB_NAME, DB_VERSION);
    this.openRequest.onsuccess = this.onSuccess;
    this.openRequest.onupgradeneeded = this.onUpgradeNeeded;
    this.openRequest.onerror = this.onError;
  }

  onSuccess = (e) => {
    this.db = e.target.result;
    console.log("onsuccess", e);
    this.callbackFn();
  };

  onUpgradeNeeded = (e) => {
    this.db = e.target.result;

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
    if (!this.db.objectStoreNames.contains("activeUser")) {
      this.db.createObjectStore("activeUser", {
        keyPath: "id",
        autoIncrement: true,
      });
    }
  };
  onError = (e) => {
    console.log("onError", e);
  };

  /**
   * METHODS TO ADD OBJECTS TO STORE
   * 1 - used by admin to add books to the store
   * 2 - used by users to add users to the store
   * 3 - used by users to add books to the orders
   * 4 - used to recognize active user
   */

  // 2 - registration(sign up)

  signUp = (data) => {
    this.data = data;
    this.request = indexedDB.open(DB_NAME, DB_VERSION);
    this.request.onerror = this.onError;
    this.request.onsuccess = () => {
      this.transaction = this.db.transaction("users", "readwrite");
      this.storeName = this.transaction.objectStore("users");
      this.addRequest = this.storeName.add(this.data);
      this.addRequest.onsuccess = () => {
        console.log("Registration successfull! Now you can sign in");
        alert("Registration successfull! Now you can sign in");
        signUpPopup.classList.remove("visible");
        signInPopup.classList.add("visible");
      };
      this.addRequest.onerror = () => {
        console.log("error with adding item to store", e.target);
        alert("Error! This email is already used. Try another one.");
      };
    };
  };

  // 4 - add active user

  addActiveUser = (data) => {
    this.data = data;
    this.request = indexedDB.open(DB_NAME, DB_VERSION);
    this.request.onerror = this.onError;
    this.request.onsuccess = () => {
      this.transaction = this.db.transaction("activeUser", "readwrite");
      this.storeName = this.transaction.objectStore("activeUser");
      this.addRequest = this.storeName.add(this.data);
      this.addRequest.onsuccess = () => {
        console.log("active user successfully updated");
      };
    };
  };

  addToTheStore = (storeName, data) => {
    this.storeName = storeName;
    // this.type = type;
    this.data = data;
    this.request = indexedDB.open(DB_NAME, DB_VERSION);
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
   * 1 - used by user to view list of available books
   * 2 - used by admin to get list of orders
   * 3 - used while logging in to approve account
   * 4 - used while signing up to avoid dublicating account
   * 5 - check active user
   */

  // Check active user to render elements(sign in sign up / log out buttons)
  // in header of home page

  checkActiveUser = () => {
    this.request = indexedDB.open(DB_NAME, DB_VERSION);
    this.request.onerror = this.onError;
    this.request.onsuccess = (e) => {
      this.db = e.target.result;
      this.transaction = this.db.transaction("activeUser");
      this.storeName = this.transaction.objectStore("activeUser");
      this.getRequest = this.storeName.getAll();
      this.getRequest.onsuccess = () => {
        if (this.getRequest.result.length === 1) {
          let html =
            // <li><button id="log-out-button">Log Out</button></li>
            `
        <li class='header-text-colored'>You signed in as 
        ${this.getRequest.result[0].name} (${this.getRequest.result[0].role === 101 ? 'admin' : 'user'})</li>
        <li><button id="contact-button">Contact</button></li>
        `;
          document.querySelector(".header-navigation > ul").innerHTML = html;
        } else {
          let html = `
        <li><button id="signUp-button">Signup</button></li>
        <li><button id="signIn-button">Signin</button></li> 
        <li><button id="contact-button">Contact</button></li>
        `;
          document.querySelector(".header-navigation > ul").innerHTML = html;
        }
      };
      this.getRequest.onerror = () => {
        alert("Problem happened with loading page. Please contact creator");
      };
    };
  };
  //check active user to render elements of user page

  ativeUserProfileRender = () => {
    this.request = indexedDB.open(DB_NAME, DB_VERSION);
    this.request.onerror = this.onError;
    this.request.onsuccess = (e) => {
      this.db = e.target.result;
      this.transaction = this.db.transaction("activeUser");
      this.storeName = this.transaction.objectStore("activeUser");
      this.getRequest = this.storeName.getAll();
      this.getRequest.onsuccess = () => {
        if (this.getRequest.result.length === 1) {
          let html = `
        <div class="search">
        <form action="">
          <div><input type="text" /></div>
          <button id="search-button" type="submit">
            <img src="img/search-icon.png" alt="" />
          </button>
        </form>
      </div>
      <div class="user-info" id="user-info-block">
        <div class="photo">photo</div>
        <div class="text-content">
          <div>${this.getRequest.result[0].role === 101 ? 'admin' : 'user'}</div>
          <p>${this.getRequest.result[0].name}</p>
          <p>${this.getRequest.result[0].email}</p>
        </div>
      </div>
      <div class="books-list">
        <button class="accordBtn" data-id='accordBTn'>Catalogue of books</button>
        <div class="catalogue-wrapper slider" id="catalogue-wrapper">
          <div class="catalogue-wrapper-content">
             <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Explicabo ipsam provident nesciunt in laudantium neque! Iure
              quibusdam omnis aperiam asperiores, expedita ea facilis id,
              animi odit commodi culpa molestiae veniam.
            </p>
          </div>
        </div>
      </div>
      <div class="books-list">
        <button class="accordBtn" data-id='accordBTn'>Ordered books list</button>
        <div class="catalogue-wrapper slider" id="catalogue-ordered-wrapper">
          <div class="catalogue-wrapper-content">
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Explicabo ipsam provident nesciunt in laudantium neque! Iure
              quibusdam omnis aperiam asperiores, expedita ea facilis id,
              animi odit commodi culpa molestiae veniam.
            </p>
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Explicabo ipsam provident nesciunt in laudantium neque! Iure
              quibusdam omnis aperiam asperiores, expedita ea facilis id,
              animi odit commodi culpa molestiae veniam.
            </p>
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Explicabo ipsam provident nesciunt in laudantium neque! Iure
              quibusdam omnis aperiam asperiores, expedita ea facilis id,
              animi odit commodi culpa molestiae veniam.
            </p>
          </div>
        </div>
      </div> `;

          document.querySelector(".main > .content").innerHTML = html;

          document.querySelector(".header-navigation > ul").innerHTML =`
          <li><button id="log-out-button">Log out</button></li>
          <li><button id="contact-button">Contact</button></li>`
         
        } else {
          let html = "Please log in to get access to all features";

          document.querySelector(".main > .content").innerHTML = html;

          document.querySelector(".header-navigation > ul").innerHTML =`
          <li><button id="signIn-button">Signin</button></li>
          <li><button id="contact-button">Contact</button></li>`
        }
      };
      this.getRequest.onerror = () => {
        alert("Problem happened with loading page. Please contact creator");
      };
    };
  };

  //on click on profile.html link - checking if user logged in. If yes - redirecting there
  //If not - alert
profileLinkRedirect = () => {
  this.request = indexedDB.open(DB_NAME, DB_VERSION);
  this.request.onerror = this.onError;
  this.request.onsuccess = (e) => {
    this.db = e.target.result;
    this.transaction = this.db.transaction("activeUser");
    this.storeName = this.transaction.objectStore("activeUser");
    this.getRequest = this.storeName.getAll();
    this.getRequest.onsuccess = () => {
      if (this.getRequest.result.length === 1) {
        window.location.href='user.html'
      } else {
        alert('log in to access profile')
      }
}
  }
}
  //sign in method
  //validation
  //redirection to user.html if login successfull;
  signIn = (indexName, password) => {
    this.indexName = indexName;
    this.password = password;
    this.request = indexedDB.open(DB_NAME, DB_VERSION);
    this.request.onerror = this.onError;
    this.request.onsuccess = (e) => {
      this.db = e.target.result;
      this.transaction = this.db.transaction("users");
      this.storeName = this.transaction.objectStore("users");
      this.index = this.storeName.index("email");
      this.getRequest = this.index.get(this.indexName);
      this.getRequest.onerror = () => {
        alert("Here is no such email registered!");
      };
      this.getRequest.onsuccess = () => {
        let currentUserData = this.getRequest.result;
        try {
          if (currentUserData.password === this.password) {
            //delete all from the activeUser store
            this.clearActiveUserStore();
            // add current user to this store
            this.addActiveUser(currentUserData);
            alert("Login successful! You will be redirected to your profile");
            location.href = "user.html";
          } else {
            alert("password incorrect");
          }
        } catch {
          alert("here is no user with such email!");
        }
      };
    };
  };

  ////

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
    this.request = indexedDB.open(DB_NAME, DB_VERSION);

    this.request.onsuccess = this.getOnSuccess;
    this.request.onerror = this.onError;
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

  getRequestOnSuccess = (e) => {
    let result = this.getRequest.result;
    console.log(result);
  };

  indexRequestOnSuccess = (e) => {
    console.log(this.request);
    try {
      if (this.getRequest.result.password === this.password) {
        console.log(this.db.objectStoreNames);
        /*   this.getRequest.result.role === 101
          ? (this.role = 101)
          : this.getRequest.result.role === 1
          ? (this.role = 1)
          : (this.role = null); */
      } else {
        alert("password incorrect");
      }
    } catch {
      alert("here is no user with such email");
    }
  };

  getRequestOnError = (e) => {
    console.log("error with getting from the store");
  };
  /**
   * METHOD TO DELETE SPECIFIED ITEMS FROM THE SPECIFIED STORE
   * 1 - used by admin to delete users
   * 2 - used by admin to delete books
   * 3 - used by admin to delete orders
   * 4 - used by users to delete orders
   * 5 - to log out
   */

  /// clear active user store
  clearActiveUserStore = () => {
    this.request = indexedDB.open(DB_NAME, DB_VERSION);
    this.request.onerror = this.onError;
    this.request.onsuccess = (e) => {
      this.db = e.target.result;
      this.transaction = this.db.transaction("activeUser", "readwrite");
      this.storeName = this.transaction.objectStore("activeUser");
      this.deleteRequest = this.storeName.clear();
      this.deleteRequest.onsuccess = () => {
        console.log("Active users successfully cleared");
      };
      this.deleteRequest.onerror = () => {
        console.log("Error with clearing active user");
      };
    };
  };

  deleteItem = (storeName, id) => {
    this.storeName = storeName;
    this.request = indexedDB.open(DB_NAME, DB_VERSION);
    this.request.onsuccess = this.deleteOnSuccess;
    this.request.onerror = this.deleteOnError;
  };

  deleteOnSuccess = (e) => {
    this.db = e.target.result;
    this.transaction = this.db.transaction(this.storeName, "readwrite");
    this.storeName = this.transaction.objectStore(this.storeName);
    this.deleteRequest = this.storeName.delete("1");
    this.deleteRequest.onsuccess = this.deleteRequestOnSuccess;
    this.deleteRequest.onerror = this.onError;
  };
  deleteRequestOnSuccess = () => {
    console.log("item was succesfully deleted");
  };
  /*   deleteOnError = (e) => {
    console.log("error with deleting item", e);
  }; */

  ////////////

  /*   checkForStatus = async (e) => {
    this.request = indexedDB.open(DB_NAME, 1);
    this.request.onsuccess = (e) => {
    }
  }  */
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
