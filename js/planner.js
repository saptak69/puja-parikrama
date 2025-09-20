// js/planner.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyADfl-XJ7atFkgJSas2l2ucOvSk4t_9iLY", // Replace with your actual API key if needed
    authDomain: "puja-parikrama-10c49.firebaseapp.com",
    projectId: "puja-parikrama-10c49",
    storageBucket: "puja-parikrama-10c49.appspot.com",
    messagingSenderId: "158658583532",
    appId: "1:158658583532:web:6f997a14c8814c59b47ec9"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// =======================================================
// ============= FIREBASE AUTH (MODIFIED) ==============
// =======================================================
// These are now outside DOMContentLoaded to be accessible globally
const userPic = document.getElementById("userPic");
const userName = document.getElementById("userName");
const userEmail = document.getElementById("userEmail");
const signOutBtn = document.getElementById("sign-out-btn");

// replace the old onAuthStateChanged block with this
onAuthStateChanged(auth, (user) => {
  // helper that safely shows the body once DOM is ready
  const showBody = () => {
    try { document.body.style.display = "block"; } catch (e) { /* ignore */ }
  };

  if (user) {
    // User signed in -> populate profile fields if present
    if (userPic) userPic.src = user.photoURL || 'https://i.pravatar.cc/150';
    if (userName) userName.textContent = user.displayName || "No Name";
    if (userEmail) userEmail.textContent = user.email;

    // If DOM already loaded, show immediately; otherwise wait for DOMContentLoaded
    if (document.readyState === "complete" || document.readyState === "interactive") {
      showBody();
    } else {
      window.addEventListener("DOMContentLoaded", showBody, { once: true });
    }
  } else {
    // Not logged in -> redirect to login and keep page hidden
    // Use replace() so back button won't show the protected page
    window.location.replace("index.html");
  }
});



