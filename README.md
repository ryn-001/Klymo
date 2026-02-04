# Aegis: Secure & Ephemeral Networking

Aegis is a privacy-first communication platform designed for **Klymo Ascent 1.0** by **Team Parity**. The platform leverages AI-driven verification and hardware-level identification to provide a secure environment with a strict **Zero-Retention Policy**.

---

## 🚀 Deployment Links
* **Frontend (App Demo):** [https://aegis-two-black.vercel.app/](https://aegis-two-black.vercel.app/)
* **Backend:** [https://klymo.onrender.com](https://klymo.onrender.com)
* **ML/Flask:** [https://schizoooo-klymo-hackathon.hf.space/classify](https://schizoooo-klymo-hackathon.hf.space/classify)

---

## 🏗️ System Architecture
The platform is built on the principle of "Delete-after-verify" to ensure no personal data is stored.

### 1. Verification & Onboarding
* **Image Capture:** The process begins with real-time image capture on the Landing Page.
* **Secure Transit:** Images are sent to Cloudinary and processed by a Flask-based ML Model for gender classification.
* **Immediate Purge:** Following verification, the image is immediately deleted from Cloudinary regardless of the result.
* **Pseudonymous Profiles:** Successful users proceed to set up profiles using animated avatars, nicknames, and bios rather than real-world identities.

<div align="center" style="background-color:white; padding:15px; border-radius:10px;">
  <img width="1320" height="889" alt="Blank diagram" src="https://github.com/user-attachments/assets/178858de-12a7-48c6-8d3a-96cfc8fbf493" />
</div>


[Image of a system architecture diagram for a web application]


---

## 🤝 3-Tier Queue Matchmaking
Aegis utilizes a 3-tier prioritized matchmaking engine to connect users efficiently:

| Priority | Tier | Logic Description |
| :--- | :--- | :--- |
| **Highest** | **Tier 1: Custom Interests** | Attempts to pair users with high-priority matches based on shared custom interests. |
| **Middle** | **Tier 2: Gender** | If no interest match is found, the system filters based on the user's gender preference. |
| **Lowest** | **Tier 3: FIFO** | As a final fallback, the system pairs the first two available users in the queue (First-In, First-Out). |

<div align="center" style="background-color:white; padding:15px; border-radius:10px;">
  <img width="440" height="660" alt="Blank diagram (1)" src="https://github.com/user-attachments/assets/385fa44f-a31a-4baa-8376-0c550fbb34ed" />
</div>


---

## 🛡️ Privacy & Abuse Prevention
### Device-Based Identification
* **No PII:** The system does not require emails or phone numbers to maintain anonymity.
* **Fingerprinting:** A unique Device ID is generated via `fingerprintjs` to track reporting history without needing a user's real identity.
* **Abuse Monitoring:** This ID is recorded in MongoDB to monitor report counts and enforce bans or cooldowns.

| Number of Reports | Ban Duration |
| :--- | :--- |
| 3 Reports | 6 Hours |
| 5 Reports | 12 Hours |
| 10 Reports | 24 Hours |
| 20 Reports | Permanent Ban |

### Ephemeral Data Policy
* **Zero Retention:** User records and chatrooms are purged from the database immediately upon disconnection or session termination.
* **Local History:** Chat histories are stored only in the user's `LocalStorage` and are never uploaded to a server.
* **Real-time Moderation:** Automated censorship monitors a blacklist of offensive words, blocking them before they reach the recipient.

<div align="center" style="background-color:white; padding:15px; border-radius:10px;">
  <img width="1042" height="640" alt="Blank diagram (2)" src="https://github.com/user-attachments/assets/608b217c-96a6-4d11-81bd-35e0350bba8b" />
</div>


---

## 🛠️ Tech Stack
* **Frontend:** React, Material UI
* **Backend:** Express, Socket.io, MongoDB, Fingerprint.js, Joi Validations, Crypto
* **Machine Learning:** Flask, Hugging Face

---

## 👥 Team Parity
* **Aryan Khaire**
* **Sai Abhang**
* **Chaitanya Patil**
