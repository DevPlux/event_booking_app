# 🎟️ Eventora – Event Booking Mobile Application

A full-stack mobile application developed for the **SE2020 – Web and Mobile Technologies** assignment.

Eventora allows users to discover events, view event details, book tickets, and manage their bookings. Administrators can create and manage events and process customer bookings.

---

## ✨ Main Features

### Customer

- Register and login
- Browse upcoming events
- Search and filter events
- View event details
- Book event tickets
- View personal bookings
- Track booking status
- Cancel eligible bookings
- Manage profile

### Administrator

- Create events
- Edit events
- Delete events
- Upload event cover images
- Manage event capacity
- View all customer bookings
- Confirm, complete, or cancel bookings

---

## 🛠️ Tech Stack

### Mobile

- React Native
- Expo
- TypeScript
- React Navigation
- Axios
- AsyncStorage
- Expo Image Picker
- Native Date & Time Picker
- Ionicons

### Backend

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT
- bcryptjs
- Multer
- Cloudinary

---

## 📂 Project Structure

```text
event-booking-app/
│
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   │   ├── User.js
│   │   ├── Event.js
│   │   └── Booking.js
│   ├── routes/
│   ├── config/
│   └── server.js
│
└── mobile/
    ├── src/
    │   ├── api/
    │   ├── components/
    │   ├── config/
    │   ├── context/
    │   ├── navigation/
    │   ├── screens/
    │   │   ├── auth/
    │   │   ├── events/
    │   │   ├── bookings/
    │   │   ├── admin/
    │   │   └── profile/
    │   ├── theme/
    │   └── types/
    └── App.tsx
```
