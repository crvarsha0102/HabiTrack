# Real Estate Marketplace

A full-stack real estate marketplace application built with Angular for the frontend and Spring Boot for the backend. This platform allows users to browse, search, and manage property listings with a modern, responsive user interface.

## Live Demo

The application is deployed and accessible at [https://real-estate-marketplace-pi.vercel.app/](https://real-estate-marketplace-pi.vercel.app/)

## Features

- **User Authentication**: Secure login and registration with JWT
- **Property Management**: Add, edit, and delete property listings
- **Property Search**: Advanced filtering and search functionality
- **Image Management**: Upload and display multiple property images
- **User Profiles**: View and manage user information
- **Responsive Design**: Optimized for all device sizes

## Project Structure

The project is organized into two main components:

### Frontend (Angular)

```
real-estate-frontend/
├── src/
│   ├── app/
│   │   ├── components/     # Reusable UI components
│   │   ├── guards/         # Route guards for authentication
│   │   ├── interceptors/   # HTTP interceptors (JWT auth)
│   │   ├── models/         # TypeScript interfaces and models
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── shared/         # Shared modules and utilities
│   ├── assets/             # Static assets (images, icons)
│   └── environments/       # Environment configuration
```

### Backend (Spring Boot)

```
real-estate-backend/
├── src/
│   ├── main/
│   │   ├── java/com/aymen/realestate/
│   │   │   ├── config/          # Application configuration
│   │   │   ├── controller/      # REST API endpoints
│   │   │   ├── dto/             # Data Transfer Objects
│   │   │   ├── entity/          # JPA entities
│   │   │   ├── repository/      # Data access layer
│   │   │   ├── security/        # Authentication and authorization
│   │   │   └── service/         # Business logic
│   │   └── resources/           # Application properties and resources
│   └── test/                    # Unit and integration tests
```

## Technologies Used

### Frontend
- **Angular** - Web application framework
- **TypeScript** - Programming language
- **TailwindCSS** - Utility-first CSS framework
- **Swiper.js** - Modern image carousel
- **RxJS** - Reactive programming library
- **Angular Universal** - Server-side rendering

### Backend
- **Spring Boot** - Java-based framework
- **Spring Security** - Authentication and authorization
- **Spring Data JPA** - Data access layer
- **JWT** - JSON Web Token for secure authentication
- **MySQL** - Relational database
- **Lombok** - Java library to reduce boilerplate code

## Setup Instructions

### Prerequisites
- Node.js (v14.x or later)
- npm (v6.x or later)
- Java Development Kit (JDK) 21
- Maven
- MySQL Database

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd real-estate-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure the backend API URL in `src/environments/environment.ts`:
   ```typescript
   export const environment = {
     production: false,
     apiUrl: 'http://localhost:8080/api'
   };
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Access the application at `http://localhost:4200`

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd real-estate-backend
   ```

2. Configure MySQL database in `src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/real_estate
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   spring.jpa.hibernate.ddl-auto=update
   ```

3. Build and run the application:
   ```bash
   mvn spring-boot:run
   ```

4. The API will be available at `http://localhost:8080/api`

## Available Pages

- **Home** - Main landing page with featured properties
- **Search** - Advanced property search with filters
- **Property Details** - Detailed information about a specific property
- **Profile** - User profile and property management
- **Login/Register** - User authentication
- **Add Property** - Form to create new property listings
- **Edit Property** - Form to update existing property listings

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Properties
- `GET /api/properties` - Get all properties with optional filters
- `GET /api/properties/{id}` - Get a specific property
- `POST /api/properties` - Create a new property
- `PUT /api/properties/{id}` - Update an existing property
- `DELETE /api/properties/{id}` - Delete a property

### Users
- `GET /api/users/{id}` - Get user profile
- `PUT /api/users/{id}` - Update user profile

## Deployment

### Frontend
The frontend is deployed on Vercel for optimal performance and global availability.

### Backend
The backend can be deployed as a containerized application using the provided Dockerfile or on any Java-compatible hosting service.

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## License
This project is licensed under the MIT License - see the LICENSE file for details. 