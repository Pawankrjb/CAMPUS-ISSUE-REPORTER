# CampusFix – Campus Issue Reporting System

CampusFix is a web-based complaint management platform that helps college students report infrastructure problems such as damaged roads, broken lights, water leakage, sanitation issues, and building defects. Users can upload a photo, submit location details, and track the status of their report in real time.

This platform removes manual paperwork, ensures faster issue resolution, and brings transparency between students and campus maintenance authorities.

## 🚀 Features
- User authentication (Student, Maintainer, Department Head, Admin)
- Submit complaints with image evidence
- Category-based routing (Road, Electrical, Water, Sanitation, etc.)
- Report verification by Maintainer
- Department Head assignment workflow
- Real-time status tracking (Pending → Verified → Assigned → Completed)
- Comments and feedback system
- Department-wise dashboard
- Multiple image attachments
- Area/Location grouping
- Notification support
- Activity logs & timestamps

## 🧠 How It Works
1. Student reports an issue with photo + description
2. Maintainer verifies and filters fake reports
3. Verified reports are forwarded to the Department Head
4. Department Head marks progress and uploads closure proof
5. Student receives updates and can confirm resolution

## 🎯 Objective
To provide a smart, transparent, and faster mechanism for managing campus infrastructure issues, reducing communication gaps and increasing accountability.

## 🏗️ Tech Stack
### Frontend
- React.js / HTML / CSS / JavaScript
- Bootstrap / Tailwind (responsive UI)

### Backend
- Node.js
- Express.js (REST APIs)

### Database
- MySQL (relational tables for reports, users, departments, etc.)

### Storage
- Firebase Storage / AWS S3 (image handling)

### Authentication
- Firebase Auth / JWT

### Hosting Options
- Vercel / Render / DigitalOcean / Railway

## 📦 Database Entities
- Users
- Reports
- Departments
- Assignments
- Attachments
- Locations
- Notifications
- Comments

## 🔐 Security
- Role-based access control
- Password hashing
- Input validation
- Protected API routes

## 📌 Advantages
- Eliminates manual complaint registers
- Easy issue tracking
- Visual proof of work
- Faster resolution workflow
- Transparent communication

## 🧩 Future Scope
- Native mobile app
- Push notifications
- Priority-based ranking
- AI-based image classification
- Analytics dashboard
- QR code-based reporting spots

---

## 📝 Conclusion
CampusFix digitalizes campus issue reporting, improves student experience, and ensures quick maintenance action with accountability and transparency.
