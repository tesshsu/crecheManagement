#  Crèche Management System

## Project Overview

 It's designed to manage the assignment of children to daycare centers (crèches). The application consists of a Vue.js frontend and a NestJS backend API, with PostgreSQL as the database, all containerized using Docker.

## Technologies Used

- Frontend: Vue.js 3
- Backend: NestJS
- Database: PostgreSQL
- ORM: TypeORM
- Containerization: Docker and Docker Compose
- API Testing: Postman
- Version Control: Git

## Prerequisites

Ensure you have the following installed on your machine:

- Node.js (LTS version)
- npm (comes with Node.js)
- Docker and Docker Compose
- Git

## Project Structure

```
Tessy_project/
├── front/            # Vue.js frontend
├── backend/          # NestJS backend
└── docker-compose.yml
```

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd tessy_project
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

### Backend API testing video
https://youtu.be/8g0QPkY0yWo

### Frontend testing video
https://youtu.be/fQnbcldXH0s

## API Testing

There's a JSON file that can be imported into Talend API Tester for easy API testing and exploration.

### API Test File

You can find our API test file here: [API.json](./backend/API.json)

### Using the API Test File

To use this file for testing our API:

1. Install the Talend API Tester extension for your browser:
   - [Chrome Web Store](https://chrome.google.com/webstore/detail/talend-api-tester-free-ed/aejoelaoggembcahagimdiliamlcdmfm)
   - [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/talend-api-tester/)

2. Open Talend API Tester in your browser.

3. Click on the "Import" button.

4. Select the `API.json` file from the `backend` folder of this project.

5. You should now see a list of all available API endpoints for the Test project.
