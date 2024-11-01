let slideIndex = 1;
let slideInterval = setInterval(autoSlides, 5000); // Start automatic slideshow

showSlides(slideIndex);

// Next/previous controls
function plusSlides(n) {
  clearInterval(slideInterval); // Clear the current interval
  showSlides(slideIndex += n);
  resetSlideInterval2(); // Restart the interval
}

// Thumbnail image controls
function currentSlide(n) {
  clearInterval(slideInterval); // Clear the current interval
  showSlides(slideIndex = n);
  resetSlideInterval(); // Restart the interval
}

// Show the appropriate slide
function showSlides(n) {
  let i;
  let slides = document.getElementsByClassName("mySlides");
  let dots = document.getElementsByClassName("dot");
  
  if (n > slides.length) {slideIndex = 1}
  if (n < 1) {slideIndex = slides.length}
  
  // Hide all slides and remove the "active" class from dots
  for (i = 0; i < slides.length; i++) {
      slides[i].style.display = "none";
  }
  for (i = 0; i < dots.length; i++) {
      dots[i].className = dots[i].className.replace(" active", "");
  }
  
  // Display the current slide and activate the corresponding dot
  slides[slideIndex-1].style.display = "block";
  dots[slideIndex-1].className += " active";
}

// Automatic slide function
function autoSlides() {
  slideIndex++;
  showSlides(slideIndex);
}

// Reset the slideshow timer
function resetSlideInterval() {
  slideInterval = setInterval(autoSlides, 5000); // Restart automatic slideshow
}

function resetSlideInterval2() {
  slideInterval = setInterval(autoSlides, 10000); // Restart automatic slideshow
}
