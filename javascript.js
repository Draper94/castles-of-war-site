//  DOM references
const bg1 = document.getElementById("bg1");
const bg2 = document.getElementById("bg2");
const slides = Array.from(document.querySelectorAll(".slide"));

let currentLayer = bg1;
let hiddenLayer = bg2;

//  helper: cross-fade without gaps
function swapBackground(imgUrl) {
  if (
    currentLayer.style.backgroundImage &&
    currentLayer.style.backgroundImage.includes(imgUrl)
  )
    return;

  bg1.classList.remove("active");
  bg2.classList.remove("active");

  currentLayer.style.backgroundImage = `url(${imgUrl})`;
  currentLayer.classList.add("active");
}

//  helper: slide panels in from L / R
function revealPanel(slide, idx) {
  const p = slide.querySelector(".pixel-panel");
  p.classList.remove("slide-in-left", "slide-in-right");
  void p.offsetWidth; // restart animation
  p.classList.add(idx % 2 ? "slide-in-right" : "slide-in-left");
}

//  observe slides
const observer = new IntersectionObserver(
  (entries) =>
    entries.forEach((e) => {
      if (e.isIntersecting) {
        const idx = slides.indexOf(e.target);
        swapBackground(e.target.dataset.bg);
        revealPanel(e.target, idx);
        
        // Hide main logo for all slides except the first one (index 0)
        if (idx >= 1) {
          document.body.classList.add('hide-logo');
        } else {
          document.body.classList.remove('hide-logo');
        }

        if (idx >= 1) {
          document.body.classList.add('show-nav-logo');
        } else {
          document.body.classList.remove('show-nav-logo');
        }
      }
    }),
  { threshold: 0.6 }
);
slides.forEach((s) => observer.observe(s));

//   nav + buttons
document.getElementById("homeLink").addEventListener("click", (e) => {
  e.preventDefault();
  slides[0].scrollIntoView({ behavior: "smooth" });
});
document.querySelectorAll(".nextSlideBtn").forEach((btn, idx) =>
  btn.addEventListener("click", () => {
    if (slides[idx + 1]) slides[idx + 1].scrollIntoView({ behavior: "smooth" });
  })
);

// Initial state
currentLayer.style.backgroundImage = `url(${slides[0].dataset.bg})`;
currentLayer.classList.add("active"); // show immediately
revealPanel(slides[0], 0);
