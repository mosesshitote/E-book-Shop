//The first class is the category Manager. It handles the 
//logic on the category Page
function CategoryManager() {

  this.categories = [];
  this.currentCategory = false;
  //We use an API that was created by the mentors of origin Berlin
  this.url = "http://api.origin.berlin/category";
  this.menu = $("#category-menu");

  //Init file to initialize the class
  this.init = function() {
    this.loadCategories();
  }
  //Getting the data from the API
  this.loadCategories = function() {
    var that = this;
    $.getJSON(this.url, function(data) {
      that.categories = data;
      that.addMenuItems();
      that.setCurrentCategory();
    })
    //Load as soon as the page gets loaded
    $(document).trigger("category_load");
  }

  //Adding the Menu Items to the NavBar
  this.addMenuItems = function() {
    var that = this;

    //For each of the categories
    $.each(this.categories, function(index, category) {
      //A list item with the class "nav-item" is created
      var li = $("<li>").addClass("nav-item");
      //An anchor tag with class "nav-link" is created. This link gets assigned the href attribute of the Category Id. And gets the category name
      var a = $("<a>").addClass("nav-link").attr("href", "category.html?catID=" + category.id).text(category.name).appendTo(li);
      that.menu.append(li);
    });
    $(document).trigger("category_menuAdded");
  }

  //By clicking on one of the categories
  this.setCurrentCategory = function() {
    var that = this;
    //There has to be a param in the url in order to assign the correct data
    if (!shopManager.urlParams.catID) return; // break if there is no param in the URL!
    $.each(this.categories, function(index, category) {
      if (category.id == shopManager.urlParams.catID) {
        that.currentCategory = category;
        $(".category-name").text(category.name);
      }
    });

    $(document).trigger("category_currentSet");
  }

}

//The class that handles the logic for the books
function BookManager() {

  this.currentBook = false;
  this.url = "http://api.origin.berlin/book";
  this.books = [];
  this.container = $("#book-container");

  this.init = function() {
    var that = this;

    $(document).on("category_currentSet", function() {
      that.addBooks();
    });

    this.loadBooks();
  }

  this.loadBooks = function() {
    var that = this;

    $.getJSON(this.url, function(data) {
      that.books = data;
      that.setCurrentBook();
      that.addBooks();
    });
  }

  this.addBooks = function() {
    var that = this;
    //For each of the books we create a div with image etc.
    $.each(this.books, function(index, book) {
      if (book.category_id == shopManager.categoryManager.currentCategory.id || shopManager.categoryManager.currentCategory == false) {
        var div = $("<div>").addClass("col-3");
        $("<img>").attr("src", book.image).addClass("img-fluid").appendTo(div);
        var p = $("<p>").appendTo(div);
        $("<a>").attr("href", "detail.html?book=" + book.slug).text(book.title).appendTo(p);
        that.container.append(div);
      }
    })
  }

  this.setCurrentBook = function() {
    var that = this;

    if (!shopManager.urlParams.book) return; // break if there is no param in the URL!
    //If you click on the book, the params carry the data. So the single page view; The "detail" page.
    $.each(this.books, function(index, book) {
      if (book.slug == shopManager.urlParams.book) {
        that.currentBook = book;
        $(".book-image").attr("src", that.currentBook.image);
        $(".book-title").text(that.currentBook.title);
        $(".book-author").text(that.currentBook.author);
        $(".book-price").text(that.currentBook.price);
        $(".book-year").text(that.currentBook.date);
        $(".book-reviews").text("(" + that.currentBook.reviews + " reviews)");
        $(".book-ratings").text(that.currentBook.rating);
        return;
      }
    });
  }
}

function CartManager() {

  this.cart = [];
  this.checkoutButton = $("#checkoutButton");
  this.container = $("#shoppingCart");
  this.cartButton = $(".cart-amount");

  //In the Cart Manager we us e the local storage to store the cart items
  this.init = function() {
    var that = this;
    //This shows what's in the cart from the local storage
    that.cart = (localStorage.getItem("cart")) ? JSON.parse(localStorage.getItem("cart")) : [];
    that._updateCartIcon();
    $(".cart-amount").text(this.cart.length);

    $(".cart-add").on("click", function() {
      that.addItem(shopManager.bookManager.currentBook);
    });
    $(".cart-checkout").on("click", function() {
      that.checkout();
    });
    $(".cart-clear").on("click", function() {
      that.clear();
    });
    $(document).on("click", ".cart-delete-item", function() {
      that.deleteItem($(this).data("index"));
    });
    that.display();
  }
  //this shows the view of the cart container
  this.display = function() {
    var that = this;
    var total = 0;
    //Nothing in the container
    that.container.html("");
    $.each(that.cart, function(index, item) {
      //for each of the items in the cart we build a table row
      var row = $("<tr>");
      $("<td>").text(item.id).appendTo(row);
      $("<td>").html($("<img>").attr("src", item.image)).appendTo(row);
      $("<td>").text(item.title).appendTo(row);
      $("<td>").text(item.author).appendTo(row);
      $("<td>").text(item.price).appendTo(row);
      var closeButton = $("<button>").addClass("btn btn-outline-warning cart-delete-item").html("&times;").attr("data-index", index);
      $("<td>").html(closeButton).appendTo(row);
      that.container.append(row);
      total += item.price;
    });
    $(".cart-total").text(total);
  }

  //Here are the methods to update the cart. Each time this.updateStorage() gets called
  this.deleteItem = function(itemIndex) {
    this.cart.splice(itemIndex, 1);
    this._updateStorage();
  }

  this.addItem = function(item) {
    this.cart.push(item);
    this._updateStorage();
    window.location.href = "cart.html";
  }

  this.clear = function() {
    this.cart = [];
    this._updateStorage();
    window.location.href = "index.html";
  }

  this.checkout = function() {
    alert("Thanks!");
    this.clear();
  }
  //This updates the data in the local storage with setItem("cart", JSON.stringify)
  this._updateStorage = function() {
    localStorage.setItem("cart", JSON.stringify(this.cart));
    this._updateCartIcon();
    this.display();
  }
  //Depending on many items there are in the cart!
  this._updateCartIcon = function() {
    this.cartButton.text(this.cart.length);
    this.cartButton.parent().toggleClass("text-success", this.cart.length != 0)
  }

}

//The instances for the 3 handlers
function ShopManager() {

  this.cartManager = new CartManager();
  this.bookManager = new BookManager();
  this.categoryManager = new CategoryManager();
  this.urlParams = {};

  this.init = function() {
    this.parseURL();
    this.cartManager.init();
    this.bookManager.init();
    this.categoryManager.init();
  }

  //Function for determining the url params
  this.parseURL = function() {
    var that = this;
    window.location.search.replace(
      new RegExp("([^?=&]+)(=([^&]*))?", "g"),
      function($0, $1, $2, $3) {
        that.urlParams[$1] = $3;
      }
    );
  }

}
//Instantiate the Shopmanager which in turn instantiates the 3 handlers
var shopManager = new ShopManager();
shopManager.init();