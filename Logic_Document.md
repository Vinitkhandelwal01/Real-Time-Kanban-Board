#  Logic Document

This document explains the key logic behind two core features of the project: **Smart Assign** and **Conflict Resolution**.

---

##  Smart Assign Logic

**Goal:**  
Automatically assign tasks to users such that workload is balanced across all active participants.

###  How It Works

1. **Active Task Count:**  
   When the user clicks "Smart Assign", the system counts the number of active tasks assigned to each user. Only tasks in `"todo"` or `"inprogress"` states are considered as active.

2. **Least Loaded User:**  
   The system identifies the user with the **lowest number of active tasks**.

3. **Assignment:**  
   The task is then assigned to that user by calling the `updateTask` API with the selected user's ID.

4. **Logging & Sync:**  
   - The activity is logged (e.g., `smart assigned Backend Deploy to Vinit`).
   - A socket event is emitted so that all connected users see the assignment update in real-time.

###  Example:

| User   | Todo | In Progress | Total Active |
|--------|------|-------------|--------------|
| Vinit  | 2    | 1           | 3            |
| Ishu   | 1    | 0           | 1 ←  Smart Assign picks Ishu |

---

##  Conflict Handling Logic

**Goal:**  
Ensure data consistency and prevent overwrites when multiple users try to edit the same task concurrently.

###  How It Works

1. **Version Tracking:**  
   Each task includes a `version` field (number). This is incremented every time the task is updated.

2. **Optimistic Locking:**  
   When a user sends an update, they also send the `version` of the task they last fetched.

3. **Conflict Detection:**  
   - The backend checks if the task's `version` matches the incoming one.
   - If it doesn’t, it means someone else has already updated the task.
   - A `409 Conflict` response is returned, along with the latest server version of the task.

4. **Conflict Modal on Frontend:**  
   The frontend shows a modal allowing the user to:
   -  **Merge**: Choose field-by-field between their version and the server version.
   -  **Overwrite**: Keep their own version entirely.
   -  **Cancel**: Abort the update.

5. **Logging & Sync:**  
   If the user proceeds with merge or overwrite, the final task is updated and broadcast via sockets to all connected clients.

###  Example:

- Tab A and Tab B both load Task X (version 4).
- Tab A updates status to "Done" → backend accepts it and increments version to 5.
- Tab B now tries to assign the same task to a new user → backend sees version mismatch → sends `409 Conflict` with version 5.
- Conflict modal pops up → user resolves → update goes through with version 6.

---

##  Summary

| Feature         | Ensures                     | Mechanism                 |
|----------------|-----------------------------|---------------------------|
| Smart Assign    | Fair load distribution       | Count & assign logic      |
| Conflict Handling | Collaborative data safety | Version-based detection   |

Both features enhance collaboration, fairness, and integrity in real-time multi-user environments.

---
