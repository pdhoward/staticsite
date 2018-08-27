(function() {
  // This function needs to work across all browsers
  var enableHamburgerToggle = function() {
    var burger = document.querySelector(".burger");
    var menu = document.querySelector("#" + burger.getAttribute("target"));
    burger.addEventListener("click", function() {
      burger.classList.toggle("is-active");
      menu.classList.toggle("is-active");
    });
  };

  // can use ES2015 here
  var setNavbarActiveLink = function() {
    var path = window.location.pathname;
    var page = path.split("/").pop();

    var navbarMenu = document.querySelector("#navbarMenu");
    var navbarMenuLinks = navbarMenu.getElementsByTagName("a");

    for (let link of navbarMenuLinks) {
      var linkFileName = link
        .getAttribute("href")
        .split("/")
        .pop();

      if (page === linkFileName || ((page === "" || page === "index.html") && linkFileName === "")) {
        link.classList.add("is-active");
        link.classList.add("is-item-active");
      } else {
        link.classList.remove("is-active");
        link.classList.remove("is-item-active");
      }
    }
  };

  enableHamburgerToggle();
  setNavbarActiveLink();
})();
