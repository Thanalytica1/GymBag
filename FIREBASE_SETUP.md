# Firebase Setup Instructions for GymBag

## Project Configuration
- **Project Name**: GymBag
- **Project ID**: gymbag-29586
- **Project Number**: 67536575856

## Setup Steps

### 1. Complete Firebase Configuration

Open `firebase-config.js` and add your Firebase API keys:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY", // Add your API key here
    authDomain: "gymbag-29586.firebaseapp.com",
    projectId: "gymbag-29586",
    storageBucket: "gymbag-29586.appspot.com",
    messagingSenderId: "67536575856",
    appId: "YOUR_APP_ID" // Add your App ID here
};
```

### 2. Enable Firebase Services

In your Firebase Console (https://console.firebase.google.com/project/gymbag-29586):

1. **Authentication**:
   - Go to Authentication > Sign-in method
   - Enable Email/Password authentication
   - (Optional) Enable Google Sign-in for social login

2. **Firestore Database**:
   - Go to Firestore Database
   - Create database in production mode
   - Set up the following security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Daily progress - users can only access their own
    match /dailyProgress/{document} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // Clients - trainers can only access their own clients
    match /clients/{clientId} {
      allow read, write: if request.auth != null && 
        resource.data.trainerId == request.auth.uid;
    }
    
    // Workout plans - trainers can only access their own
    match /workoutPlans/{planId} {
      allow read, write: if request.auth != null && 
        resource.data.trainerId == request.auth.uid;
    }
  }
}
```

### 3. Local Development

To run the application locally:

```bash
# Using Python's built-in server
python3 -m http.server 8000

# Or using Node.js
npm start
```

Then open http://localhost:8000/signin-page.html

### 4. Database Structure

The application uses the following Firestore collections:

- **users**: User profiles and settings
- **dailyProgress**: Daily task completion data
- **clients**: Client information for trainers
- **workoutPlans**: Workout plans created by trainers

### 5. Features Implemented

✅ User Authentication (Sign up, Sign in, Password reset)
✅ Daily task tracking with persistence
✅ Streak tracking
✅ Client management system
✅ Workout plan management
✅ Progress analytics
✅ Secure data storage with user isolation

### 6. Testing the Application

1. Start with creating a new account on `signup-page.html`
2. You'll be redirected to the dashboard after successful registration
3. Complete daily tasks on `gymbag_webapp.html`
4. View analytics on `gymbag_dashboard.html`
5. Test password reset on `forgot-password-page.html`

### 7. Important Notes

- Replace `YOUR_API_KEY` and `YOUR_APP_ID` in firebase-config.js with your actual Firebase credentials
- The application uses Firebase Authentication for secure user management
- All user data is isolated - users can only access their own data
- Daily progress is automatically saved to Firestore
- The streak counter updates based on daily login patterns