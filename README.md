# Fake Stack Overflow 

## Overview
This project is a full-stack web application designed to mimic the core functionalities of a forum website, such as Stack Overflow. The website implementation utilizes a combination of front-end and back-end technologies to create a feature-rich platform for users to ask questions, provide answers, and interact with other users.

In 2024, the project was expanded and revamped with more professional website capabilities and sleeker UI design. 

## Key Features
- **Front-End**: Built with React for dynamic, responsive UI components. Styled with CSS for a professional and clean look.
    - A login system with client-side validation.
    - A search functionality for filtering questions by tags, keywords, or user.
- **Back-End**: Powered by Node.js with an Express.js framework.
    - Utilizes MongoDB with Mongoose for database schema modeling and data storage.
    - Provides a REST API to handle:
    - User registration and login.
    - Question creation, retrieval, and updates.
    - Answer submission and updates.
    - Searching for questions and answers.
    - Includes bcrypt for secure password hashing.

## Database
MongoDB stores user profiles, questions, answers, and tags.
Key database models:
    - Tag: Categorizes questions.
    - Profile: Stores user details (e.g., username, email, reputation).
    - Question: Stores information about questions, tags, and answers.
    - Answer: Stores user-submitted answers.

## Server
Hosted locally on http://localhost:8000 for development.
Gracefully shuts down the server and disconnects the database during interruptions (e.g., SIGINT).

## API Endpoints
    - GET /: Returns a basic server status.
    - POST /questions: Creates a new question.
    - GET /questions: Fetches questions based on filters.
    - POST /login: Handles user login with hashed passwords.

## Installation
1. Clone the Repository:
```bash
    git clone git@github.com:<your-username>/<repository-name>.git
    cd <repository-name>
```
2. Install Dependencies:
```bash
    npm install
```
3. Run MongoDB Locally:
    Ensure MongoDB is running on your system.
    Default connection string: mongodb://127.0.0.1:27017/fake_so.
4. Start the Application:
```bash
    node server.js
```
5. Run Front-End (React):
    Navigate to the front-end directory.
    Install dependencies and start:
```bash
    cd client
    npm install
    npm start
```

## Technology Stack
- **Frontend**: React, Axios, HTML, CSS, JavaScript
- **Backend**: Node.js, Express.js, bcrypt
- **Database**: MongoDB, Mongoose

## 2024 Updates
- Updated README.md with usage instructions and project structure.

# Contributions are welcome. Please fork the repository, make your changes, and submit a pull request.