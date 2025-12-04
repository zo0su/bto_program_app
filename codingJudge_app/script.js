document.addEventListener("DOMContentLoaded", () => {
  const yearEl = document.getElementById("current-year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  const filterButtons = document.querySelectorAll(".filter-btn");
  const cards = document.querySelectorAll(".gallery-card");

  const setActive = (category) => {
    filterButtons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.category === category || (category === "all" && btn.dataset.category === "all"));
    });

    cards.forEach((card) => {
      if (category === "all" || card.dataset.category === category) {
        card.style.display = "flex";
        card.classList.remove("gallery-card--hidden");
      } else {
        card.style.display = "none";
        card.classList.add("gallery-card--hidden");
      }
    });
  };

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      setActive(btn.dataset.category);
    });
  });

  setActive("all");
});

