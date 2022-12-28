const DB_NAME = "library";
const DB_VERSION = 7;

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
         this.objectStore = this.db.createObjectStore("orders", {
        keyPath: "id",
        autoIncrement: true,
      });
      this.objectStore.createIndex("orderedBy", "orderedBy", { unique: false });
      this.objectStore.createIndex("name", "name", { unique: false });
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
   * 1 - used to add books to the store
   * 2 - used by users to add users to the store
   * 3 - used to recognize active user
   * 4 - used to add books to the orders
   */

  // 2 - registration(sign up)

  signUp = (data) => {
    this.data = data;
    this.request = indexedDB.open(DB_NAME, DB_VERSION);
    this.request.onerror = this.onError;
    this.request.onsuccess = () => {
      this.transaction = this.db.transaction("users", "readwrite");
      this.storeName = this.transaction.objectStore("users");
      console.log(this.data);
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

  // 3 - add active user

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

  // 1 - add new book to the store

  addBookToStore = (data) => {
    this.data = data;
    this.request = indexedDB.open(DB_NAME, DB_VERSION);
    this.request.onerror = this.onError;
    this.request.onsuccess = (e) => {
      this.db = e.target.result;
      this.transaction = this.db.transaction("books", "readwrite");
      this.storeName = this.transaction.objectStore("books");
      console.log(this.storeName);
      this.addRequest = this.storeName.add(this.data);
      this.addRequest.onsuccess = () => {
        alert("Book successfully added");
      };
      this.addRequest.onerror = () => {
        console.log("error with adding item to store", e.target);
        alert("Error! Book was not add");
      };
    };
  };

  // 4 - add book to the orders

  addBookToTheOrderList = (name) => {
    this.request = indexedDB.open(DB_NAME, DB_VERSION);
    this.request.onerror = this.onError;
    this.request.onsuccess = (e) => {
      this.db = e.target.result;
      this.transaction = this.db.transaction("books");
      this.storeName = this.transaction.objectStore("books");
      this.index = this.storeName.index("name");
      this.getRequest = this.index.get(name);
      this.getRequest.onerror = this.onError;
      this.getRequest.onsuccess = () => {
        this.bookData = this.getRequest.result;
        delete this.bookData.id;
        this.transaction = this.db.transaction("activeUser");
        this.storeName = this.transaction.objectStore("activeUser");
        this.getRequest = this.storeName.getAll();
        this.getRequest.onerror = this.onError;
        this.getRequest.onsuccess = () => {
          this.bookData.orderedBy = this.getRequest.result[0].name;
          this.transaction = this.db.transaction("orders", "readwrite");
          this.storeName = this.transaction.objectStore("orders");
          this.addRequest = this.storeName.add(this.bookData);
          this.addRequest.onerror = () => {
            alert("Error! This books have finished");
          };
          this.addRequest.onsuccess = () => {
            alert("book ordered!");
            location.reload();
          };
        };
      };
    };
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
        ${this.getRequest.result[0].name} (${
              this.getRequest.result[0].role === 101 ? "admin" : "user"
            })</li>
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
  //check active user to render elements of user page, in the end calling method to render available books

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
          // render users info(name, email, role)

          document.getElementById("user-info-text").innerHTML = `
            <div>${
              this.getRequest.result[0].role === 101 ? "admin" : "user"
            }</div>
            <p>${this.getRequest.result[0].name}</p>
            <p>${this.getRequest.result[0].email}</p>
            `;
          //render header buttons
          document.querySelector(".header-navigation > ul").innerHTML = `
            <li><button id="log-out-button">Log out</button></li>
            <li><button id="contact-button">Contact</button></li>`;

          

          // if it is regular user
        /*   if (this.getRequest.result[0].role === 1) {
            //render list of ordered books
          }

          //if it is an admin
          else if (this.getRequest.result[0].role === 101) {
            //render list of all orders
            //render list of outdated orders
          } */
        } else {
          let html = "Please log in to get access to all features";

          document.querySelector(".main > .content").innerHTML = html;

          document.querySelector(".header-navigation > ul").innerHTML = `
          <li><button id="signIn-button">Signin</button></li>
          <li><button id="contact-button">Contact</button></li>`;
        }
        // render list of all available books
        this.renderAvailableBooks();
      };
      this.getRequest.onerror = () => {
        alert("Problem happened with loading page. Please contact creator");
      };
    };
  };

  //on click on profile link - checking if user logged in. If yes - redirecting
  //to admin.html or user.html according to the logged user`s role;
  //If not logged - alert
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
          if (this.getRequest.result[0].role === 101) {
            location.href = "admin.html";
          } else location.href = "user.html";
        } else {
          alert("log in to access profile");
        }
      };
    };
  };
  //sign in method
  //
  //redirection to user.html / admin.html if login successfull;
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
            if (this.getRequest.result.role === 101) {
              location.href = "admin.html";
            } else location.href = "user.html";
          } else {
            alert("password incorrect");
          }
        } catch {
          alert("here is no user with such email!");
        }
      };
    };
  };

  //// render list of available books, in the end calling method to render ordersList

  renderAvailableBooks = () => {
    this.request = indexedDB.open(DB_NAME, DB_VERSION);
    this.request.onerror = this.onError;
    this.request.onsuccess = (e) => {
      this.db = e.target.result;
      this.transaction = this.db.transaction("books");
      this.storeName = this.transaction.objectStore("books");
      this.getRequest = this.storeName.getAll();
      this.getRequest.onsuccess = () => {
        let item;
        this.getRequest.result.forEach((el) => {
          item = `
        <div class="book-wrapper">
          <button data-id='${el.name}' data-class='take-book-to-read-btn'>Take to read</button>
          <img src="img/book-photo-1.png" alt="book" />
          <div>
            <h3>${el.name}</h3>
            <h4>${el.author}</h4>
            <p>
              ${el.description}
            </p>
          </div>
        </div>
  `;

          document
            .getElementById("catalogue-content")
            .insertAdjacentHTML("beforeend", item);
        });

        this.renderListOfOrders();
      };
    };
  };

  // render orders for user

  renderListOfOrders = () => {
    this.activeUser = null;
    this.activeUserRole = null;
    this.request = indexedDB.open(DB_NAME, DB_VERSION);
    this.request.onerror = this.onError;
    this.request.onsuccess = (e) => {
      this.db = e.target.result;
      this.transaction = this.db.transaction("activeUser");
      this.storeName = this.transaction.objectStore("activeUser");
      this.getRequest = this.storeName.getAll();
      this.getRequest.onerror = this.onError;
      this.getRequest.onsuccess = () => {
        this.activeUser = this.getRequest.result[0].name;
        this.activeUserRole = this.getRequest.result[0].role;
        if (this.activeUserRole === 1) {

        
        this.transaction = this.db.transaction("orders");
        this.storeName = this.transaction.objectStore("orders");
        this.index = this.storeName.index("orderedBy");
        this.getRequest = this.index.getAll(this.activeUser);

        this.getRequest.onsuccess = () => {
          let item;
          this.getRequest.result.forEach((el) => {
            item = `
      <div class="book-wrapper">
        <button data-id='${el.name}' data-class='return-book-btn'>Return book</button>
        <img src="img/book-photo-1.png" alt="book" />
        <div>
          <h3>${el.name}</h3>
          <h4>${el.author}</h4>
          <p>
            ${el.description}
          </p>
        </div>
      </div>
            `;
          
            document
              .getElementById("list-of-orders")
              .insertAdjacentHTML("beforeend", item);
          })
        ;
        };
      } else if (this.activeUserRole === 101) {
        
        this.transaction = this.db.transaction("orders");
        this.storeName = this.transaction.objectStore("orders");
        this.getRequest = this.storeName.getAll();
        this.getRequest.onerror = this.onError;
        this.getRequest.onsuccess = () => {
        let result = this.getRequest.result;
        //finding names of those who made orders
        let orderedByArr = Array.from(new Set(result.map(el => el.orderedBy))) 
        //finding which books did each of them order
        //making array with objects(who ordered, [what ordered, quantity])
        let orders = orderedByArr.map(el => {
          return {orderedBy: el, 
            orders: result.filter(elem => elem.orderedBy === el).reduce((acc, el) => {
              acc[el.name] = (acc[el.name] || 0) + 1;
              return acc
            }, {}),
          }

        });
        console.log(orders);
        let item;
        orders.forEach(el => {
          let htmlList = '';
         Object.keys(el.orders).forEach(elem => {
          // console.log(elem, el.orders[elem]);
          htmlList += `
          <li>${elem} - ${el.orders[elem]} pcs.</li>
          `;
          });
      
          item = `
          <div class="item-content">
                <h4>Person: ${el.orderedBy}</h4>
                <p>Ordered books:</p>
                <ul>
                  ${htmlList}
                </ul>
              </div>
          `;
          document
          .getElementById("list-of-orders")
          .insertAdjacentHTML("beforeend", item);
        })
     
      /*   let uniqueTest = {}
        orders[1].orders.forEach(el => {
        
         uniqueTest[el.name] = (uniqueTest[el.name] || 0) + 1
        })
      */
       
        }
      }


      };
    };
  };




  /**
   * METHODS TO DELETE ITEMS FROM THE STORES
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
        console.log("Active user successfully cleared");
      };
      this.deleteRequest.onerror = () => {
        console.log("Error with clearing active user");
      };
    };
  };

  //delete book from library

  deleteBookFromLibrary = (bookName) => {
    this.name = bookName;
    this.request = indexedDB.open(DB_NAME, DB_VERSION);
    this.request.onerror = this.onError;
    this.request.onsuccess = (e) => {
      this.db = e.target.result;
      this.transaction = this.db.transaction("books", "readwrite");
      this.storeName = this.transaction.objectStore("books");
      this.index = this.storeName.index("name");
      this.getRequest = this.index.getKey(this.name);
      this.getRequest.onerror = this.onError;
      this.getRequest.onsuccess = () => {
        this.bookId = this.getRequest.result
        try {
          this.deleteRequest = this.storeName.delete(this.bookId);
          this.deleteRequest.onError = this.onError;
          this.deleteRequest.onsuccess = () => {

            this.transaction = this.db.transaction('orders', 'readwrite');
            this.storeName = this.transaction.objectStore('orders');
            this.index = this.storeName.index('name')
            this.getRequest = this.index.getAllKeys(this.name);
            console.log(this.name);
            this.getRequest.onerror = this.onError;
            this.getRequest.onsuccess = () => {
            this.bookIds = this.getRequest.result
            console.log(this.index, this.bookIds);
            this.bookIds.forEach(el => {
              this.deleteRequest = this.storeName.delete(el)
            })
           
            this.deleteRequest.onerror = this.onError;
            this.deleteRequest.onsuccess = () => {
              alert("book was deleted");
              location.reload();
            }

            }
            


           
          };
        } catch {
          alert("here is no such book");
        }
      };
    };
  };


//return book to the library(delete from the orders)

returnBook = (bookName) => {
this.bookName = bookName;
this.idToDelete = null;
this.request = indexedDB.open(DB_NAME, DB_VERSION);
this.request.onerror = this.onError;
this.request.onsuccess = (e) => {
  this.db = e.target.result;
  this.transaction = this.db.transaction("activeUser");
  this.storeName = this.transaction.objectStore("activeUser");
  this.getRequest = this.storeName.getAll();
  this.getRequest.onerror = this.onError;
  this.getRequest.onsuccess = () => {
    this.activeUser = this.getRequest.result[0].name;

    this.transaction = this.db.transaction("orders", 'readwrite');
    this.storeName = this.transaction.objectStore("orders");
    this.index = this.storeName.index("orderedBy");
    this.getRequest = this.index.getAll(this.activeUser);
    this.getRequest.onerror = this.onError;
    this.getRequest.onsuccess = () => {
      this.getRequest.result.forEach(el => {
        if (el.name === this.bookName) {
          this.idToDelete = el.id
        }
      })
    this.deleteRequest = this.storeName.delete(this.idToDelete)
    this.deleteRequest.onerror = this.onError;
    this.deleteRequest.onsuccess = () => {
      alert('Book was successfullt deleted from your orders')
      location.reload()
    }
    this.deleteRequest.onerror = () => {
      alert('Problem with deleting! Try later')
    }
    }
}
}
}

}

/* const bookData = {
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
*/

const dbConnection = new DBconnection();

dbConnection.open(() => {
  console.log("can work");
});
