## 🎉 Puja Parikrama Planner

An interactive web application designed to plan and experience **Durga Puja pandal hopping** in Kolkata and other districts with **smart route optimization**, **interactive maps**, and **personalized itineraries**. This project aims to make the festival more accessible and enjoyable by helping visitors discover pandals, create efficient custom routes, and navigate the city with ease.

**➡️ Live Demo: [https://pujaparikrama.online/](https://pujaparikrama.online/)**

-----

## ✨ Features

  - 🗺️ **Smart Route Planning**: Automatically generates the most efficient route to visit multiple pandals based on your selected start point, area, and time frame.
    
  - 📍 **Interactive Maps**: Utilizes **Leaflet.js** to display pandal locations, your generated route, and allows for interactive exploration.
    
  - 🕑 **Time Management**: Set your desired **start and end times** to get an optimized plan that fits your schedule, complete with estimated travel and visit times for each stop.
    
  - ❤️ **Personalized "My Plan"**: Add pandals from the suggested list to a custom plan. Your plan can be re-optimized, downloaded as a **PDF**, or shared via WhatsApp and other social media.
    
  - 🔐 **Secure Firebase Authentication**:
      - Email/Password sign-up and login.
      - One-click sign-in with **Google OAuth**.
      - Persistent login sessions and a personalized profile page.
        
  - **Pandal Gallery & Search**: Browse through a gallery of pandals and use the search bar to quickly find specific ones on the map or in the gallery.
    
  - 🎭 **Cultural Insights**: A dedicated **Mahavidya Section** provides rich descriptions and stories of the ten divine forms of the Goddess, enhancing the cultural experience.
    
  - 💸 **Donation Support**: An integrated, animated "Buy me a Mishti" button opens a modal with options to support the project via Razorpay payment links.
    
  - 🎨 **Modern UI/UX**:
      - A sleek **liquid glassmorphism** theme.
      - Fully **responsive, mobile-first** design.
      - Engaging animations on the hero section, buttons, and modals.

-----

## 🛠️ Tech Stack

  - **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6 Modules)
  - **Authentication**: Firebase Authentication
  - **Mapping**: [Leaflet.js](https://leafletjs.com/)
  - **PDF Generation**: [jsPDF](https://github.com/parallax/jsPDF) & [html2canvas](https://html2canvas.hertzen.com/)
  - **Styling**: Custom CSS with Flexbox, Grid, Glassmorphism, and Keyframe Animations
  - **Deployment**: Hosted on Netlify (with custom headers configured in `_headers`)

-----

## 📸 Screenshots

*(Note: Replace with your actual project screenshots)*

  - **Landing Page**
  - **Login / Signup Modal**
  - **Planner & Itinerary View**
  - **Interactive Map View**
  - **Mahavidya Section**
  - **Profile Page**

-----

## 🚀 Getting Started

Follow these steps to set up and run the project locally.

### 1\. Prerequisites

  - [Git](https://git-scm.com/) installed on your machine.
  - A code editor like [VS Code](https://code.visualstudio.com/) with the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension.

### 2\. Clone the Repository

```bash
git clone https://github.com/your-username/puja-parikrama-planner.git
cd puja-parikrama-planner
```

### 3\. Project Structure

The codebase is organized as follows:

```
puja-parikrama
├── index.html            # Landing Page
├── planner.html          # Main Planner Application
├── data.json             # Pandal data, coordinates, and descriptions
├── css/
│   ├── style.css         # Styles for the landing page
│   └── planner-style.css # Styles for the planner application
├── js/
│   ├── auth.js           # Firebase Authentication logic
│   ├── planner.js        # Core itinerary, map, and PDF logic
│   └── ui.js             # UI interactions for the landing page
├── _headers              # Netlify custom headers for caching
├── sitemap.xml           # SEO sitemap
├── robots.txt            # SEO instructions for crawlers
└── README.md
```

### 4\. Firebase Setup

This project requires a Firebase backend for authentication.

1.  Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2.  In your project, go to **Build \> Authentication**.
3.  Click the **Sign-in method** tab and enable **Email/Password** and **Google** as sign-in providers.
4.  Go to **Project Settings** (click the gear icon ⚙️) \> **General**.
5.  Under "Your apps," click the web icon (`</>`) to create a new web app.
6.  Copy the `firebaseConfig` object provided.
7.  Paste this object into **`js/auth.js`** and **`js/planner.js`**, replacing the placeholder configuration.
8.  In the Firebase Console, go back to **Authentication \> Settings \> Authorized domains** and add the domain where you will host your site (e.g., `localhost` for local testing, and your Netlify URL for production).

### 5\. Run Locally

Open the project folder in VS Code and use the **Live Server** extension to launch `index.html`. The app will now be running on a local development server.

-----

## 🔧 Configuration & Customization

You can easily customize key parts of the application:

  - **Pandal Data**: To add, remove, or edit pandals, modify the `corePandals` array in **`data.json`**.
  - **Starting Points**: To change the available starting locations, update the `startingPoints` object in **`data.json`**.
  - **Donation Links**: The Razorpay payment links are stored in the `paymentLinks` object inside **`js/planner.js`**. You can replace these with your own.
  - **Contact Email**: The "Contact Us" feature sends an email using a `mailto:` link. To change the recipient, update the `recipientEmail` variable at the end of **`js/planner.js`**.
  - **Styling**: All visual styles can be modified in **`css/style.css`** (for the landing page) and **`css/planner-style.css`** (for the planner app).

-----

## 🌐 Deployment

This project is optimized for deployment on platforms like Netlify.

1.  Push your code to a GitHub repository.
2.  Sign up or log in to [Netlify](https://www.netlify.com/).
3.  Click **"New site from Git"** and choose your repository.
4.  Netlify will automatically detect the build settings. Just click **"Deploy site."**
5.  The `_headers` file is already configured to set optimal caching policies for your assets.

-----

## 🤝 Contributing

Contributions are welcome\! If you have ideas for new features or find a bug, please follow these steps:

1.  Fork the repository.
2.  Create a new feature branch: `git checkout -b feature/your-awesome-feature`
3.  Make your changes and commit them: `git commit -m "Add: Your awesome feature"`
4.  Push to the branch: `git push origin feature/your-awesome-feature`
5.  Open a Pull Request.

-----

## 📜 License

This project is licensed under the **MIT License**. See the `LICENSE` file for details.

-----

## 🙌 Acknowledgements

  - **[Firebase](https://firebase.google.com/)** for providing a robust and easy-to-use authentication backend.
  - **[Leaflet.js](https://leafletjs.com/)** for the powerful and lightweight mapping library.
  - The countless **Durga Puja committees and artists** whose creativity makes this festival a global spectacle.
