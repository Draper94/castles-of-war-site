const bg1 = document.getElementById("bg1");
const bg2 = document.getElementById("bg2");
const slides = Array.from(document.querySelectorAll(".slide"));

let currentLayer = bg1;
let hiddenLayer = bg2;

function swapBackground(imgUrl) {
  if (currentLayer.style.backgroundImage.includes(imgUrl)) return;

  hiddenLayer.style.backgroundImage = `url(${imgUrl})`;
  hiddenLayer.classList.add("active");
  currentLayer.classList.remove("active");
  [currentLayer, hiddenLayer] = [hiddenLayer, currentLayer];
}

function revealPanel(slide, index) {
  const panel = slide.querySelector(".panel");
  panel.classList.remove("slide-in-left", "slide-in-right");
  void panel.offsetWidth;
  panel.classList.add(index % 2 ? "slide-in-right" : "slide-in-left");
}

// Observe slide visibility and update visuals
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const idx = slides.indexOf(entry.target);
        swapBackground(entry.target.dataset.bg);
        revealPanel(entry.target, idx);
      }
    });
  },
  { threshold: 0.6 }
);

slides.forEach((slide) => observer.observe(slide));

// Home button scrolls to top
document.getElementById('homeLink').addEventListener('click', e => {
  e.preventDefault();
  slides[0].scrollIntoView({ behavior: 'smooth' });
});

// All slide buttons scroll to next slide
document.querySelectorAll(".nextSlideBtn").forEach((btn, idx) => {
  btn.addEventListener("click", () => {
    if (slides[idx + 1]) {
      slides[idx + 1].scrollIntoView({ behavior: "smooth" });
    }
  });
});

// Initial state
swapBackground(slides[0].dataset.bg);
revealPanel(slides[0], 0);
