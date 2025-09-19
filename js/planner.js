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
    let currentSuggestedItinerary = [];
    let myPlanItinerary = [];

    const corePandals = [
        {"name":"Sinthee More", "lat":22.6267, "lon":88.3849, "description":"A key starting point in the northern part of the city."},
        {"name":"Dum Dum Metro", "lat":22.6247, "lon":88.4023, "description":"A major metro station and starting hub for North Kolkata."},
        {"name":"Dakhinpara Sarbojanin", "lat":22.6201, "lon":88.4015, "description":"A local puja near Dum Dum."},
        {"name":"Jawpur Bayam Samiti", "lat":22.6178, "lon":88.4123, "description":"A local community puja near Dum Dum."},
        {"name":"Dum Dum Park Tarun Dal", "lat":22.6145, "lon":88.4102, "description":"A consistent award winner in the Dum Dum area."},
        {"name":"Tala Prottoye", "lat":22.6135, "lon":88.3755, "description":"Famous for its innovative and artistic themes."},
        {"name":"Dum Dum Park Jubak Brinda", "lat":22.6133, "lon":88.4045, "description":"A youth club's puja in Dum Dum Park."},
        {"name":"Tala Ponero (15) Pally", "lat":22.6125, "lon":88.3741, "description":"A community puja in the Tala area."},
        {"name":"Dum Dum Park Sarbojonin", "lat":22.6121, "lon":88.4085, "description":"A community puja in the Dum Dum Park area."},
        {"name":"Tala Barowari", "lat":22.6111, "lon":88.3728, "description":"One of the oldest community pujas in Kolkata."},
        {"name":"Dum Dum Park Tarun Sangha", "lat":22.6105, "lon":88.4069, "description":"A consistent award-winner known for innovative themes and artistic idol creations."},
        {"name":"Belgachia Sadharon Durga Puja", "lat":22.6098, "lon":88.3833, "description":"A large public puja in Belgachia."},
        {"name":"Dum Dum Park Bharat Chakra", "lat":22.6083, "lon":88.4025, "description":"Known for its innovative themes and artistic brilliance."},
        {"name":"Dakshin Dari", "lat":22.6055, "lon":88.4031, "description":"A notable puja near VIP Road."},
        {"name":"Bagbazar Sarbojanin", "lat":22.6033, "lon":88.3683, "description":"One of the oldest (~100 years) and most traditional pujas, famed for its classic idol."},
        {"name":"Basak Bagan", "lat":22.6025, "lon":88.3985, "description":"A neighbourhood puja near Patipukur."},
        {"name":"Lake Town Netaji Sporting", "lat":22.6012, "lon":88.4078, "description":"A popular puja near Lake Town."},
        {"name":"Kumortuli Sarbojanin", "lat":22.6008, "lon":88.3685, "description":"A highly artistic puja in the idol-makers' locality."},
        {"name":"Kumartuli Park", "lat":22.6001, "lon":88.3692, "description":"Located in the potters' district, it's known for its highly artistic and traditional approach."},
        {"name":"Kalindi Housing", "lat":22.5999, "lon":88.4011, "description":"A housing estate's puja near Lake Town."},
        {"name":"Shyambazar 5 Point", "lat":22.5990, "lon":88.3737, "description":"The iconic starting point for North Kolkata pandal hopping."},
        {"name":"Golaghata Sarbojanin", "lat":22.5991, "lon":88.3953, "description":"A well-attended puja near Ultadanga."},
        {"name":"Shyambazar Nabin Pally", "lat":22.5982, "lon":88.3751, "description":"A community puja near Shyambazar."},
        {"name":"Sovabazar Rajbari", "lat":22.5978, "lon":88.3665, "description":"One of the oldest household pujas, open to the public."},
        {"name":"Sreebhumi Sporting Club", "lat":22.5977, "lon":88.4098, "description":"Extremely famous for its grand themes, often replicating world monuments."},
        {"name":"Chaltabagan Lohapatti", "lat":22.5975, "lon":88.3735, "description":"A multiple award-winning puja in Manicktala, known for its artistic excellence."},
        {"name":"Lake Town Adhibasi Brinda", "lat":22.5970, "lon":88.4055, "description":"Consistently wins awards for its unique themes and beautiful execution."},
        {"name":"Hatibagan Sarbojanin", "lat":22.5969, "lon":88.3734, "description":"One of the most famous pujas in North Kolkata."},
        {"name":"Beniatola Sarbojanin", "lat":22.5965, "lon":88.3645, "description":"One of the old pujas of North Kolkata."},
        {"name":"Lake Town Association", "lat":22.5955, "lon":88.4042, "description":"A local association's puja in Lake Town."},
        {"name":"Sovabazar Metro", "lat":22.5954, "lon":88.3671, "description":"A key metro station for accessing North Kolkata pujas."},
        {"name":"Ultandanga Sangrami", "lat":22.5948, "lon":88.3912, "description":"A local club's puja in Ultadanga."},
        {"name":"Telengabagan Sarbojanin", "lat":22.5945, "lon":88.3783, "description":"Celebrated for its immersive themes and high-quality craftsmanship."},
        {"name":"Hatibagan Crossing", "lat":22.5945, "lon":88.3722, "description":"A busy intersection and hub for North Kolkata pujas."},
        {"name":"Kashi Bose Lane Durga Puja", "lat":22.5943, "lon":88.3718, "description":"Renowned for its traditional artistic style and community feel."},
        {"name":"Ahiritola Jubak Brinda", "lat":22.5942, "lon":88.3625, "description":"A youth club's puja in the Ahiritola area."},
        {"name":"Ahiritola", "lat":22.5936, "lon":88.3639, "description":"A famous and old traditional puja."},
        {"name":"Ahiritola Sarbojanin", "lat":22.5936, "lon":88.3639, "description":"A famous and old traditional puja in North Kolkata."},
        {"name":"Ultadanga", "lat":22.5936, "lon":88.3892, "description":"A major transit point connecting North Kolkata and Salt Lake."},
        {"name":"Jagat Mukherjee Park", "lat":22.5925, "lon":88.3701, "description":"A beautiful puja held in a park setting."},
        {"name":"AH Block", "lat":22.5923, "lon":88.4167, "description":"A popular residential block puja in Salt Lake."},
        {"name":"Ultandanga Pallysree", "lat":22.5915, "lon":88.3871, "description":"A popular community puja in Ultadanga."},
        {"name":"Bayan Samity Lala Bagan", "lat":22.5912, "lon":88.3845, "description":"A local puja in the Maniktala area."},
        {"name":"Bedon Street", "lat":22.5911, "lon":88.3695, "description":"A community puja in the Beadon Street area."},
        {"name":"Chorebagan Sarbojanin", "lat":22.5891, "lon":88.3642, "description":"A famous puja in a historic North Kolkata locality."},
        {"name":"AE Part 1 Block", "lat":22.5891, "lon":88.4145, "description":"A prominent block puja in Salt Lake."},
        {"name":"Nalin Sarkar Street", "lat":22.5898, "lon":88.3715, "description":"A highly reputed puja, famous for its unique and artistic idols."},
        {"name":"Pathuriaghata", "lat":22.5899, "lon":88.3615, "description":"A notable puja in a historic neighbourhood."},
        {"name":"Vivekananda Sporting", "lat":22.5888, "lon":88.3805, "description":"A well-known club's puja in Maniktala."},
        {"name":"BJ Block, Salt Lake", "lat":22.5879, "lon":88.4118, "description":"Another major attraction in Salt Lake, consistently praised for its creativity."},
        {"name":"Darpanarayan Street", "lat":22.5878, "lon":88.3601, "description":"A local street's community puja."},
        {"name":"Maniktala Crossing", "lat":22.5866, "lon":88.3789, "description":"A central point in Maniktala, surrounded by pujas."},
        {"name":"Girish Park Metro", "lat":22.5861, "lon":88.3656, "description":"Metro station providing access to many North Kolkata pujas."},
        {"name":"Kankurgachi Yubak Brinda", "lat":22.5855, "lon":88.3948, "description":"A major puja attraction in Kankurgachi."},
        {"name":"Karunamoyee, Salt Lake", "lat":22.5851, "lon":88.4150, "description":"A central location in Salt Lake, close to several big pujas."},
        {"name":"Shimla Street", "lat":22.5831, "lon":88.3682, "description":"Known for its artistic pandals in North Kolkata."},
        {"name":"FD Block, Salt Lake", "lat":22.5824, "lon":88.4121, "description":"One of the biggest and most popular pujas in Salt Lake."},
        {"name":"Kankurgachi Mitali Sangha", "lat":22.5819, "lon":88.3916, "description":"A well-known puja in the Kankurgachi area, often featuring beautiful designs."},
        {"name":"Mohammad Ali Park", "lat":22.5780, "lon":88.3601, "description":"A major crowd-puller in Central Kolkata, known for its magnificent architecture."},
        {"name":"Green Park Recreational Club", "lat":22.5755, "lon":88.4188, "description":"A club-based puja in Salt Lake."},
        {"name":"Pragati Pally", "lat":22.5731, "lon":88.4201, "description":"A community puja in the Salt Lake area."},
        {"name":"College Square", "lat":22.5714, "lon":88.3619, "description":"Legendary for its stunning pandal and idol reflection in the adjacent lake."},
        {"name":"Santosh Mitra Square", "lat":22.5702, "lon":88.3571, "description":"Located in the Bowbazar area, famous for its grand and often surprising themes."},
        {"name":"Beleghata 33 Pally", "lat":22.5698, "lon":88.3921, "description":"A prominent puja in the Beleghata area."},
        {"name":"Sealdah Station", "lat":22.5645, "lon":88.3711, "description":"A major railway station, a gateway for pandal hoppers."},
        {"name":"Esplanade Metro", "lat":22.5639, "lon":88.3524, "description":"The heart of the city, a central hub for all directions."},
        {"name":"Park Circus 7 Point", "lat":22.5408, "lon":88.3701, "description":"A major connector between central, south, and east Kolkata."},
        {"name":"25 Pally", "lat":22.5388, "lon":88.3211, "description":"A community puja in the Khidirpur area."},
        {"name":"Nabarag", "lat":22.5401, "lon":88.3245, "description":"A notable puja in Khidirpur."},
        {"name":"Yubak Sangha", "lat":22.5376, "lon":88.3283, "description":"A youth club's puja in Khidirpur."},
        {"name":"75 Pally", "lat":22.5361, "lon":88.3228, "description":"A popular local puja in Khidirpur."},
        {"name":"Pally Sharadiya", "lat":22.5352, "lon":88.3265, "description":"A known puja celebration in Khidirpur."},
        {"name":"Abasar Sarbojanin", "lat":22.5344, "lon":88.3488, "description":"A community celebration in Bhawanipore."},
        {"name":"Kabhi Tirtha Yuba Gosthi", "lat":22.5342, "lon":88.3299, "description":"A local community puja in Khidirpur."},
        {"name":"Bhawanipore Rupchand", "lat":22.5312, "lon":88.3458, "description":"A local puja in the Bhawanipore area."},
        {"name":"Maddox Square", "lat":22.5288, "lon":88.3565, "description":"Legendary for its relaxed, 'adda' atmosphere and traditional feel."},
        {"name":"Jatin Das Park", "lat":22.5285, "lon":88.3511, "description":"A prominent puja held near Jatin Das Park metro."},
        {"name":"Ballygunge Phari", "lat":22.5286, "lon":88.3653, "description":"A key junction near many famous South Kolkata pujas."},
        {"name":"Ballygunge Cultural Association", "lat":22.5273, "lon":88.3605, "description":"A prestigious and old puja known for its traditional and cultural elegance."},
        {"name":"Samaj Sebi Sangha", "lat":22.5255, "lon":88.3615, "description":"Often highlights strong social messages through its theme and artwork."},
        {"name":"Alipore Sarbojanin", "lat":22.5250, "lon":88.3361, "description":"A major puja in the Alipore area."},
        {"name":"Deshapriya Park", "lat":22.5242, "lon":88.3551, "description":"Hosts one of the most widely visited pujas, often with grand-scale themes."},
        {"name":"Hazra Park", "lat":22.5241, "lon":88.3485, "description":"A famous puja near the busy Hazra crossing."},
        {"name":"Singhi Park", "lat":22.5228, "lon":88.3633, "description":"An old and prestigious puja with a traditional idol."},
        {"name":"Alipur 78 Pally", "lat":22.5224, "lon":88.3323, "description":"A popular local puja in Alipore."},
        {"name":"Tridhara Sammilani", "lat":22.5222, "lon":88.3569, "description":"Famous for its massive, innovative, and often abstract structures."},
        {"name":"Hazra More", "lat":22.5218, "lon":88.3496, "description":"A bustling intersection, gateway to many South Kolkata pujas."},
        {"name":"Falguni Sangha", "lat":22.5215, "lon":88.3689, "description":"A community puja in the Gariahat area."},
        {"name":"Kalighat Milon Sangha", "lat":22.5205, "lon":88.3421, "description":"A well-known puja in the Kalighat area."},
        {"name":"Gariahat Junction", "lat":22.5204, "lon":88.3672, "description":"A prime starting point for South Kolkata pandal hopping."},
        {"name":"Kalighat Metro", "lat":22.5202, "lon":88.3453, "description":"Metro station right next to the famous Kalighat temple."},
        {"name":"Hindustan Park Sarbojanin", "lat":22.5194, "lon":88.3601, "description":"Known for its highly artistic and thematic approaches to the pandal and idol."},
        {"name":"Ekdalia Evergreen Club", "lat":22.5186, "lon":88.3664, "description":"Known for its stunning, massive lighting installations and traditional idols."},
        {"name":"Akal Bodhan", "lat":22.5183, "lon":88.3352, "description":"A famous and traditional puja in Chetla."},
        {"name":"Shib Mandir Sarbojanin", "lat":22.5173, "lon":88.3537, "description":"A very popular puja near the Lake Market area, consistently drawing large crowds."},
        {"name":"Rashbehari Crossing", "lat":22.5173, "lon":88.3537, "description":"A central point connecting Gariahat, Kalighat, and Tollygunge."},
        {"name":"Chotuskon Park", "lat":22.5155, "lon":88.3575, "description":"A local puja in the Bhowanipore area."},
        {"name":"Hindustan Club", "lat":22.5152, "lon":88.3626, "description":"Located in Gariahat, this puja is known for its unique themes and idols."},
        {"name":"Chetla Agrani Club", "lat":22.5144, "lon":88.3373, "description":"A top contender for awards, known for its deep, thought-provoking themes."},
        {"name":"Kasba Golpark", "lat":22.5142, "lon":88.3845, "description":"A starting point for pujas around the Kasba area."},
        {"name":"Nepal Bhattacharya Street", "lat":22.5135, "lon":88.3455, "description":"A local street's community puja."},
        {"name":"Mudiali Club", "lat":22.5129, "lon":88.3484, "description":"An old and famous puja known for its traditional charm and beautiful lighting."},
        {"name":"Bosepukur Sitala Mandir", "lat":22.5126, "lon":88.3712, "description":"Often comes up with unique rural or folk art themes, winning many awards."},
        {"name":"66 Pally", "lat":22.5119, "lon":88.3508, "description":"A famous puja near Rashbehari Avenue, known for its unique themes."},
        {"name":"Vivekanda Park Athletic Club", "lat":22.5118, "lon":88.3644, "description":"A well-known puja near the Southern Avenue area."},
        {"name":"Badamtala Ashar Sangha", "lat":22.5112, "lon":88.3411, "description":"A consistent award-winner, famous for its creative and artistic themes."},
        {"name":"Ruby Hospital", "lat":22.5132, "lon":88.4043, "description":"A landmark on the EM Bypass, gateway to pujas in East Kolkata."},
        {"name":"Selimpur Pally", "lat":22.5085, "lon":88.3655, "description":"Celebrated for its creative use of materials and intricate craftsmanship."},
        {"name":"Lake Youth Corner", "lat":22.5081, "lon":88.3495, "description":"A popular puja near the Tollygunge lakes."},
        {"name":"95 Pally Jodhpur Park", "lat":22.5078, "lon":88.3671, "description":"A very famous and grand puja in Jodhpur Park."},
        {"name":"Babubagan Sarbojonin", "lat":22.5065, "lon":88.3633, "description":"A major attraction near Dhakuria."},
        {"name":"Jodhpur Park Saradiya Utsab", "lat":22.5063, "lon":88.3692, "description":"A huge and popular puja in South Kolkata, known for its grand scale."},
        {"name":"Taratala More", "lat":22.5063, "lon":88.3242, "description":"A key intersection for Behala and the port area."},
        {"name":"Buro Shibatala", "lat":22.5055, "lon":88.3301, "description":"An old and respected puja near New Alipore."},
        {"name":"Buroshivtala Durga Utsab", "lat":22.5055, "lon":88.3301, "description":"A traditional puja in the New Alipore area."},
        {"name":"Santoshpur Lakepally", "lat":22.5049, "lon":88.3912, "description":"Famous for its beautiful pandal by the lake."},
        {"name":"Debdaru Park", "lat":22.5042, "lon":88.3268, "description":"A well-known celebration in Behala."},
        {"name":"Suruchi Sangha", "lat":22.5029, "lon":88.3621, "description":"Presents a different Indian state's culture each year. A major crowd-puller."},
        {"name":"Santoshpur Avenue", "lat":22.5011, "lon":88.3902, "description":"A major puja on the Santoshpur Avenue."},
        {"name":"Behala Notun Dal", "lat":22.5001, "lon":88.3223, "description":"Another major puja in Behala, known for its innovative concepts."},
        {"name":"Trikon Park", "lat":22.4999, "lon":88.3865, "description":"A popular puja in the Santoshpur area."},
        {"name":"Behala Friends Club", "lat":22.4975, "lon":88.3195, "description":"A popular puja in the Behala area."},
        {"name":"Tollygunge Metro", "lat":22.4975, "lon":88.3444, "description":"A key metro station for accessing South Kolkata and Tollygunge pujas."},
        {"name":"Jadavpur 8B Stand", "lat":22.4970, "lon":88.3694, "description":"A central hub for Jadavpur area pujas."},
        {"name":"Behala Shree Sangha", "lat":22.4958, "lon":88.3231, "description":"A prominent puja in Behala."},
        {"name":"Pally Mangal Samity", "lat":22.4912, "lon":88.3667, "description":"A respected community puja in Jadavpur."},
        {"name":"Behala Chowrasta", "lat":22.4916, "lon":88.3151, "description":"The main intersection in Behala, surrounded by famous pujas."},
        {"name":"Barisha Club", "lat":22.4883, "lon":88.3115, "description":"Located in Behala, it gained fame for its powerful and viral social themes."},
        {"name":"41 Pally", "lat":22.4866, "lon":88.3355, "description":"A well-known club puja in Haridevpur."},
        {"name":"Ajeyo Sanghati", "lat":22.4845, "lon":88.3321, "description":"A major crowd-puller in Haridevpur."},
        {"name":"Haridevpur Adarsha Samiti", "lat":22.4821, "lon":88.3299, "description":"Known for its creativity and drawing huge crowds in the Tollygunge area."},
        {"name":"Nabadurga", "lat":22.4795, "lon":88.3675, "description":"A popular puja near Naktala."},
        {"name":"Naktala Udayan Sangha", "lat":22.4777, "lon":88.3697, "description":"Famous for its artistic brilliance, compelling social themes, and beautiful idols."},
        {"name":"Panchadurga", "lat":22.4759, "lon":88.3712, "description":"A local celebration in the Naktala area."},
        {"name":"Kavi Subhash Metro", "lat":22.4695, "lon":88.4024, "description":"Southernmost metro station, access point for Garia and Naktala pujas."},
        {"name":"Thakurpukur SB Park", "lat":22.4648, "lon":88.3065, "description":"A prominent puja on the southern outskirts, famous for its grand pandals."},
        {"name":"SBI Park", "lat":22.4648, "lon":88.3065, "description":"Another name for the famous Thakurpukur SB Park puja."}
    ];
    const startingPoints = {
        "gariahat": { "lat": 22.5204, "lon": 88.3672, "area": "South", "label": "Gariahat Junction" },
        "jadavpur": { "lat": 22.4970, "lon": 88.3694, "area": "South", "label": "Jadavpur 8B Stand" },
        "tollygunge": { "lat": 22.4975, "lon": 88.3444, "area": "South", "label": "Tollygunge Metro" },
        "hazra": { "lat": 22.5218, "lon": 88.3496, "area": "South", "label": "Hazra More" },
        "rashbehari": { "lat": 22.5173, "lon": 88.3537, "area": "South", "label": "Rashbehari Crossing" },
        "ruby": { "lat": 22.5132, "lon": 88.4043, "area": "South", "label": "Ruby Hospital" },
        "kavi-subhash": { "lat": 22.4695, "lon": 88.4024, "area": "South", "label": "Kavi Subhash Metro" },
        "kasba": { "lat": 22.5142, "lon": 88.3845, "area": "South", "label": "Kasba Golpark" },
        "behala-chowrasta": { "lat": 22.4916, "lon": 88.3151, "area": "South", "label": "Behala Chowrasta" },
        "shyambazar": { "lat": 22.5990, "lon": 88.3737, "area": "North", "label": "Shyambazar 5 Point" },
        "dumdum": { "lat": 22.6247, "lon": 88.4023, "area": "North", "label": "Dum Dum Metro" },
        "girish-park": { "lat": 22.5861, "lon": 88.3656, "area": "North", "label": "Girish Park Metro" },
        "sovabazar": { "lat": 22.5954, "lon": 88.3671, "area": "North", "label": "Sovabazar Metro" },
        "ultadanga": { "lat": 22.5936, "lon": 88.3892, "area": "North", "label": "Ultadanga" },
        "sinthee-more": { "lat": 22.6267, "lon": 88.3849, "area": "North", "label": "Sinthee More" },
        "maniktala": { "lat": 22.5866, "lon": 88.3789, "area": "North", "label": "Maniktala Crossing" },
        "beliaghata": { "lat": 22.5710, "lon": 88.3900, "area": "North", "label": "Beliaghata CIT More" },
        "esplanade": { "lat": 22.5639, "lon": 88.3524, "area": "All", "label": "Esplanade Metro" },
        "sealdah": { "lat": 22.5645, "lon": 88.3711, "area": "All", "label": "Sealdah Station" },
        "park-circus": { "lat": 22.5408, "lon": 88.3701, "area": "All", "label": "Park Circus 7 Point" },
        "karunamoyee": { "lat": 22.5851, "lon": 88.4150, "area": "All", "label": "Karunamoyee, Salt Lake" }
    };

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
            const url = `https://maps.google.com/?q=${lat},${lon}`;
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
    function generateAndClassifyPandals() { pandalData = corePandals.map(p => ({ ...p, id: `${p.lat}-${p.lon}`, area: p.lat < KOLKATA_DIVIDING_LATITUDE ? 'South' : 'North' })); }
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
                            <h1 style="margin:0; color:#000000; font-size:28px; font-weight:700;">Pujo Parikrama Itinerary</h1>
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
    function init() {
        generateAndClassifyPandals();
        updateStartPointsDropdown('North');
        generateBtn.click();
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
    const customAmountInput = document.getElementById('custom-amount-input');
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
            customAmountInput.value = ''; // Clear custom input
        });
    });

    if (customAmountInput) {
        customAmountInput.addEventListener('input', () => {
            presetBtns.forEach(b => b.classList.remove('active')); // Deselect presets
        });
    }

    if (donateNowBtn) {
        donateNowBtn.addEventListener('click', () => {
            const razorpayBaseUrl = 'https://razorpay.me/@arunabhabanerjee/';
            let amount = 0;

            const activePreset = document.querySelector('.preset-btn.active');
            if (activePreset) {
                amount = activePreset.dataset.amount;
            } else if (customAmountInput.value) {
                const customAmount = parseInt(customAmountInput.value, 10);
                if (customAmount > 0) {
                    amount = customAmount;
                }
            }

            if (amount > 0) {
                const finalUrl = `${razorpayBaseUrl}${amount}`;
                window.open(finalUrl, '_blank');
                donationModal.classList.remove('active'); // Close modal after action
            } else {
                alert('Please select a preset amount or enter a valid custom amount.');
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
