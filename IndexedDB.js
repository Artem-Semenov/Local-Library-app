const DB_NAME = "library";
const DB_VERSION = 1;

class DBconnection {
  constructor() {}
  db = null;
  callbackFn;
  openRequest = null;
  transaction;
  storeName;
  request = null;
  role = null; //1 - user, 101 - admin

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

    dbConnection.Initialize();

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
   * INITIALIZE APP - checking if there anything in users and books stores. If there are nothing -
   * adding admin profile and 2 books
   */
  Initialize = () => {
    this.adminData = {
      name: "Administrator",
      role: 101,
      email: "admin@gmail.com",
      password: "admin",
    };
    this.booksData = [
      {
        name: "Sherlock Holmes",
        author: "Johan Rowling",
        description: `A young private invsetigator who must uncover the mystery behind sudden disappearances.`,
        totalCount: 15,
        availableCount: 15,
      },
      {
        name: "The Psychology of money",
        author: "Nocholas Persquizthiey",
        description:
          "The fundamental wisom of managing money and personal finance.",
        totalCount: 10,
        availableCount: 10,
      },
    ];
    this.request = indexedDB.open(DB_NAME, DB_VERSION);
    this.request.onerror = this.onError;
    this.request.onsuccess = (e) => {
      this.db = e.target.result;
      this.transaction = this.db.transaction("users", "readwrite");
      this.storeName = this.transaction.objectStore("users");
      this.getRequest = this.storeName.getAll();
      this.getRequest.onsuccess = () => {
        //checking users object store
        //if nothing there - adding admin and 2 books
        if (this.getRequest.result.length < 1) {
          this.addRequest = this.storeName.add(this.adminData);
          this.addRequest.onerror = this.onError;
          this.addRequest.onsuccess = () => {
            this.transaction = this.db.transaction("books", "readwrite");
            this.storeName = this.transaction.objectStore("books");
            this.getRequest = this.storeName.getAll();
            this.getRequest.onerror = this.onError;
            this.getRequest.onsuccess = () => {
              if (this.getRequest.result.length < 1) {
                this.booksData.forEach((el) => {
                  this.addRequest = this.storeName.add(el);
                });
                if (
                  document.URL.includes("index") ||
                  location.pathname === "/" ||
                  location.pathname === "/Local-Library-app/"
                ) {
                  dbConnection.checkActiveUser();
                } else if (
                  document.URL.includes("user") ||
                  document.URL.includes("admin")
                ) {
                  dbConnection.ativeUserProfileRender();
                } else if (document.URL.includes("search")) {
                  dbConnection.renderSearchResults(
                    decodeURIComponent(
                      window.location.search
                        .slice(window.location.search.indexOf("=") + 1)
                        .split("+")
                        .join(" ")
                        .trim()
                    )
                  );
                }
                alert(
                  "application initialized. You can sign in as admin using email: admin@gmail.com, password: admin"
                );
              } 
            };
          };
        } else {
          console.log('111');
          //regardless of previous check - calling methods to render UI
          //for different pages
          if (
            document.URL.includes("index") ||
            location.pathname === "/" ||
            location.pathname === "/Local-Library-app/"
          ) {
            dbConnection.checkActiveUser();
          } else if (
            document.URL.includes("user") ||
            document.URL.includes("admin")
          ) {
            dbConnection.ativeUserProfileRender();
          } else if (document.URL.includes("search")) {
            dbConnection.renderSearchResults(
              decodeURIComponent(
                window.location.search
                  .slice(window.location.search.indexOf("=") + 1)
                  .split("+")
                  .join(" ")
                  .trim()
              )
            );
          }
        }
      };
      this.getRequest.onerror = () => {
        console.log(e);
        alert("error with initializing app, check indexedDB");
      };
    };
  };
  /**
   * METHODS TO ADD OBJECTS TO STORE
   * 1 - used to add books to the store
   * 2 - used by users to add users to the store
   * 3 - used to recognize active user
   * 4 - used to add books to the orders
   */

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
      this.addRequest.onerror = (e) => {
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
      this.addRequest = this.onError;
      this.addRequest.onsuccess = () => {
        console.log("active user successfully updated");
      };
    };
  };

  // 4 - add book to the orders

  addBookToTheOrderList = (name) => {
    this.request = indexedDB.open(DB_NAME, DB_VERSION);
    this.request.onerror = this.onError;
    this.request.onsuccess = (e) => {
      this.db = e.target.result;
      //finding data of a book in books store
      this.transaction = this.db.transaction("books");
      this.storeName = this.transaction.objectStore("books");
      this.index = this.storeName.index("name");
      this.getRequest = this.index.get(name);
      this.getRequest.onerror = this.onError;
      this.getRequest.onsuccess = () => {
        //deleting her id because in orders we have other id`s
        this.bookData = this.getRequest.result;
        delete this.bookData.id;
        //checking if there at lest 1 book available
        if (this.bookData.availableCount <= 0) {
          alert("Error! This books finished!");
          return false;
        }
        //before adding to orders - deleting from props counts
        //cause we dont need this information in orders store
        delete this.bookData.availableCount;
        delete this.bookData.totalCount;
        //adding date prop to order - from - to(30 days)
        this.date = new Date();
        this.bookData.dateFrom = new Date();
        this.bookData.dateTo = new Date(
          this.date.setDate(this.date.getDate() + 30)
        );
        //getting info about active User to fulfill prop 'orderedBy'
        //in order
        this.transaction = this.db.transaction("activeUser");
        this.storeName = this.transaction.objectStore("activeUser");
        this.getRequest = this.storeName.getAll();
        this.getRequest.onerror = this.onError;
        this.getRequest.onsuccess = () => {
          //adding object to orders Store
          this.bookData.orderedBy = this.getRequest.result[0].email;
          this.transaction = this.db.transaction("orders", "readwrite");
          this.storeName = this.transaction.objectStore("orders");
          this.addRequest = this.storeName.add(this.bookData);
          this.addRequest.onerror = () => {
            alert("Error! This books have finished");
          };
          this.addRequest.onsuccess = () => {
            alert("book ordered!");
            //getting info about book from books store and changing available count prop at at -= 1;
            this.transaction = this.db.transaction("books", "readwrite");
            this.storeName = this.transaction.objectStore("books");
            this.index = this.storeName.index("name");
            this.getRequest = this.index.get(this.bookData.name);
            this.getRequest.onerror = this.onError;
            this.getRequest.onsuccess = () => {
              console.log(this.getRequest.result);
              this.bookData = this.getRequest.result;
              this.bookData.availableCount -= 1;
              this.changeRequest = this.storeName.put(this.bookData);
            };

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
   * 4 - check active user to render UI elements
   * 5 - to render elements of user`s profile
   * 6 - check active user to redirect to appropriate page
   * 7 - search
   * 8 - render search results on search.html
   * 9 - render list of outdated orders
   */

  // 1 - render list of available books, in the end calling method to render ordersList

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
            <button data-id='${
              el.name
            }' data-class='take-book-to-read-btn'>Take to read</button>
            <img src="${randomPhoto()}" alt="book" />
            <div>
              <p>available ${el.availableCount}/${el.totalCount}</p>
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

  // 2-  render list of orders for - for user list of personal orders
  // for admin - list of all orders, then calling method to render list of outdated orders

  renderListOfOrders = () => {
    this.activeUser = null;
    this.activeUserRole = null;
    this.today = new Date();
    this.request = indexedDB.open(DB_NAME, DB_VERSION);
    this.request.onerror = this.onError;
    this.request.onsuccess = (e) => {
      this.db = e.target.result;
      //recognize active user
      this.transaction = this.db.transaction("activeUser");
      this.storeName = this.transaction.objectStore("activeUser");
      this.getRequest = this.storeName.getAll();
      this.getRequest.onerror = this.onError;
      this.getRequest.onsuccess = () => {
        this.activeUser = this.getRequest.result[0].email;
        this.activeUserRole = this.getRequest.result[0].role;
        //depending on role - rendering different lists of orders
        if (this.activeUserRole === 1) {
          this.transaction = this.db.transaction("orders");
          this.storeName = this.transaction.objectStore("orders");
          this.index = this.storeName.index("orderedBy");
          //all ordered by THIS USER
          this.getRequest = this.index.getAll(this.activeUser);

          this.getRequest.onsuccess = () => {
            let item;
            this.getRequest.result.forEach((el) => {
              item = `
        <div class="book-wrapper">
          <button data-id='${
            el.name
          }' data-class='return-book-btn'>Return book</button>
          <img src="${randomPhoto()}" alt="book" />
          <div>
            <h3>${el.name}</h3>
            <h4>${el.author}</h4>
            <p>
              ${el.description}
            </p>
            <p>book was taken on ${("0" + el.dateFrom.getDate()).slice(-2)}.${(
                "0" +
                (el.dateFrom.getMonth() + 1)
              ).slice(-2)}.${el.dateFrom.getFullYear()}
            It should be returned within ${Math.floor(
              (el.dateTo - this.today) / (1000 * 60 * 60 * 24)
            )} days
            </p>
          </div>
        </div>
              `;

              document
                .getElementById("list-of-orders")
                .insertAdjacentHTML("beforeend", item);
            });
          };
        } else if (this.activeUserRole === 101) {
          this.transaction = this.db.transaction("orders");
          this.storeName = this.transaction.objectStore("orders");
          this.getRequest = this.storeName.getAll();
          this.getRequest.onerror = this.onError;
          this.getRequest.onsuccess = () => {
            //ALL ORDERS
            let result = this.getRequest.result;
            //finding names of those who made orders
            let orderedByArr = Array.from(
              new Set(result.map((el) => el.orderedBy))
            );
            //finding which books did each of them order
            //making array with objects(who ordered, [what ordered, quantity])
            let orders = orderedByArr.map((el) => {
              return {
                orderedBy: el, //first prop is person`s name
                orders: result //second prop: object
                  .filter((elem) => elem.orderedBy === el) //arr with orders of this person(el) =>
                  .reduce((acc, el) => {
                    //returning object with prop
                    acc[el.name] = (acc[el.name] || 0) + 1; //ordered Book Name : amount
                    return acc;
                  }, {}),
              };
            });
            //creating html-element to render on a page
            let item;
            //on each iteration(each person) we do cycle on her(his) orders
            //and forming list of orders
            orders.forEach((el) => {
              let htmlList = "";
              Object.keys(el.orders).forEach((elem) => {
                // console.log(elem, el.orders[elem]);
                htmlList += `
            <li>${elem} - ${el.orders[elem]} pcs.</li>
            `;
              });
              //then adding this list to the html-element
              item = `
            <div class="item-content">
                  <h4>Person: ${el.orderedBy}</h4>
                  <p>Ordered books:</p>
                  <ul>
                    ${htmlList}
                  </ul>
                </div>
             `;
              //which is going to be inserted in particular place
              document
                .getElementById("list-of-orders")
                .insertAdjacentHTML("beforeend", item);
            });
            this.renderListOfOutdatedOrders();
            /*   let uniqueTest = {}
          orders[1].orders.forEach(el => {
          
           uniqueTest[el.name] = (uniqueTest[el.name] || 0) + 1
          })
        */
          };
        }
      };
    };
  };

  // 3- sign in method
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
            // add current user to active user store
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

  // 4 - Check active user to render elements(sign in sign up / log out buttons)
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
  // 5- check active user to render elements of user/admin page,
  // in the end calling method to render available books

  ativeUserProfileRender = () => {
    this.request = indexedDB.open(DB_NAME, DB_VERSION);
    this.request.onerror = this.onError;
    this.request.onsuccess = (e) => {
      this.db = e.target.result;
      this.transaction = this.db.transaction("activeUser");
      this.storeName = this.transaction.objectStore("activeUser");
      this.getRequest = this.storeName.getAll();
      this.getRequest.onsuccess = () => {
        if (
          this.getRequest.result.length === 1 &&
          (document.URL.includes("user.html") ||
            document.URL.includes("admin.html") ||
            location.pathname === "/user.html" ||
            location.pathname === "/admin.html")
        ) {
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

  // 6 - on click on profile link - checking if user logged in. If yes - redirecting
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

  // 7 - search
  //we submitting search request in adress line via 'get' method
  //then getting request from adress line on search page and run
  //renderSearchResults() method
  search = () => {
    this.request = indexedDB.open(DB_NAME, DB_VERSION);
    this.request.onerror = this.onError;
    this.request.onsuccess = (e) => {
      this.db = e.target.result;
      this.transaction = this.db.transaction("activeUser");
      this.storeName = this.transaction.objectStore("activeUser");
      this.getRequest = this.storeName.getAll();
      this.getRequest.onerror = this.onError;
      this.getRequest.onsuccess = () => {
        if (this.getRequest.result.length < 1) {
          alert("Please, log in to get access to search");
        } else {
          searchForm.submit();
        }
      };
    };
  };
  // 8 - render search results
  //we get input from address line submitted via form from another page(index, user or admin)
  renderSearchResults = (input) => {
    this.request = indexedDB.open(DB_NAME, DB_VERSION);
    this.request.onerror = this.onError;
    this.request.onsuccess = (e) => {
      this.db = e.target.result;
      this.transaction = this.db.transaction("activeUser");
      this.storeName = this.transaction.objectStore("activeUser");
      this.getRequest = this.storeName.getAll();
      this.getRequest.onerror = this.onError;
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
      this.transaction.oncomplete = () => {
        this.transaction = this.db.transaction("books");
        this.storeName = this.transaction.objectStore("books");
        this.getRequest = this.storeName.openCursor();
        this.getRequest.onerror = this.onError;
        this.getRequest.onsuccess = () => {
          if (!input) {
            return false;
          }

          document.getElementById("search-input").value =
            document.getElementById(
              "search-results-lable"
            ).innerHTML = `${input}`;
          this.cursor = this.getRequest.result;
          if (this.cursor) {
            this.bookName = this.cursor.value;

            if (
              this.bookName.name.toLowerCase().startsWith(input.toLowerCase())
            ) {
              let item = ` 
         <div class="book-wrapper">
        <button data-id='${
          this.bookName.name
        }' data-class='take-book-to-read-btn'>Take to read</button>
        <img src="${randomPhoto()}" alt="book" />
        <div>
          <p>Available ${this.bookName.availableCount}/${
                this.bookName.totalCount
              }</p>
          <h3>${this.bookName.name}</h3>
          <h4>${this.bookName.author}</h4>
          <p>
            ${this.bookName.description}
          </p>
        </div>
      </div>
      `;
              document
                .querySelector(".search-results-content")
                .insertAdjacentHTML("beforeend", item);
            }
            this.cursor.continue();
          } else {
            if (
              document
                .querySelector(".search-results-content")
                .textContent.trim() === ""
            ) {
              document.querySelector(
                ".search-results-content"
              ).innerHTML = `<p>Unfortunately nothing was found!</p>`;
            }
            console.log("cursor search finished");
          }
        };
      };
    };
  };
  // 9 - render outdated orders
  renderListOfOutdatedOrders = () => {
    this.request = indexedDB.open(DB_NAME, DB_VERSION);
    this.request.onerror = this.onError;
    this.request.onsuccess = (e) => {
      this.db = e.target.result;
      this.transaction = this.db.transaction("orders");
      this.storeName = this.transaction.objectStore("orders");
      this.getRequest = this.storeName.getAll();
      this.getRequest.onerror = this.onError;
      this.getRequest.onsuccess = () => {
        this.result = this.getRequest.result;
        this.date = new Date();
        this.result.forEach((el) => {
          if (
            Math.floor((el.dateTo - this.date) / (1000 * 60 * 60 * 24)) <= 0
          ) {
            let item = `
          <div class="item-content">
            <h4>Person: ${el.orderedBy}</h4>
            <p>Book: ${el.name}</p>
            <p style='color: red;'>Overdue: ${Math.abs(
              Math.floor((el.dateTo - this.date) / (1000 * 60 * 60 * 24))
            )} days</p>
          </div>
     `;
            document
              .getElementById("outDated-orders-content")
              .insertAdjacentHTML("beforeend", item);
          }
        });
        if (
          document
            .getElementById("outDated-orders-content")
            .textContent.trim() === ""
        ) {
          document.getElementById("outDated-orders-content").innerHTML = `
          <p>No outdated orders yet</p>
          `;
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

  //2 - delete book from library - for admin

  deleteBookFromLibrary = (bookName) => {
    this.name = bookName;
    this.request = indexedDB.open(DB_NAME, DB_VERSION);
    this.request.onerror = this.onError;
    this.request.onsuccess = (e) => {
      this.db = e.target.result;
      //getting primary key(id) of book from index 'name' of book
      this.transaction = this.db.transaction("books", "readwrite");
      this.storeName = this.transaction.objectStore("books");
      this.index = this.storeName.index("name");
      this.getRequest = this.index.getKey(this.name);
      this.getRequest.onerror = this.onError;
      this.getRequest.onsuccess = () => {
        this.bookId = this.getRequest.result;
        try {
          //deleting this book
          this.deleteRequest = this.storeName.delete(this.bookId);
          this.deleteRequest.onError = this.onError;
          this.deleteRequest.onsuccess = () => {
            this.transaction = this.db.transaction("orders", "readwrite");
            this.storeName = this.transaction.objectStore("orders");
            this.index = this.storeName.index("name");
            //then - deleting all orders of this book from orders store
            this.getRequest = this.index.getAllKeys(this.name);
            console.log(this.name);
            this.getRequest.onerror = this.onError;
            this.getRequest.onsuccess = () => {
              this.bookIds = this.getRequest.result;
              console.log(this.index, this.bookIds);
              this.bookIds.forEach((el) => {
                this.deleteRequest = this.storeName.delete(el);
              });

              this.deleteRequest.onerror = this.onError;
              this.deleteRequest.onsuccess = () => {
                alert("book was deleted");
                location.reload();
              };
            };
          };
        } catch {
          //error throwed if here is no inputed book name in book store
          alert("here is no such book");
        }
      };
    };
  };

  //4 - return book to the library(delete from the orders) - for user

  returnBook = (bookName) => {
    this.bookName = bookName;
    this.idToDelete = null;
    this.request = indexedDB.open(DB_NAME, DB_VERSION);
    this.request.onerror = this.onError;
    this.request.onsuccess = (e) => {
      this.db = e.target.result;
      //recongnize active user
      this.transaction = this.db.transaction("activeUser");
      this.storeName = this.transaction.objectStore("activeUser");
      this.getRequest = this.storeName.getAll();
      this.getRequest.onerror = this.onError;
      this.getRequest.onsuccess = () => {
        this.activeUser = this.getRequest.result[0].email;
        // then search in orders what did this user order
        this.transaction = this.db.transaction("orders", "readwrite");
        this.storeName = this.transaction.objectStore("orders");
        this.index = this.storeName.index("orderedBy");
        this.getRequest = this.index.getAll(this.activeUser);
        this.getRequest.onerror = this.onError;
        this.getRequest.onsuccess = () => {
          this.getRequest.result.forEach((el) => {
            //determine id of order in orders
            if (el.name === this.bookName) {
              this.idToDelete = el.id;
            }
          });
          //delete this order
          console.log(this.getRequest.result);
          console.log(this.idToDelete);
          this.deleteRequest = this.storeName.delete(this.idToDelete);
          this.deleteRequest.onerror = this.onError;
          this.deleteRequest.onsuccess = () => {
            //find id of this book in books
            this.transaction = this.db.transaction("books", "readwrite");
            this.storeName = this.transaction.objectStore("books");
            this.index = this.storeName.index("name");
            this.getRequest = this.index.get(this.bookName);
            this.getRequest.onerror = this.onError;
            this.getRequest.onsuccess = () => {
              this.bookData = this.getRequest.result;
              //change available count property + 1
              //and change this book`s data in books store
              this.bookData.availableCount += 1;
              this.changeRequest = this.storeName.put(this.bookData);
              this.changeRequest.onerror = this.onError;
              this.changeRequest.onsuccess = () => {
                alert("Book was successfully deleted from your orders");
                location.reload();
              };
            };
          };
        };
      };
    };
  };
  ///5 - Log out - clear active user store
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
}

const bookData = {
  /*  name: "js",
  description: "qweqwnot bad book",
  photo: null,
  totalCount: 10,
  avalCount: 5, */
};

const userData = {
  /*  name: "Admin",
  email: "admin@gmail.com",
  password: "admin",
  role: 101, */
};

//pick random photo for book render

function randomPhoto() {
  let pick = Math.floor(Math.random() * 4 + 1);

  switch (pick) {
    case 1:
      return "img/book-photo-1.png";
    case 2:
      return "img/book-photo-2.png";
    case 3:
      return "img/book-photo-3.png";
    case 4:
      return "img/book-photo-4.png";
  }
}
const dbConnection = new DBconnection();

dbConnection.open(() => {
  console.log("can work");
});

//Creating admin account
// adding 2 books to the store
/* setTimeout(() => {
  dbConnection.initialize()
}, 1000) */
