//  DOM references
const bg1 = document.getElementById("bg1");
const bg2 = document.getElementById("bg2");
const slides = Array.from(document.querySelectorAll(".slide"));

// Create main image divs and border containers for each background layer
const mainImage1 = document.createElement('div');
mainImage1.className = 'main-image';
bg1.appendChild(mainImage1);

const borderContainer1 = document.createElement('div');
borderContainer1.className = 'border-container';
bg1.appendChild(borderContainer1);

const mainImage2 = document.createElement('div');
mainImage2.className = 'main-image';
bg2.appendChild(mainImage2);

const borderContainer2 = document.createElement('div');
borderContainer2.className = 'border-container';
bg2.appendChild(borderContainer2);

let currentLayer = bg1;
let hiddenLayer = bg2;
let currentMainImage = mainImage1;
let hiddenMainImage = mainImage2;

//  helper: cross-fade without gaps
function swapBackground(imgUrl, slideIndex = 0) {
  if (
    currentLayer.dataset.currentBg &&
    currentLayer.dataset.currentBg === imgUrl
  )
    return;

  bg1.classList.remove("active");
  bg2.classList.remove("active");

  // Set the main background image on the main-image div
  currentMainImage.style.backgroundImage = `url(${imgUrl})`;

  // Load the image to get its dimensions
  const img = new Image();
  img.onload = function() {
    const width = `${this.naturalWidth}px`;
    const height = `${this.naturalHeight}px`;

    currentLayer.style.setProperty('--image-width', width);
    currentLayer.style.setProperty('--image-height', height);

    // Also set on document root so nav can access these variables
    document.documentElement.style.setProperty('--image-width', width);
    document.documentElement.style.setProperty('--image-height', height);
  };
  img.src = imgUrl;

  // Set colors based on slide index (you can customize these per slide)
  const slideColors = [
    { top: '#4D8BFF', bottom: '#0D0E20' }, // Slide 1
    { top: '#4D8BFF', bottom: '#0D0E20' }, // Slide 2
    { top: '#D8C9C0', bottom: '#130E18' }, // Slide 3
    { top: '#180900', bottom: '#130E18' }, // Slide 4
    { top: '#000000', bottom: '#0A0B18' }, // Slide 5
  ];

  const colors = slideColors[slideIndex] || slideColors[0];
  currentLayer.style.setProperty('--top-color', colors.top);
  currentLayer.style.setProperty('--bottom-color', colors.bottom);

  currentLayer.dataset.currentBg = imgUrl;
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
        swapBackground(e.target.dataset.bg, idx);
        revealPanel(e.target, idx);

        // Hide main logo for all slides except the first one (index 0)
        if (idx >= 1) {
          document.body.classList.add('hide-logo');
          document.body.classList.add('hide-vashta-link');
        } else {
          document.body.classList.remove('hide-logo');
          document.body.classList.remove('hide-vashta-link');
        }

        if (idx >= 1) {
          document.body.classList.add('show-nav-logo');
        } else {
          document.body.classList.remove('show-nav-logo');
        }

        // Trigger glow animation for buttons in the current slide
        triggerButtonGlow(e.target, idx);
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
document.querySelectorAll(".nextSlideBtn").forEach((btn, idx) => {
  btn.addEventListener("click", () => {
    if (slides[idx + 1]) slides[idx + 1].scrollIntoView({ behavior: "smooth" });
  });

  // Add keyboard support for image buttons
  if (btn.tagName === 'IMG') {
    btn.addEventListener("keydown", (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (slides[idx + 1]) slides[idx + 1].scrollIntoView({ behavior: "smooth" });
      }
    });
  }
});

// Trailer modal functionality
const trailerModal = document.getElementById('trailerModal');
const trailerVideo = document.getElementById('trailerVideo');
const playTrailerBtn = document.getElementById('playTrailerBtn');
const closeTrailerBtn = document.getElementById('closeTrailerBtn');

