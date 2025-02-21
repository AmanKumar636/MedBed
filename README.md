# MedBed

MedBed is a full‑stack application designed to manage medical appointments and hospital resources. It provides separate dashboards for patients and hospitals, enabling features like nearby hospital search with dynamic radius filtering, appointment booking, offline chatbot support, and resource management. 

---

## Overview

MedBed streamlines the process of finding nearby hospitals, booking available beds, and tracking appointment history. Hospitals can update their resource information and location data through their dashboard, while patients can search for hospitals within a defined radius, view their appointments, and get instant help from an offline chatbot.

---

## Features

### Authentication & Registration
- **Patients & Hospitals:** Both user types can register and log in using secure JWT‑based authentication.
- **Logout:** Available on all dashboards to clear session tokens.
- **Registration Navigation:** The login screen’s “Create Account” link correctly routes to the registration page.

### Feedback
- **Submit Feedback:** Users can submit feedback about the app, which is stored in MongoDB.

### Hospital Nearby Search
- **Dynamic Radius Filtering:** Users can specify a search radius (default 500 km) to fetch only hospitals within that range.
- **Current Location Display:** Your current location is shown in the form **(latitude, longitude)** along with a reverse‑geocoded location name.
- **Hospital Listings:** Each hospital displays its name, address, city, available beds, oxygen cylinders, coordinates (displayed as (latitude, longitude)), and the computed distance (in km) from your location.
- **Book Bed:** Tapping “Book Bed” reduces the hospital’s available beds by 1, creates an appointment record (including hospital name, address, city, email, and booking date), and navigates you to the Appointment History dashboard.

### Appointment History
- **View Past Appointments:** Patients can view detailed records of their past appointments, including hospital details and booking dates.

### Chatbot Support
- **Offline Chatbot:** A rule‑based offline chatbot is built into the app. It is "trained" on common queries about MedBed and provides basic conversational responses. After sending a message, the input box is cleared automatically.

### Hospital Dashboard
- **Resource Management:** Hospitals can update their available beds and oxygen cylinder counts.
- **Location Update:** Hospitals can update their location by either manually entering coordinates or auto‑fetching the current location.
- **Logout:** A Logout button is provided to clear the session.

### 24/7 Support
- **Direct Call:** A button initiates a phone call to the support number (9174245164).

---

## Technologies Used

- **Backend:**  
  - Node.js  
  - Express  
  - MongoDB & Mongoose  
  - JSON Web Tokens (JWT)

- **Frontend:**  
  - React Native (Expo)  
  - Expo Router  
  - Axios  
  - SecureStore

- **Chatbot:**  
  - Offline rule‑based conversational logic

- **Geospatial:**  
  - MongoDB's geospatial queries (with GeoJSON format)  
  - Haversine formula for distance calculation

---

## Modules & Their Functions

### 1. Authentication Module
- **Files:** `server/routes/authRoutes.js`, `server/models/User.js`, `server/models/Hospital.js`
- **Function:** Handles user (patient and hospital) registration, login, and token verification using JWT.

### 2. Feedback Module
- **Files:** `server/routes/feedbackRoutes.js`, `server/models/Feedback.js`
- **Function:** Allows users to submit feedback, which is stored in the database.

### 3. Hospital Module
- **Files:** `server/routes/hospitals.js`, `server/models/Hospital.js`
- **Function:**  
  - Searches for nearby hospitals using geospatial queries.
  - Provides endpoints to book a bed, update resource counts, and update location coordinates.
  - Returns hospital details including coordinates in (latitude, longitude) format.

### 4. Appointment Module
- **Files:** `server/routes/appointmentsRoutes.js`, `server/models/Appointment.js`
- **Function:** Creates appointment records when a bed is booked and provides an endpoint for patients to view their appointment history.

### 5. Chatbot Module
- **Files:** `expoApp/app/chatbot.js`
- **Function:** Provides an offline, rule‑based conversational chatbot trained on common queries about MedBed. No external API is used, ensuring offline availability.

### 6. Hospital Dashboard (Client)
- **Files:** `expoApp/app/hospitalDashboard.js`
- **Function:** Allows hospital users to update resource data (beds and oxygen) and location coordinates, with an option to auto‑fetch current location.

### 7. Hospital Nearby Dashboard (Client)
- **Files:** `expoApp/app/hospitalNearby.js`
- **Function:**  
  - Displays the current location (in (latitude, longitude) format) and location name.
  - Allows the user to set a search radius.
  - Fetches and displays only those hospitals that fall within the specified radius, along with the computed distance (using the Haversine formula).

### 8. Appointment History (Client)
- **Files:** `expoApp/app/appointmentHistory.js`
- **Function:** Displays a list of past appointments with all relevant details (hospital name, address, city, email, booking date).

### 9. General Navigation & API Client
- **Files:** `expoApp/app/login.js`, `expoApp/app/register.js`, `expoApp/app/dashboard.js`, `expoApp/app/index.js`, `expoApp/app/App.js`, and `expoApp/src/api/client.js`
- **Function:** Handles navigation between screens and sets up a global Axios client to interact with the backend API.

---

├── server
│   ├── models
│   │   ├── User.js
│   │   ├── Hospital.js
│   │   ├── Feedback.js
│   │   ├── Appointment.js
│   │   └── MedicalRecord.js
│   ├── routes
│   │   ├── authRoutes.js
│   │   ├── feedbackRoutes.js
│   │   ├── hospitals.js
│   │   ├── appointmentsRoutes.js
│   │   └── medicalRecordsRoutes.js
│   ├── middleware
│   │   └── authMiddleware.js
│   └── app.js
└── expoApp
    ├── app
    │   ├── login.js
    │   ├── register.js
    │   ├── dashboard.js
    │   ├── hospitalNearby.js
    │   ├── appointmentHistory.js
    │   ├── chatbot.js
    │   ├── hospitalDashboard.js
    │   ├── appointment.js
    │   └── index.js
    ├── src
    │   └── api
    │       └── client.js
    └── package.json
