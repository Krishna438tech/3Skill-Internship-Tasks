// Portfolio loaded message
window.addEventListener("load", function () {
  console.log("Krishna Gopal Portfolio Loaded Successfully");
});

// Contact form submit message
let contactForm = document.querySelector(".contact-form");

if (contactForm) {
  contactForm.addEventListener("submit", function (event) {
    event.preventDefault();
    alert("Thank you! Your message has been submitted.");
    contactForm.reset();
  });
}

// Active navbar link on scroll
let sections = document.querySelectorAll("section");
let navLinks = document.querySelectorAll(".navbar ul li a");

window.addEventListener("scroll", function () {
  let current = "";

  sections.forEach(function (section) {
    let sectionTop = section.offsetTop - 160;

    if (window.scrollY >= sectionTop) {
      current = section.getAttribute("id");
    }
  });

  navLinks.forEach(function (link) {
    link.classList.remove("active");

    if (link.getAttribute("href") === "#" + current) {
      link.classList.add("active");
    }
  });
});