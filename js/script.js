/* ═══════════════════════════════════════════════════════════════════════════
   GDSC Africa University - JavaScript
   Mobile menu, navbar effects, and membership modal
═══════════════════════════════════════════════════════════════════════════ */

document.addEventListener("DOMContentLoaded", function () {
  // ═══════════════════════════════════════════════════════════════════════════
  // MOBILE MENU TOGGLE
  // ═══════════════════════════════════════════════════════════════════════════
  const mobileMenuBtn = document.getElementById("mobile-menu-btn");
  const mobileMenu = document.getElementById("mobile-menu");

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden");
    });

    // Close mobile menu when clicking a link
    const mobileLinks = mobileMenu.querySelectorAll("a");
    mobileLinks.forEach((link) => {
      link.addEventListener("click", () => {
        mobileMenu.classList.add("hidden");
      });
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // NAVBAR SCROLL EFFECT
  // ═══════════════════════════════════════════════════════════════════════════
  const nav = document.querySelector("nav");
  if (nav) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 50) {
        nav.classList.add("shadow-lg");
      } else {
        nav.classList.remove("shadow-lg");
      }
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MEMBERSHIP MODAL
  // ═══════════════════════════════════════════════════════════════════════════
  const membershipModal = document.getElementById("membership-modal");
  const openModalBtns = document.querySelectorAll("[data-open-modal]");
  const closeModalBtns = document.querySelectorAll("[data-close-modal]");

  // Open modal
  openModalBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      if (membershipModal) {
        membershipModal.classList.add("active");
        document.body.style.overflow = "hidden";
      }
    });
  });

  // Close modal
  closeModalBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (membershipModal) {
        membershipModal.classList.remove("active");
        document.body.style.overflow = "";
      }
    });
  });

  // Close modal when clicking overlay
  if (membershipModal) {
    membershipModal.addEventListener("click", (e) => {
      if (e.target === membershipModal) {
        membershipModal.classList.remove("active");
        document.body.style.overflow = "";
      }
    });
  }

  // Close modal with Escape key
  document.addEventListener("keydown", (e) => {
    if (
      e.key === "Escape" &&
      membershipModal &&
      membershipModal.classList.contains("active")
    ) {
      membershipModal.classList.remove("active");
      document.body.style.overflow = "";
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // BACK TO TOP BUTTON
  // ═══════════════════════════════════════════════════════════════════════════
  const backToTop = document.getElementById("back-to-top");
  if (backToTop) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 500) {
        backToTop.classList.remove("opacity-0", "invisible");
        backToTop.classList.add("opacity-100", "visible");
      } else {
        backToTop.classList.remove("opacity-100", "visible");
        backToTop.classList.add("opacity-0", "invisible");
      }
    });

    backToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ACTIVE NAV HIGHLIGHTING
  // ═══════════════════════════════════════════════════════════════════════════
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-link");

  window.addEventListener("scroll", () => {
    let current = "";
    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 100;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute("id");
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove("text-google-blue");
      if (link.getAttribute("href") === `#${current}`) {
        link.classList.add("text-google-blue");
      }
    });
  });
});