function openTrailerModal() {
  trailerModal.classList.add('show');
  document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function closeTrailerModal() {
  trailerModal.classList.remove('show');
  trailerVideo.pause(); // Pause video when closing
  trailerVideo.currentTime = 0; // Reset to beginning
  document.body.style.overflow = ''; // Re-enable scrolling
}

// Event listeners for trailer modal
playTrailerBtn.addEventListener('click', openTrailerModal);
closeTrailerBtn.addEventListener('click', closeTrailerModal);

// Close modal when clicking outside the video
trailerModal.addEventListener('click', (e) => {
  if (e.target === trailerModal) {
    closeTrailerModal();
  }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && trailerModal.classList.contains('show')) {
    closeTrailerModal();
  }
});

// Function to trigger button glow animation
function triggerButtonGlow(slide, slideIndex) {
  // Small delay to let the slide transition settle
  setTimeout(() => {
    // Find different types of buttons in the current slide
    const playTrailerBtn = slide.querySelector('#playTrailerBtn');
    const unitButtons = slide.querySelectorAll('.unit-button');
    const bottomPanelContainers = slide.querySelectorAll('.bottom-panel-container');

    let buttonIndex = 0;

    // Animate play trailer button
    if (playTrailerBtn) {
      setTimeout(() => {
        playTrailerBtn.classList.add('glow-animation');
        setTimeout(() => {
          playTrailerBtn.classList.remove('glow-animation');
        }, 1500);
      }, buttonIndex * 200);
      buttonIndex++;
    }

    // Animate unit buttons
    unitButtons.forEach((button) => {
      setTimeout(() => {
        button.classList.add('glow-animation');
        setTimeout(() => {
          button.classList.remove('glow-animation');
        }, 1500);
      }, buttonIndex * 200);
      buttonIndex++;
    });

    // Animate bottom panel text only (not the container)
    bottomPanelContainers.forEach((container) => {
      setTimeout(() => {
        container.classList.add('glow-animation');
        setTimeout(() => {
          container.classList.remove('glow-animation');
        }, 1500);
      }, buttonIndex * 200);
      buttonIndex++;
    });
  }, 300); // Initial delay
}

// Unit button functionality
const unitButtons = document.querySelectorAll('.unit-button');
const unitDescription = document.getElementById('unitDescription');

const unitInfo = {
  spearman: "Fast and agile warriors armed with spears. They excel at quick strikes and are cheap to hire. Their balance stats makes them perfect for any growing army.",
  archer: "Ranged specialists who rain arrows from a distance. They can attack enemies before they get close and are excellent for defending fortifications from enemy assaults.",
  knight: "Heavy armored units with high damage close range weapons. Though slow, these elite warriors are a devastating force and can break through enemy lines.",
  catapult: "Powerful siege engines designed to destroy enemy fortifications. They can demolish walls and towers from a safe distance, clearing the way for your army.",
  builder: "Essential support units who construct and repair buildings. They build defensive structures, expand your base, and maintain your kingdom's infrastructure."
};

function selectUnit(unitType) {
  // Remove active class from all buttons
  unitButtons.forEach(btn => btn.classList.remove('active'));

  // Add active class to clicked button
  const clickedButton = document.querySelector(`[data-unit="${unitType}"]`);
  if (clickedButton) {
    clickedButton.classList.add('active');
  }

  // Update description
  unitDescription.textContent = unitInfo[unitType] || "Select a unit to learn more about their abilities and role in battle.";
}

// Add click event listeners to unit buttons
unitButtons.forEach(button => {
  button.addEventListener('click', () => {
    const unitType = button.dataset.unit;

    // Toggle functionality - if already active, deselect
    if (button.classList.contains('active')) {
      button.classList.remove('active');
      unitDescription.textContent = "Select a unit to learn more about their abilities and role in battle.";
    } else {
      selectUnit(unitType);
    }
  });
});

// Initial state
swapBackground(slides[0].dataset.bg, 0);
revealPanel(slides[0], 0);
triggerButtonGlow(slides[0], 0);
