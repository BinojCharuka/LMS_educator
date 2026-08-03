# 🎓 Educator LMS

![Educator LMS Cover](https://via.placeholder.com/1200x600/4F46E5/FFFFFF?text=Educator+LMS+-+Premium+Online+Learning+Platform)

Educator LMS is a comprehensive, modern, and highly scalable Learning Management System (LMS) designed for online education, tutoring centers, and independent instructors. It offers a seamless experience with dedicated portals for Students, Teachers, and Administrators, wrapped in a premium, glassmorphic UI built with React and Tailwind CSS.

## ✨ Key Features

### 🧑‍🎓 Student Portal
* **Course Catalog:** Browse and enroll in available lesson packs and courses.
* **Payment Approvals:** Upload bank slips directly to the platform for manual approval by instructors.
* **Rich Study Materials:** Access protected video lectures (HLS Streaming), PDF documents, and assignments.
* **Live Classes:** Securely join scheduled Zoom/Teams live classes directly from the dashboard.
* **Performance Tracking:** View examination results and overall progress.

### 🧑‍🏫 Teacher Portal
* **Course & Content Management:** Create, update, and manage lesson packs, topics, and study materials.
* **Student Management:** View enrolled students, track their progress, and manage their access.
* **Payment Verification:** Review and approve/reject bank slips uploaded by students to grant course access.
* **Result Publishing:** Add and manage results for student examinations and assignments.
* **Cloud Storage Integration:** Upload media directly to Cloudinary and Cloudflare R2 (for secure video hosting).

### 👨‍💻 Admin Panel
* **User Management:** Create, delete, and manage roles (Student/Teacher/Admin).
* **Access Control:** Enable/disable accounts or reset passwords securely.
* **Activity Logging:** Comprehensive audit trail tracking every administrative action (who, what, when, and IP address) for maximum security and compliance.

## 🛠️ Tech Stack

### Frontend (Client)
* **Framework:** React 18 (via Vite)
* **Styling:** Tailwind CSS (Custom themes, gradients, and animations)
* **Routing:** React Router DOM v6
* **State Management:** React Context API
* **Video Player:** Plyr & Hls.js (for secure HTTP Live Streaming)
* **HTTP Client:** Axios

### Backend (Server)
* **Runtime:** Node.js & Express.js
* **Database:** MongoDB (Mongoose ORM)
* **Authentication:** JSON Web Tokens (JWT) & bcryptjs
* **Storage / CDNs:** 
  * Cloudinary (Images, basic PDFs, Payment Slips)
  * Cloudflare R2 / AWS S3 (Large protected video streaming)
  * Multer (Multipart/form-data parsing)

## 🚀 Getting Started

### Prerequisites
* Node.js (v16 or higher)
* MongoDB database (Local or Atlas)
* Cloudinary Account
* Cloudflare R2 or AWS S3 Bucket (Optional, for large video hosting)

### 1. Clone the repository
```bash
git clone https://github.com/BinojCharuka/LMS_educator.git
cd LMS_educator
```

### 2. Backend Setup
```bash
cd server
npm install
```
Create a `.env` file in the `server` directory (Refer to `server/.env.example`):
```env
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```
Run the database seeder to create default Admin and Teacher accounts:
```bash
npm run seed
```
Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd ../client
npm install
```
Create a `.env` file in the `client` directory:
```env
VITE_API_URL=http://localhost:5001/api
```
Start the development server:
```bash
npm run dev
```

## 🔐 Default Seed Accounts
If you ran `npm run seed` during the backend setup, the following accounts are available for testing:
* **Admin:** admin@educator.lms / Admin@1234
* **Teacher:** teacher@educator.lms / Teacher@1234
* **Student:** student@educator.lms / Student@1234

## 🎨 UI/UX Highlights
* **Glassmorphism:** Strategic use of blurred backgrounds and translucent panels.
* **Responsive Design:** Fully mobile-optimized dashboards and landing pages.
* **Accessibility:** Thoughtful color contrast, focus states, and aria labels.

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

---
*Designed with ❤️ by [Charu Design Studio](https://charustudio.com)*
