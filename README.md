#  Real-Time Kanban Board (with Smart Assign & Conflict Resolution)

This project is a full-stack collaborative Kanban board that supports task management with real-time synchronization, smart task assignment, conflict resolution, and activity logging.

---

##  Project Overview

This app allows users to register, login, and manage tasks collaboratively on a Kanban board. It supports drag-and-drop task movement, real-time updates using Socket.IO, and advanced features like **Smart Assign** (automatic load-balanced assignment) and **Conflict Detection** when multiple users try to edit the same task simultaneously.

The app also maintains an activity log of all user actions for traceability.

---

## Tech Stack Used

###  Frontend
- React.js
- CSS Modules
- Socket.IO Client
- Vercel (Deployment)

###  Backend
- Node.js with Express.js
- MongoDB with Mongoose
- JWT Authentication
- Socket.IO Server
- Render (Deployment)

---

##  Setup & Installation Instructions

###  Backend (Express + MongoDB)
```bash
cd backend
npm install
npm run server
```
## Create a .env file in the backend/ directory:
```bash
PORT=4000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```
## Frontend (React):
```bash
cd frontend
npm install
npm run start
```
## Features List & Usage Guide:
| Feature                | Description                                                                |
| ---------------------- | -------------------------------------------------------------------------- |
|  User Auth           | Register/Login with JWT authentication                                     |
|  Task Management     | Create, update, delete tasks with title, description, status, and assignee |
|  Smart Assign        | Automatically assigns task to the user with the least workload             |
|  Manual Assign       | Manually assign a task to any registered user                              |
|  Drag-and-Drop Tasks | Move tasks between columns: Todo, In Progress, and Done                    |
|  Conflict Detection  | If two users edit the same task concurrently, a modal prompts resolution   |
|  Real-time Sync      | Updates are synced instantly across clients using Socket.IO                |
|  Activity Log        | Displays a history of user actions with timestamps                         |

##  Smart Assign Logic
The Smart Assign feature ensures fair distribution of workload across users.
Count how many tasks are actively assigned to each user (with status todo or inprogress).
Identify the user with the least number of active tasks.
Assign the new task to that user.
This minimizes manual load balancing and ensures fair work distribution.

## Conflict Handling Logic:
To avoid silent overwrites during collaborative edits, version control is used:
Each task has a version number.
When a user updates a task, the backend checks if the task's current version matches the request.
If there’s a mismatch, the backend sends a 409 Conflict response with the latest server-side version.
The frontend then opens a Conflict Modal, allowing the user to:
  Merge field-by-field
  Overwrite entirely
  Cancel the operation
  This ensures collaborative safety without losing data.

## Deployed Live App
  Frontend (Vercel): https://your-kanban-frontend.vercel.app
  Backend (Render): https://your-kanban-backend.onrender.com
## Demo Video
  Watch the 5–10 min demo video here
    This video demonstrates:
    Registering and logging in
    Task creation and updates
    Smart Assign in action
    Drag and drop across statuses
    Real-time updates with multiple tabs
    Conflict resolution modal
## Logic Document
 Logic_Document.md — Contains detailed explanations of:
  Smart Assign algorithm
  Conflict resolution mechanism
