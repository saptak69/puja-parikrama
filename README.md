# 🎉 Pujo Parikrama Planner

An interactive web application to plan and experience **Kolkata’s Durga Puja pandal hopping** with **smart route optimization**, **real-time maps**, and **personalized itineraries**.  

This project aims to make the Durga Puja festival more enjoyable by helping visitors discover pandals, create custom routes, and save time during pandal hopping.

---

## ✨ Features

- 🗺️ **Smart Route Planning**  
  Automatically generate efficient itineraries to cover the maximum number of pandals within your chosen time frame.

- 📍 **Interactive Maps**  
  Explore pandals with Leaflet.js maps showing markers, distances, and walking routes.

- 🕑 **Time Management**  
  Set your **start & end times** and get optimized plans for a smooth pandal-hopping experience.

- ❤️ **My Plan (Save & Share)**  
  Save selected pandals to your custom plan, download as **PDF**, or share via social media/WhatsApp.

- 🔐 **Firebase Authentication**  
  - Email/Password login  
  - Google OAuth login  
  - Personalized experience with profile support

- 🎭 **Cultural Insights**  
  Explore the **Mahavidya Section** with stories of the 10 Divine Mothers and traditional knowledge.

- 🎨 **Modern UI/UX**  
  - Glassmorphism effects  
  - Responsive design (mobile-first)  
  - Animated hero section & carousel  
  - Smooth transitions  

---

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript  
- **Styling**: Custom CSS with Glassmorphism + Animations  
- **Maps**: [Leaflet.js](https://leafletjs.com/)  
- **Auth & Data**: Firebase Authentication  
- **Utilities**: PDF Export, Share via WhatsApp  
- **Deployment**: Netlify / GitHub Pages  

---

## 📸 Screenshots

> Replace these with actual screenshots later.

- **Landing Page**  
  ![Landing Page Screenshot](docs/screenshots/landing.png)

- **Login / Signup Modal**  
  ![Auth Screenshot](docs/screenshots/auth.png)

- **Planner with Suggested Itinerary**  
  ![Planner Screenshot](docs/screenshots/planner.png)

- **Interactive Map View**  
  ![Map Screenshot](docs/screenshots/map.png)

---

## 🚀 Getting Started

Follow these steps to set up the project locally:

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/pujo-parikrama-planner.git
cd pujo-parikrama-planner
````

### 2. Project Structure

```
├── index.html          # Landing Page
├── planner.html        # Main Planner App
├── css/
│   ├── style.css       # Styles for landing page
│   ├── planner-style.css # Styles for planner app
├── js/
│   ├── auth.js         # Firebase Auth logic
│   ├── planner.js      # Itinerary + Maps logic
│   ├── ui.js           # UI & Carousel handling
├── images/             # Screenshots
└── README.md           # Documentation
```

### 3. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Create a new project (`puja-parikrama`).
3. Enable **Authentication → Sign-in Method** (Email/Password + Google).
4. Copy your Firebase config and replace in `auth.js` and `planner.js`.
5. Add your hosting URL (Netlify / GitHub Pages) in **Authorized Domains**.

### 4. Run Locally

Simply open `index.html` in your browser or use a local server:

```bash
# Using VS Code Live Server
Right click → "Open with Live Server"
```

---

## 🌐 Deployment

### Option 1: Netlify

1. Push your repo to GitHub.
2. Go to [Netlify](https://www.netlify.com/) → New Site from Git.
3. Connect your repo and deploy.
4. Add your custom domain (e.g., `pujaparikrama.online`).
5. Update DNS `A` record to point to Netlify IP.

### Option 2: GitHub Pages

1. Push to GitHub.
2. Go to **Repo Settings → Pages**.
3. Select branch `main` and root folder.
4. Access your site at `https://your-username.github.io/pujo-parikrama-planner/`.

---

## 📖 Usage

1. Open the app → [Landing Page](index.html).
2. Click **Plan Your Journey** → Sign in with Email or Google.
3. Configure your plan:

   * Choose **Area (North/South/All)**
   * Select **Start & End times**
   * Pick a **Starting Point**
4. Generate your itinerary.
5. View in **Map Mode** or **List Mode**.
6. Save to **My Plan**, export as PDF, or share with friends.

---

## 🤝 Contributing

We welcome contributions!

* Fork the repo
* Create a feature branch: `git checkout -b feature-name`
* Commit changes: `git commit -m "Added new feature"`
* Push branch: `git push origin feature-name`
* Open a Pull Request 🚀

---

## 📜 License

This project is licensed under the **MIT License** – feel free to use, modify, and share.

---

## 🙌 Acknowledgements

* [Leaflet.js](https://leafletjs.com/) for interactive maps
* [Firebase](https://firebase.google.com/) for authentication
* Durga Puja committees of Kolkata for cultural inspiration 🎭
* Open-source contributors who keep this project alive ❤️

---

```

