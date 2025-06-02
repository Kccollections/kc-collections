let slideIndex = 0;
showSlides();

function showSlides() {
    let slides = document.querySelectorAll('.slide');
    let dots = document.querySelectorAll('.dot');

    // Hide all slides
    for (let i = 0; i < slides.length; i++) {
        slides[i].style.display = 'none';
    }

    // Increment slide index
    slideIndex++;
    if (slideIndex > slides.length) {
        slideIndex = 1; // Reset to the first slide
    }

    // Deactivate all dots
    for (let i = 0; i < dots.length; i++) {
        dots[i].classList.remove('active');
    }

    // Show the current slide and activate the corresponding dot
    slides[slideIndex - 1].style.display = 'block';
    dots[slideIndex - 1].classList.add('active');

    // Change slides every 3 seconds (optional)
    setTimeout(showSlides, 5000);
}