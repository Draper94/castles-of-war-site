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
    // Pause the main trailer video if navigating away from slide 2 (index 1)
    if (idx === 1 && mainTrailerVideo && !mainTrailerVideo.paused) {
      mainTrailerVideo.pause();
      showMainCustomPlayButton();
    }
    if (slides[idx + 1]) slides[idx + 1].scrollIntoView({ behavior: "smooth" });
  });

  // Add keyboard support for image buttons
  if (btn.tagName === 'IMG') {
    btn.addEventListener("keydown", (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        // Pause the main trailer video if navigating away from slide 2 (index 1)
        if (idx === 1 && mainTrailerVideo && !mainTrailerVideo.paused) {
          mainTrailerVideo.pause();
          showMainCustomPlayButton();
        }
        if (slides[idx + 1]) slides[idx + 1].scrollIntoView({ behavior: "smooth" });
      }
    });
  }
});

// Trailer functionality
const trailerModal = document.getElementById('trailerModal');
const trailerVideo = document.getElementById('trailerVideo');
const closeTrailerBtn = document.getElementById('closeTrailerBtn');
const customPlayButton = document.getElementById('customPlayButton');

// Main trailer video (inline on first slide)
const mainTrailerVideo = document.getElementById('mainTrailerVideo');
const mainCustomPlayButton = document.getElementById('mainCustomPlayButton');

function openTrailerModal() {
  trailerModal.classList.add('show');
  document.body.style.overflow = 'hidden'; // Prevent background scrolling
  showModalCustomPlayButton(); // Show custom play button when modal opens
}

function closeTrailerModal() {
  trailerModal.classList.remove('show');
  trailerVideo.pause(); // Pause video when closing
  trailerVideo.currentTime = 0; // Reset to beginning
  document.body.style.overflow = ''; // Re-enable scrolling
  showModalCustomPlayButton(); // Reset custom play button for next time
}

function showModalCustomPlayButton() {
  if (customPlayButton) customPlayButton.classList.remove('hidden');
}

function hideModalCustomPlayButton() {
  if (customPlayButton) customPlayButton.classList.add('hidden');
}

function showMainCustomPlayButton() {
  if (mainCustomPlayButton) mainCustomPlayButton.classList.remove('hidden');
}

function hideMainCustomPlayButton() {
  if (mainCustomPlayButton) mainCustomPlayButton.classList.add('hidden');
}

// Event listeners for trailer modal
closeTrailerBtn.addEventListener('click', closeTrailerModal);

// Modal custom play button functionality
if (customPlayButton) {
  customPlayButton.addEventListener('click', () => {
    trailerVideo.play();
    hideModalCustomPlayButton();
  });
}

// Modal video event listeners
if (trailerVideo) {
  trailerVideo.addEventListener('play', hideModalCustomPlayButton);
  trailerVideo.addEventListener('pause', showModalCustomPlayButton);
  trailerVideo.addEventListener('ended', showModalCustomPlayButton);
}

// Main trailer video functionality (inline)
if (mainCustomPlayButton && mainTrailerVideo) {
  mainCustomPlayButton.addEventListener('click', () => {
    // Check if on mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 750;

    if (isMobile) {
      // Request fullscreen on mobile
      if (mainTrailerVideo.requestFullscreen) {
        mainTrailerVideo.requestFullscreen();
      } else if (mainTrailerVideo.webkitRequestFullscreen) {
        mainTrailerVideo.webkitRequestFullscreen();
      } else if (mainTrailerVideo.webkitEnterFullscreen) {
        // iOS Safari
        mainTrailerVideo.webkitEnterFullscreen();
      }
    }

    mainTrailerVideo.play();
    hideMainCustomPlayButton();
  });

  // Show/hide main custom play button based on video state
  mainTrailerVideo.addEventListener('play', hideMainCustomPlayButton);
  mainTrailerVideo.addEventListener('pause', showMainCustomPlayButton);
  mainTrailerVideo.addEventListener('ended', showMainCustomPlayButton);
}

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
      const buttonText = container.querySelector('.bottom-panel-text');
      const isWatchTrailerButton = buttonText && buttonText.textContent.includes('Watch Trailer');

      setTimeout(() => {
        if (isWatchTrailerButton) {
          // Apply continuous glow for Watch Trailer button
          container.classList.add('continuous-glow');
        } else {
          // Normal one-time glow for other buttons
          container.classList.add('glow-animation');
          setTimeout(() => {
            container.classList.remove('glow-animation');
          }, 1500);
        }
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

// Spark effect for logo clicks
const logo = document.getElementById('logo');
const sparkColors = ['spark-red', 'spark-blue', 'spark-yellow', 'spark-green', 'spark-purple', 'spark-orange'];

function createSparkEffect(x, y) {
  const sparkCount = 15 + Math.random() * 10; // 15-25 sparks

  for (let i = 0; i < sparkCount; i++) {
    const spark = document.createElement('div');
    spark.className = `spark ${sparkColors[Math.floor(Math.random() * sparkColors.length)]}`;

    // Position spark at click location
    spark.style.left = x + 'px';
    spark.style.top = y + 'px';

    // Calculate random pop direction (360 degrees)
    const angle = Math.random() * Math.PI * 2;
    const popDistance = 50 + Math.random() * 100; // 50-150px pop distance
    const popX = Math.cos(angle) * popDistance;
    const popY = Math.sin(angle) * popDistance;

    // Additional horizontal drift while falling
    const driftX = (Math.random() - 0.5) * 150;

    // Set CSS custom properties
    spark.style.setProperty('--pop-x', popX + 'px');
    spark.style.setProperty('--pop-y', popY + 'px');
    spark.style.setProperty('--drift-x', driftX + 'px');

    document.body.appendChild(spark);

    // Remove spark after animation
    setTimeout(() => {
      if (spark.parentNode) {
        spark.parentNode.removeChild(spark);
      }
    }, 2200);
  }
}

if (logo) {
  logo.addEventListener('click', (e) => {
    console.log('Logo clicked!'); // Debug log
    e.preventDefault();
    e.stopPropagation();
    // Use the actual click coordinates
    const x = e.clientX;
    const y = e.clientY;
    console.log('Creating sparks at:', x, y); // Debug log
    createSparkEffect(x, y);
  });
  console.log('Logo click listener added'); // Debug log
} else {
  console.log('Logo element not found!'); // Debug log
}

// Test function - remove this after debugging
document.addEventListener('keydown', (e) => {
  if (e.key === ' ' && e.shiftKey) {
    console.log('Test spark effect triggered');
    createSparkEffect(window.innerWidth / 2, 200);
  }
});

// Initial state
swapBackground(slides[0].dataset.bg, 0);
revealPanel(slides[0], 0);
triggerButtonGlow(slides[0], 0);
