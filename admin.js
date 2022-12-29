//add new book
const bookAddForm = document.getElementById("book-add-form");
const bookName = document.getElementById("input-book-name");
const bookAuthor = document.getElementById("input-book-author");
const bookAmount = document.getElementById("input-book-amount");
const bookDescription = document.getElementById("input-book-description");
const bookAddButton = document.getElementById("book-add-submit");

bookAddButton.addEventListener("click", function (e) {
  e.preventDefault();
  bookData.name = bookName.value;
  bookData.author = bookAuthor.value;
  bookData.totalCount = bookAmount.value;
  bookData.availableCount = bookAmount.value;
  bookData.description = bookDescription.value;
  console.log(bookData);
  dbConnection.addBookToStore(bookData);
  bookAddForm.reset();
  location.reload();
});

//delete book from library

const bookNameInput = document.getElementById("deleteBookNameInput");
const deleteSubmitButton = document.getElementById("deleteSubmitButton");

deleteSubmitButton.addEventListener("click", function (e) {
  e.preventDefault();
  let bookName = bookNameInput.value;
  dbConnection.deleteBookFromLibrary(bookName);
});
