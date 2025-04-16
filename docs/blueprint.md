# **App Name**: ErrandEase

## Core Features:

- User Authentication: User authentication via Firebase (email/password, Google, phone).
- Role Selection: Users select role (Task Poster or Tasker) during onboarding.
- Task Creation: Form to submit task details (title, description, location, budget, category).
- Task Listing: Task list displaying nearby tasks with filters (category, price).
- Task Details & Acceptance: Displaying task details and an 'Accept' button for Taskers to claim tasks. Using AI tool to categorize tasks based on text descriptions.

## Style Guidelines:

- Light and airy color palette to give a sense of cleanliness and simplicity.
- Accent color: #F2EFE7 , #9ACBD0, #48A6A7, #006A71 to provide a sense of trust and reliability.
- Clear and readable typography for optimal task comprehension.
- Simple, intuitive icons for categories and task types.
- Clean and well-spaced layout for easy navigation.

## Original User Request:
Project Name: MicroTasker

App Description:
A local task and errand marketplace app where users can post small tasks and nearby taskers (gig workers) can accept and complete them for a fee.

User Roles:

Task Poster

Tasker (Gig Worker)

Core Features:

User authentication (Firebase Auth: email, phone, Google login)

Role selection on sign-up (Tasker or Task Poster)

Task creation form (title, description, location, date/time, budget, category dropdown)

Task list screen with filters (location-based, category, price, urgency)

Task detail screen with accept button (for Taskers)

In-app chat between Task Poster and Tasker

Task status updates (Open, Accepted, In Progress, Completed)

Payment integration (Stripe or PayPal)

Ratings & reviews after task completion

User profile & past tasks screen

Database Structure (Cloud Firestore):

users: userID, name, email, role, rating, location

tasks: taskID, userID, title, description, budget, location, status, assignedTo

messages: chatID, senderID, receiverID, message, timestamp

reviews: taskID, rating, reviewText, reviewerID, reviewedID

Additional Requirements:

Push notifications for task updates and messages

Geolocation integration for task proximity sorting

Admin panel to moderate users and tasks

Design Preferences:

Clean, minimal UI

Light theme

Task cards with icons for categories

Map view (optional, for nearby tasks)
  