// js/ui.js

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements for UI
    const planJourneyBtn = document.getElementById('plan-journey-btn');
    const authModal = document.getElementById('auth-modal');
    const authClose = document.getElementById('auth-close');
    const authTabs = document.querySelectorAll('.auth-tab');
    const authForms = document.querySelectorAll('.auth-form');
    const carouselTrack = document.querySelector('.carousel-track');
    const slides = document.querySelectorAll('.carousel-slide');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const indicators = document.querySelectorAll('.indicator');
    
    let currentSlide = 0;

    // --- EVENT LISTENERS for UI ---

    // Smooth scroll and open auth modal
    if (planJourneyBtn) {
        planJourneyBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const appContent = document.getElementById('app-content');
            if (appContent) {
                appContent.scrollIntoView({ behavior: 'smooth' });
            }
            // After scrolling, open the modal
            setTimeout(() => {
                 authModal.classList.add('active');
            }, 500); // Small delay to allow scroll to start
        });
    }

    // Modal controls
    if (authClose) {
        authClose.addEventListener('click', () => {
            authModal.classList.remove('active');
        });
    }
    window.addEventListener('click', (e) => {
        if (e.target === authModal) {
            authModal.classList.remove('active');
        }
    });

    // Auth tabs switching
    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            authTabs.forEach(t => t.classList.remove('active'));
            authForms.forEach(f => f.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(`${tabName}-form`).classList.add('active');
            // Reset error/success messages
            document.querySelectorAll('.auth-error, .auth-success').forEach(el => el.classList.remove('active'));
        });
    });

    // --- CAROUSEL LOGIC ---
    function updateCarousel() {
        if (carouselTrack) {
            carouselTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
            indicators.forEach((indicator, index) => {
                indicator.classList.toggle('active', index === currentSlide);
            });
        }
    }

    function nextSlide() {
        if (slides.length > 0) {
            currentSlide = (currentSlide + 1) % slides.length;
            updateCarousel();
        }
    }

    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (slides.length > 0) {
                currentSlide = (currentSlide - 1 + slides.length) % slides.length;
                updateCarousel();
            }
        });
    }

    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            currentSlide = index;
            updateCarousel();
        });
    });

    setInterval(nextSlide, 5000); // Auto-play carousel
});