

document.querySelectorAll(".accordBtn").forEach((el) => {
  el.addEventListener("click", function (e) {
    let content = this.nextElementSibling;
    if (content.style.maxHeight) {
      content.style.maxHeight = null;
    } else {
      content.style.maxHeight = content.scrollHeight + "px";
    }
  });
});

//add new book
const bookAddForm = document.getElementById("book-add-form");
const bookName = document.getElementById("input-book-name");
const bookAuthor = document.getElementById("input-book-author");
const bookAmount = document.getElementById("input-book-amount");
const bookDescription = document.getElementById("input-book-description");
const bookAddButton = document.getElementById("book-add-submit");
let bookData = {};
bookAddButton.addEventListener("click", function (e) {
  e.preventDefault();
  bookData.name = bookName.value;
  bookData.author = bookAuthor.value;
  bookData.amount = bookAmount.value;
  bookData.description = bookDescription.value;
console.log(bookData);
  dbConnection.addBookToStore(bookData, 10);
  bookAddForm.reset();
location.reload()
});


//delete book from library 

const bookNameInput = document.getElementById('deleteBookNameInput')
const deleteSubmitButton = document.getElementById('deleteSubmitButton')

deleteSubmitButton.addEventListener('click', function(e) {
e.preventDefault()
  let bookName = bookNameInput.value;
  dbConnection.deleteBookFromLibrary(bookName)
})