if (signOutBtn) {
    signOutBtn.addEventListener('click', () => {
        signOut(auth).then(() => {
            console.log('User signed out successfully');
            // The onAuthStateChanged listener will handle the redirect.
        }).catch((error) => {
            console.error('Sign out error', error);
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const KOLKATA_DIVIDING_LATITUDE = 22.56;
    const PANDAL_VISIT_DURATION_MINS = 20;
    const AVG_WALKING_SPEED_KMPH = 4.5;

    // --- DATABASE ---
    let pandalData = [];
    let startingPoints = {};
    let currentSuggestedItinerary = [];
    let myPlanItinerary = [];

    // --- DOM Elements ---
    const pandalSearchInput = document.getElementById('pandal-search');
    const searchResultsContainer = document.getElementById('search-results');
    const generateBtn = document.getElementById('generate-plan-btn');
    const startPointSelect = document.getElementById('start-point');
    const areaRadioButtons = document.querySelectorAll('input[name="area"]');
    const pandalListElement = document.getElementById('pandal-list');
    const myPlanListElement = document.getElementById('my-plan-list');
    const emptyPlanElement = document.getElementById('empty-plan');
    const showAllOnMapBtn = document.getElementById('show-all-on-map');
    const suggestedGmapsLink = document.getElementById('suggested-gmaps-link');
    const customGmapsLink = document.getElementById('custom-gmaps-link');
    const routeSummary = document.getElementById('route-summary');
    const totalDistanceEl = document.getElementById('total-distance');
    const totalTimeEl = document.getElementById('total-time');
    const pandalsCountEl = document.getElementById('pandals-count');
    const pdfBtn = document.getElementById('pdf-btn');
    const shareBtn = document.getElementById('share-btn');
    const planActions = document.getElementById('plan-actions');
    const suggestedPdfBtn = document.getElementById('suggested-pdf-btn');
    const suggestedShareBtn = document.getElementById('suggested-share-btn');
    const suggestedActions = document.getElementById('suggested-actions');
    const galleryGrid = document.getElementById('gallery-grid');
    const modal = document.getElementById('pandal-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalDescription = document.getElementById('modal-description');
    const modalGallery = document.getElementById('modal-gallery');
    const modalDetails = document.getElementById('modal-details');
    const closeModal = document.querySelector('.close');
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightbox-image');
    const navItems = document.querySelectorAll('.nav-item');
    const planView = document.getElementById('plan-view');
    const galleryView = document.getElementById('gallery-view');
    const mapView = document.getElementById('map-view');
    const mahavidyaView = document.getElementById('mahavidya-view');
    const profileView = document.getElementById('profile-view');
    let map = null;
    let mapMarkers = {};
    let mapPolyline = null;
    const mapOverlayContainer = document.getElementById('map-overlay-list-container');
    const mapOverlayList = document.getElementById('map-overlay-list');
    const gallerySearchInput = document.getElementById('gallery-search-input'); // NEW CODE

    // --- EVENT LISTENERS ---
    generateBtn.addEventListener('click', () => {
    const sortedPandals = generateSortedList();
    currentSuggestedItinerary = applyTimings(sortedPandals);
    renderSuggestedItinerary(currentSuggestedItinerary);
    updateRouteSummary(currentSuggestedItinerary);
    updateMap(currentSuggestedItinerary, true);
    
    // FINAL VERSION: Precise scroll to the top of the section
    setTimeout(() => {
        const itinerariesSection = document.getElementById('itineraries-section');
        if (itinerariesSection) {
            itinerariesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 100);
});
    areaRadioButtons.forEach(radio => {
        radio.addEventListener('change', (e) => {
            updateStartPointsDropdown(e.target.value);
            const areaName = e.target.value;
            const buttonText = areaName === 'All' ? 'All Areas' : `${areaName} Kolkata`;
            showAllOnMapBtn.textContent = `Show All ${buttonText} Pandals`;
        });
    });
    pandalListElement.addEventListener('click', e => { if (e.target.closest('.add-btn')) handleAddToPlan(e); });
    myPlanListElement.addEventListener('click', e => { if (e.target.closest('.remove-btn')) handleRemoveFromPlan(e); });
    pdfBtn && pdfBtn.addEventListener('click', () => generatePDF(myPlanItinerary, 'my-plan'));
    suggestedPdfBtn && suggestedPdfBtn.addEventListener('click', () => generatePDF(currentSuggestedItinerary, 'suggested'));
    shareBtn && shareBtn.addEventListener('click', () => shareItinerary(myPlanItinerary));
    suggestedShareBtn && suggestedShareBtn.addEventListener('click', () => shareItinerary(currentSuggestedItinerary));
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const view = item.dataset.view;
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            [planView, galleryView, mapView, mahavidyaView, profileView].forEach(v => v.classList.remove('active')); // Added profileView
            if (view === 'plan') planView.classList.add('active');
            if (view === 'gallery') {
                galleryView.classList.add('active');
                renderGallery();
            }
            if (view === 'mahavidya') mahavidyaView.classList.add('active');
            if (view === 'profile') profileView.classList.add('active'); // Added handler for profile view
            if (view === 'map') {
                mapView.classList.add('active');
                if (!map) initializeMap();
                setTimeout(() => map.invalidateSize(), 100);
                mapView.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
    showAllOnMapBtn.addEventListener('click', () => {
        const selectedArea = document.querySelector('input[name="area"]:checked').value;
        const filteredPandals = selectedArea === 'All' ? pandalData : pandalData.filter(p => p.area === selectedArea);
        updateMap(filteredPandals, false);
    });
    closeModal.addEventListener('click', () => modal.style.display = 'none');
    
    // MODIFIED: Added donationModal to the click listener
    const donationModal = document.getElementById('donation-modal');
    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
        if (e.target === lightbox) lightbox.style.display = 'none';
        if (e.target === donationModal) donationModal.classList.remove('active');
    });
    
    // NEW CODE START
    if (gallerySearchInput) {
        gallerySearchInput.addEventListener('input', () => {
            const query = gallerySearchInput.value.toLowerCase().trim();
            const galleryItems = document.querySelectorAll('#gallery-grid .gallery-item');

            galleryItems.forEach(item => {
                const pandalNameElement = item.querySelector('.gallery-item-info h3');
                if (pandalNameElement) {
                    const pandalName = pandalNameElement.textContent.toLowerCase();
                    // If the pandal name includes the search query, show the item, otherwise hide it.
                    if (pandalName.includes(query)) {
                        item.style.display = 'block';
                    } else {
                        item.style.display = 'none';
                    }
                }
            });
        });
    }
    // NEW CODE END

    // =======================================================
    // ============ SEARCH LOGIC (NEW/MODIFIED) ============
    // =======================================================
    pandalSearchInput.addEventListener('input', () => {
        const query = pandalSearchInput.value.toLowerCase();
        if (!query) {
            searchResultsContainer.style.display = 'none';
            return;
        }
        const matchedPandals = pandalData.filter(p => p.name.toLowerCase().includes(query));

        if (matchedPandals.length > 0) {
            searchResultsContainer.innerHTML = matchedPandals.map(pandal =>
                `<div class="search-result-item" data-lat="${pandal.lat}" data-lon="${pandal.lon}">
                    ${pandal.name}
                 </div>`
            ).join('');
            searchResultsContainer.style.display = 'block';
        } else {
            searchResultsContainer.style.display = 'none';
        }
    });

    searchResultsContainer.addEventListener('click', (e) => {
        const target = e.target.closest('.search-result-item');
        if (target) {
            const lat = target.dataset.lat;
            const lon = target.dataset.lon;
            const url = `https://www.google.com/maps?q=${lat},${lon}`;
            window.open(url, '_blank'); // Open in a new tab
            pandalSearchInput.value = ''; // Clear search input
            searchResultsContainer.style.display = 'none'; // Hide results
        }
    });

    // Hide search results when clicking elsewhere
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-bar-container')) {
            searchResultsContainer.style.display = 'none';
        }
    });


    // --- CORE LOGIC & RENDER FUNCTIONS ---
    function generateAndClassifyPandals(corePandals) {
        pandalData = corePandals.map(p => ({ 
            ...p, 
            id: `${p.lat}-${p.lon}`, 
            area: p.lat < KOLKATA_DIVIDING_LATITUDE ? 'South' : 'North' 
        }));
    }
    
    function generateSortedList() {
        const selectedArea = document.querySelector('input[name="area"]:checked').value;
        const filteredPandals = (selectedArea === 'All') ? pandalData : pandalData.filter(p => p.area === selectedArea);
        let remainingPandals = [...filteredPandals], sortedPandals = [], currentPoint = startingPoints[startPointSelect.value];
        while (remainingPandals.length > 0) {
            remainingPandals.sort((a, b) => calculateDistance(currentPoint.lat, currentPoint.lon, a.lat, a.lon) - calculateDistance(currentPoint.lat, currentPoint.lon, b.lat, b.lon));
            const nextPandal = remainingPandals.shift();
            sortedPandals.push(nextPandal);
            currentPoint = nextPandal;
        }
        return sortedPandals;
    }
    function applyTimings(pandalList) {
        const { startTime, endTime } = getStartEndTimes();
        let currentTime = new Date(startTime), lastCoords = startingPoints[startPointSelect.value], finalItinerary = [];
        for (const pandal of pandalList) {
            const distanceBetween = calculateDistance(lastCoords.lat, lastCoords.lon, pandal.lat, pandal.lon);
            const travelMinutes = Math.round((distanceBetween / AVG_WALKING_SPEED_KMPH) * 60);
            let proposedArrivalTime = new Date(currentTime);
            proposedArrivalTime.setMinutes(currentTime.getMinutes() + travelMinutes);
            let proposedDepartureTime = new Date(proposedArrivalTime);
            proposedDepartureTime.setMinutes(proposedArrivalTime.getMinutes() + PANDAL_VISIT_DURATION_MINS);
            if (proposedDepartureTime <= endTime) {
                currentTime = new Date(proposedDepartureTime);
                lastCoords = { lat: pandal.lat, lon: pandal.lon };
                finalItinerary.push({ ...pandal, arrivalTime: proposedArrivalTime, departureTime: proposedDepartureTime, travelMinutes, distance: distanceBetween });
            } else break;
        }
        return finalItinerary;
    }
    function renderSuggestedItinerary(itinerary) {
        pandalListElement.innerHTML = '';
        if (itinerary.length === 0) {
            pandalListElement.innerHTML = `<li class="itinerary-item empty-state"><p>No pandals fit in the selected time. Try extending your end time!</p></li>`;
            suggestedGmapsLink.style.display = 'none';
            suggestedActions.style.display = 'none';
            return;
        }
        itinerary.forEach((pandal, index) => {
            const isAdded = myPlanItinerary.some(p => p.id === pandal.id);
            const listItem = document.createElement('li');
            listItem.className = 'itinerary-item';
            listItem.innerHTML = `<div class="itinerary-header"><div class="itinerary-info"><h3>${index + 1}. ${pandal.name}</h3><p>${pandal.description.substring(0, 100)}...</p></div><button class="add-btn" data-id="${pandal.id}" ${isAdded ? 'disabled' : ''}><i class="fas fa-${isAdded ? 'check' : 'plus'}"></i></button></div><div class="itinerary-details"><div class="detail-item"><i class="fas fa-route"></i><span class="distance">${pandal.distance.toFixed(1)} km</span></div><div class="detail-item"><i class="fas fa-walking"></i><span>${pandal.travelMinutes} min walk</span></div><div class="detail-item"><i class="fas fa-clock"></i><span class="timing-badge">${formatTime(pandal.arrivalTime)} - ${formatTime(pandal.departureTime)}</span></div></div>`;
            pandalListElement.appendChild(listItem);
        });
        suggestedActions.style.display = 'flex';
        updateGoogleMapsLink(suggestedGmapsLink, itinerary);
    }
    function renderMyPlan() {
        if (myPlanItinerary.length === 0) {
            emptyPlanElement.style.display = 'block';
            myPlanListElement.style.display = 'none';
            planActions.style.display = 'none';
            customGmapsLink.style.display = 'none';
            return;
        }
        emptyPlanElement.style.display = 'none';
        myPlanListElement.style.display = 'block';
        planActions.style.display = 'flex';
        myPlanListElement.innerHTML = '';
        myPlanItinerary.forEach((pandal, index) => {
            const listItem = document.createElement('li');
            listItem.className = 'itinerary-item';
            listItem.innerHTML = `<div class="itinerary-header"><div class="itinerary-info"><h3>${index + 1}. ${pandal.name}</h3><p>${pandal.description.substring(0, 100)}...</p></div><button class="add-btn remove-btn" data-id="${pandal.id}" style="background-color: var(--primary-red); color: white;"><i class="fas fa-trash"></i></button></div><div class="itinerary-details"><div class="detail-item"><i class="fas fa-route"></i><span class="distance">${pandal.distance.toFixed(1)} km</span></div><div class="detail-item"><i class="fas fa-walking"></i><span>${pandal.travelMinutes} min walk</span></div><div class="detail-item"><i class="fas fa-clock"></i><span class="timing-badge">${formatTime(pandal.arrivalTime)} - ${formatTime(pandal.departureTime)}</span></div></div>`;
            myPlanListElement.appendChild(listItem);
        });
        updateGoogleMapsLink(customGmapsLink, myPlanItinerary);
        renderSuggestedItinerary(currentSuggestedItinerary);
    }
    function renderGallery() {
        if (galleryGrid.children.length > 0) return;
        pandalData.forEach(pandal => {
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';
            galleryItem.dataset.id = pandal.id;
            const imageSeed = pandal.name.replace(/\s+/g, '').toLowerCase();
            galleryItem.innerHTML = `<img src="https://picsum.photos/seed/${imageSeed}/300/200.jpg" alt="${pandal.name}"><div class="gallery-item-info"><h3>${pandal.name}</h3><p>${pandal.description.substring(0, 80)}...</p></div>`;
            galleryItem.addEventListener('click', () => openPandalModal(pandal));
            galleryGrid.appendChild(galleryItem);
        });
    }
    function renderMapOverlayList(itinerary) {
        if (!itinerary || itinerary.length === 0) { mapOverlayContainer.style.display = 'none'; return; }
        mapOverlayList.innerHTML = '';
        itinerary.forEach((pandal, index) => {
            const li = document.createElement('li');
            li.textContent = `${index + 1}. ${pandal.name}`;
            li.dataset.id = pandal.id;
            li.addEventListener('click', () => { if (map && mapMarkers[pandal.id]) { mapMarkers[pandal.id].openPopup(); map.panTo([pandal.lat, pandal.lon]); } });
            mapOverlayList.appendChild(li);
        });
        mapOverlayContainer.style.display = 'flex';
    }
    function openPandalModal(pandal) {
        modalTitle.textContent = pandal.name;
        modalDescription.textContent = pandal.description;
        modalGallery.innerHTML = '';
        const imageSeed = pandal.name.replace(/\s+/g, '').toLowerCase();
        for (let i = 1; i <= 4; i++) {
            const img = document.createElement('img');
            img.src = `https://picsum.photos/seed/${imageSeed}${i}/400/300.jpg`;
            img.alt = `${pandal.name} Image ${i}`;
            img.addEventListener('click', () => openLightbox(img.src));
            modalGallery.appendChild(img);
        }
        modalDetails.innerHTML = `<div class="modal-detail-item"><i class="fas fa-map-marker-alt"></i><span>${pandal.area} Kolkata</span></div><div class="modal-detail-item"><i class="fas fa-star"></i><span>Popular Puja</span></div>`;
        modal.style.display = 'block';
    }
    function openLightbox(imageSrc) { lightboxImage.src = imageSrc; lightbox.style.display = 'block'; }
    function updateRouteSummary(itinerary) {
        if (!itinerary || itinerary.length === 0) { routeSummary.style.display = 'none'; return; }
        const totalDistance = itinerary.reduce((sum, p) => sum + p.distance, 0);
        const totalWalkingTime = itinerary.reduce((sum, p) => sum + p.travelMinutes, 0);
        totalDistanceEl.textContent = `${totalDistance.toFixed(1)} km`;
        totalTimeEl.textContent = `${totalWalkingTime} min`;
        pandalsCountEl.textContent = itinerary.length;
        routeSummary.style.display = 'block';
    }

    // --- HANDLERS & HELPERS ---
    function handleAddToPlan(e) {
        const pandalId = e.target.closest('.add-btn').dataset.id;
        const pandalToAdd = currentSuggestedItinerary.find(p => p.id === pandalId);
        if (pandalToAdd && !myPlanItinerary.some(p => p.id === pandalId)) {
            myPlanItinerary.push(pandalToAdd);
            recalculateAndRenderMyPlan();
        }
    }
    function handleRemoveFromPlan(e) {
        const pandalId = e.target.closest('.remove-btn').dataset.id;
        myPlanItinerary = myPlanItinerary.filter(p => p.id !== pandalId);
        recalculateAndRenderMyPlan();
    }
    function recalculateAndRenderMyPlan() {
        let remainingPandals = [...myPlanItinerary], sortedPlan = [], currentPoint = startingPoints[startPointSelect.value];
        while(remainingPandals.length > 0) {
            remainingPandals.sort((a,b) => calculateDistance(currentPoint.lat, currentPoint.lon, a.lat, a.lon) - calculateDistance(currentPoint.lat, currentPoint.lon, b.lat, b.lon));
            const nextPandal = remainingPandals.shift();
            sortedPlan.push(nextPandal);
            currentPoint = nextPandal;
        }
        myPlanItinerary = applyTimings(sortedPlan);
        renderMyPlan();
        updateRouteSummary(myPlanItinerary);
        updateMap(myPlanItinerary, true);
    }

    // --- *** IMPROVED FUNCTION: generatePDF (html2canvas -> jsPDF image + pagination) *** ---
    // Requires html2canvas and jspdf to be included in planner.html
    async function generatePDF(itinerary, type) {
        try {
            if (!itinerary || itinerary.length === 0) {
                alert("Your plan is empty. Add some pandals to generate a PDF.");
                return;
            }

            // Build off-screen print container to preserve page styles & fonts
            const printContainer = document.createElement('div');
            printContainer.id = 'pdf-print-container';
            printContainer.style.position = 'fixed';
            printContainer.style.left = '-9999px';
            printContainer.style.top = '0';
            // Use a width that maps nicely to A4 when rendered (we will scale the canvas)
            printContainer.style.width = '794px';
            printContainer.style.background = '#ffffff';
            printContainer.style.color = '#111';
            printContainer.style.padding = '20px';
            printContainer.style.boxSizing = 'border-box';
            printContainer.style.fontFamily = getComputedStyle(document.body).fontFamily || "'Hind Siliguri', sans-serif";
            printContainer.style.zIndex = '9999';

            // Header content and metadata
            const dateStr = new Date().toLocaleString('en-US', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit', hour12: true
            });

            // Summaries
            const startPointLabel = startPointSelect.selectedOptions[0]?.text || '';
            const totalDistance = itinerary.reduce((s, p) => s + p.distance, 0).toFixed(1);
            const totalWalkingTime = itinerary.reduce((s, p) => s + p.travelMinutes, 0);
            const totalVisitTime = itinerary.length * PANDAL_VISIT_DURATION_MINS;
            const totalTime = totalWalkingTime + totalVisitTime;

            let inner = `
                        <div style="font-family:inherit;">
                            <div style="text-align:center; margin-bottom:12px;">
                            <h1 style="margin:0; color:#000000; font-size:28px; font-weight:700;">Puja Parikrama Itinerary</h1>
                            <div style="font-size:12px; color:#000000; margin-top:6px;">Generated on ${dateStr}</div>
                            </div>

                            <div style="border:1px solid #000000; padding:12px; border-radius:8px; margin:10px 0; background:#fafafa;">
                            <div style="display:flex; justify-content:space-between; gap:12px; flex-wrap:wrap; font-size:13px;">
                                <div style="color:#000000;"><strong style="color:#000000;">Starting Point:</strong> ${startPointLabel}</div>
                                <div style="color:#000000;"><strong style="color:#000000;">Total Pandals:</strong> ${itinerary.length}</div>
                                <div style="color:#000000;"><strong style="color:#000000;">Total Distance:</strong> ${totalDistance} km</div>
                                <div style="color:#000000;"><strong style="color:#000000;">Total Time:</strong> ${totalTime} min</div>
                            </div>
                            </div>

                            <div style="margin-top:12px;">
                        `;

            itinerary.forEach((p, idx) => {
                const arrival = formatTime(p.arrivalTime);
                const departure = formatTime(p.departureTime);
                const description = p.description ? (p.description.length > 220 ? p.description.slice(0, 220) + '...' : p.description) : '';
                inner += `
                  <div style="padding:12px; border-radius:8px; margin-bottom:10px; background:#fff; border:1px solid #eee;">
                    <div style="display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap;">
                      <div style="font-weight:700; color:#D32F2F; font-size:16px;">${idx+1}. ${p.name}</div>
                      <div style="font-size:12px; color:#555;">${arrival} — ${departure}</div>
                    </div>
                    <div style="margin-top:8px; color:#333; font-size:13px;">${description}</div>
                    <div style="margin-top:10px; font-size:12px; color:#444;">🚶 ${p.distance.toFixed(1)} km (${p.travelMinutes} min walk)</div>
                  </div>
                `;
            });

            inner += `
                  </div>
                  <div style="margin-top:18px; text-align:center; font-size:11px; color:#666;">Generated by Pujo Parikrama Planner</div>
                </div>
            `;

            printContainer.innerHTML = inner;
            document.body.appendChild(printContainer);

            // Render with html2canvas
            const scale = 2; // Increase to 3 for crisper output at expense of size
            const canvas = await html2canvas(printContainer, {
                scale,
                useCORS: true,
                backgroundColor: '#ffffff',
                allowTaint: false,
                logging: false
            });

            // Prepare PDF (A4 portrait mm)
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            // Convert canvas to image data
            const imgData = canvas.toDataURL('image/jpeg', 0.92);

            // Calculate image size in mm keeping aspect ratio and full width
            const canvasW = canvas.width;
            const canvasH = canvas.height;
            const imgWidthMm = pdfWidth;
            const imgHeightMm = (canvasH * imgWidthMm) / canvasW;

            // If fits in one page, add it; otherwise slice and paginate
            if (imgHeightMm <= pdfHeight - 10) {
                pdf.addImage(imgData, 'JPEG', 0, 5, imgWidthMm, imgHeightMm);
            } else {
                // Paginate by slicing canvas vertically
                const pxPerMm = canvasW / imgWidthMm;
                let renderedHeightMm = 0;
                let pageIndex = 0;
                while (renderedHeightMm < imgHeightMm - 0.01) {
                    const yPx = Math.round(renderedHeightMm * pxPerMm);
                    const sliceHpx = Math.min(Math.round((pdfHeight - 10) * pxPerMm), canvasH - yPx);

                    const tmpCanvas = document.createElement('canvas');
                    tmpCanvas.width = canvasW;
                    tmpCanvas.height = sliceHpx;
                    const tmpCtx = tmpCanvas.getContext('2d');
                    tmpCtx.drawImage(canvas, 0, yPx, canvasW, sliceHpx, 0, 0, canvasW, sliceHpx);

                    const sliceData = tmpCanvas.toDataURL('image/jpeg', 0.92);
                    const sliceHeightMm = (sliceHpx * imgWidthMm) / canvasW;

                    if (pageIndex > 0) pdf.addPage();
                    pdf.addImage(sliceData, 'JPEG', 0, 5, imgWidthMm, sliceHeightMm);

                    renderedHeightMm += sliceHeightMm;
                    pageIndex++;
                }
            }

            // cleanup DOM
            document.body.removeChild(printContainer);

            // Save PDF with friendly filename
            const filename = `Pujo-Parikrama-Plan-${new Date().toISOString().slice(0,10)}.pdf`;
            pdf.save(filename);
        } catch (err) {
            console.error('PDF generation failed:', err);
            alert('Failed to generate PDF. Check console for details.');
        }
    }

    // --- *** NEW/FIXED FUNCTION: shareItinerary *** ---
    function shareItinerary(itinerary) {
        if (itinerary.length === 0) {
            alert("Your plan is empty. Add some pandals to share it.");
            return;
        }

        const startPointLabel = document.getElementById('start-point').selectedOptions[0].text;
        const gmapsUrl = generateGoogleMapsUrl(itinerary);

        let shareText = `🎉 *My Pujo Parikrama Plan!* 🎉\n\n`;
        shareText += `*Starting From:* ${startPointLabel}\n\n`;

        itinerary.forEach((pandal, index) => {
            shareText += `${index + 1}. *${pandal.name}*\n   (Arrival: ${formatTime(pandal.arrivalTime)})\n`;
        });

        const totalDistance = itinerary.reduce((sum, p) => sum + p.distance, 0).toFixed(1);
        shareText += `\n*Total Pandals:* ${itinerary.length}\n*Total Walking:* ~${totalDistance} km\n\n`;
        shareText += `*Google Maps Route:*\n${gmapsUrl}\n\n`;
        shareText += `Shared from Pujo Parikrama Planner!`;

        if (navigator.share) {
            navigator.share({
                title: 'My Pujo Parikrama Plan',
                text: shareText,
            })
            .catch((error) => console.log('Error sharing', error));
        } else {
            navigator.clipboard.writeText(shareText).then(() => {
                alert('Plan copied to clipboard! You can now paste it to share.');
            }).catch(err => {
                console.error('Failed to copy: ', err);
                alert('Could not copy the plan. Please try sharing manually.');
            });
        }
    }

    function updateStartPointsDropdown(area) {
        startPointSelect.innerHTML = '';
        Object.entries(startingPoints).forEach(([key, value]) => {
            if (value.area === 'All' || value.area === area) {
                const option = document.createElement('option');
                option.value = key;
                option.textContent = value.label;
                startPointSelect.appendChild(option);
            }
        });
    }
    function initializeMap() {
        if (map) return;
        map = L.map('map').setView([22.5726, 88.3639], 12);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors' }).addTo(map);
        updateMap(currentSuggestedItinerary, true);
    }
    function updateMap(itinerary, drawRoute) {
        if (!map) return;
        Object.values(mapMarkers).forEach(m => map.removeLayer(m));
        mapMarkers = {};
        if (mapPolyline) map.removeLayer(mapPolyline);
        if (!itinerary || itinerary.length === 0) { renderMapOverlayList([]); return; }
        itinerary.forEach((pandal, index) => {
            const iconHtml = `<div style="background-color: #D32F2F; color: white; border-radius: 50%; width: 25px; height: 25px; text-align: center; line-height: 25px; font-weight: bold; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);">${drawRoute ? index + 1 : ''}</div>`;
            const customIcon = L.divIcon({
                html: iconHtml,
                className: 'custom-map-marker',
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            });
            mapMarkers[pandal.id] = L.marker([pandal.lat, pandal.lon], { icon: customIcon }).addTo(map).bindPopup(`<b>${drawRoute ? (index + 1) + '. ' : ''}${pandal.name}</b><br>${pandal.description.substring(0, 100)}...`);
        });

        if (drawRoute && itinerary.length > 0) {
            const startCoords = startingPoints[startPointSelect.value];
            const latLngs = [[startCoords.lat, startCoords.lon], ...itinerary.map(p => [p.lat, p.lon])];
            mapPolyline = L.polyline(latLngs, { color: '#D32F2F' }).addTo(map);
            map.fitBounds(mapPolyline.getBounds().pad(0.1));
        } else if (itinerary.length > 0) {
            map.fitBounds(L.featureGroup(Object.values(mapMarkers)).getBounds().pad(0.2));
        }
        renderMapOverlayList(drawRoute ? itinerary : []);
    }
    function updateGoogleMapsLink(buttonElement, itinerary) {
        if (itinerary.length > 0) {
            buttonElement.href = generateGoogleMapsUrl(itinerary);
            buttonElement.style.display = 'inline-block';
        } else {
            buttonElement.style.display = 'none';
        }
    }

    // --- *** FIXED FUNCTION: generateGoogleMapsUrl *** ---
    function generateGoogleMapsUrl(itinerary) {
        if (itinerary.length === 0) return "#";
        const startCoords = startingPoints[startPointSelect.value];
        const origin = `${startCoords.lat},${startCoords.lon}`;
        const destination = `${itinerary[itinerary.length - 1].lat},${itinerary[itinerary.length - 1].lon}`;
        // Google Maps supports a max of 9 waypoints for walking directions
        const waypoints = itinerary.slice(0, -1).slice(0, 9).map(p => `${p.lat},${p.lon}`).join('|');

        let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
        if (waypoints) {
            url += `&waypoints=${waypoints}`;
        }
        url += `&travelmode=walking`;
        return url;
    }

    function getStartEndTimes() {
        const [startHour, startMinute] = document.getElementById('start-time').value.split(':').map(Number);
        const [endHour, endMinute] = document.getElementById('end-time').value.split(':').map(Number);
        let startTime = new Date(), endTime = new Date();
        startTime.setHours(startHour, startMinute, 0, 0);
        endTime.setHours(endHour, endMinute, 0, 0);
        if (endTime <= startTime) endTime.setDate(endTime.getDate() + 1);
        return { startTime, endTime };
    }
    function formatTime(date) { return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }); }
    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180, dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    // --- INITIALIZATION ---
    async function init() {
        try {
            const response = await fetch('data.json');
            const data = await response.json();
            
            startingPoints = data.startingPoints;
            generateAndClassifyPandals(data.corePandals);
            
            updateStartPointsDropdown('North');
            generateBtn.click();
        } catch (error) {
            console.error("Failed to load pandal data:", error);
            alert("Error: Could not load pandal data. Please check data.json and try again.");
        }
    }

    // --- Animated Donation Button Logic ---
    const donateButton = document.getElementById('donateBtn');
    if (donateButton) {
        // Shake animation
        const shakeInterval = 5000; // Shake every 5 seconds
        setInterval(() => {
            if (!donateButton.matches(':hover')) {
                donateButton.classList.add('is-animating');
                setTimeout(() => {
                    donateButton.classList.remove('is-animating');
                }, 1300);
            }
        }, shakeInterval);

        // Auto-expansion logic
        const expandInterval = 7000; // Expand every 7 seconds
        const expandDuration = 2500; // Stay expanded for 2.5 seconds
        setInterval(() => {
            if (!donateButton.matches(':hover')) {
                donateButton.classList.add('is-expanded');
                setTimeout(() => {
                    donateButton.classList.remove('is-expanded');
                }, expandDuration);
            }
        }, expandInterval);
    }
    
    // --- *** NEW *** Razorpay Donation Modal Logic ---
    const closeDonationModalBtn = document.querySelector('.donation-close-btn');
    const presetBtns = document.querySelectorAll('.preset-btn');
    const donateNowBtn = document.getElementById('donate-now-btn');

    if (donateButton && donationModal) {
        donateButton.addEventListener('click', (e) => {
            e.preventDefault();
            donationModal.classList.add('active');
        });
    }

    if (closeDonationModalBtn) {
        closeDonationModalBtn.addEventListener('click', () => {
            donationModal.classList.remove('active');
        });
    }

    presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            presetBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    if (donateNowBtn) {
        const paymentLinks = {
            'donate-21': 'https://rzp.io/rzp/AkM9tsLv',
            'donate-51': 'https://rzp.io/rzp/h6aVond',
            'donate-101': 'https://rzp.io/rzp/4u5PToOb',
            'donate-custom': 'https://rzp.io/rzp/fkGfdCt'
        };

        donateNowBtn.addEventListener('click', () => {
            const activePreset = document.querySelector('.preset-btn.active');
            if (activePreset && activePreset.id) {
                const url = paymentLinks[activePreset.id];
                if (url) {
                    window.open(url, '_blank');
                    donationModal.classList.remove('active');
                } else {
                    alert('Could not find the payment link for the selected amount.');
                }
            } else {
                alert('Please select a donation amount.');
            }
        });
    }

    init();
});
// ========================================================
// ============== ADD THIS JAVASCRIPT LOGIC ==============
// ========================================================
const sendEmailBtn = document.getElementById('send-email-btn');
const contactMessageTextarea = document.getElementById('contact-message');

if (sendEmailBtn) {
    sendEmailBtn.addEventListener('click', () => {
        const user = auth.currentUser;
        const message = contactMessageTextarea ? contactMessageTextarea.value : '';

        if (!user) {
            alert("You must be logged in to send a message.");
            return;
        }

        if (!message.trim()) {
            alert("Please write a message before sending.");
            return;
        }

        // !!! IMPORTANT: Change this to your actual support email address !!!
        const recipientEmail = "arunabhabanerjee5@gmail.com"; 
        
        const subject = "Feedback from Pujo Parikrama Planner";
        
        // This pre-fills the email body with user details and their message
        const body = `Hello Support Team,

A message has been submitted from the Pujo Parikrama Planner app.

User Name: ${user.displayName || 'N/A'}
User Email: ${user.email}
-----------------------------------------

Message:
${message}
`;
        // This creates and triggers the mailto link
        const mailtoLink = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        
        window.location.href = mailtoLink;

        // Optionally, clear the textarea after submission
        if (contactMessageTextarea) contactMessageTextarea.value = '';
    });
}
