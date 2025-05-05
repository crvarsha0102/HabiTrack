# Real Estate Marketplace

A full-stack real estate marketplace application built with Angular for the frontend and Spring Boot for the backend. This platform provides a comprehensive solution for real estate property management.

## Screenshots

<p align="center">
  <img src="Screenshot%202025-04-19%20162601.png" alt="Screenshot 1" width="300"/>
  <img src="Screenshot%202025-04-19%20162638.png" alt="Screenshot 2" width="300"/>
  <br/>
  <img src="Screenshot%202025-04-19%20162817.png" alt="Screenshot 3" width="300"/>
  <img src="Screenshot%202025-04-19%20163232.png" alt="Screenshot 4" width="300"/>
</p>

## Features

- **User Authentication & Authorization**
  - Secure login and registration
  - JWT-based authentication
  - Role-based access control
  - Password encryption

- **Property Management**
  - Add, edit, and delete property listings
  - Support for multiple property types (apartment, house, land, commercial)
  - Property status management (active, inactive, sold, rented)
  - Multiple image uploads with carousel display

- **Advanced Search & Filtering**
  - Search by location, price range, property type, and amenities
  - Filter by furnished status, parking availability, and more
  - Sort by price, date added, property size
  - Keyword-based search

- **User Dashboard**
  - User profile management
  - Property listing management
  - Saved properties and favorites

- **Meeting Scheduling**
  - Schedule property viewings or consultations
  - Meeting status tracking (pending, accepted, declined, cancelled, completed)
  - Meeting reminder notifications
  - Virtual and in-person meeting options

- **Messaging System**
  - Direct communication between users
  - Property-related messaging
  - Message history and thread management
  - Notification system for new messages

- **Property Details**
  - Comprehensive property information display
  - Image gallery with carousel
  - Property features and amenities listing
  - Contact owner functionality

- **Responsive Design**
  - Mobile-first approach
  - Optimized for all device sizes
  - Tailored user experience for different screen sizes

- **Performance Optimization**
  - Server-side rendering for improved SEO
  - Lazy loading of components and images
  - Data pagination for efficient loading

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

## Application Pages

- **Home** - Main landing page featuring:
  - Hero section with property search
  - Featured property listings
  - Call-to-action sections
  - Category browsing

- **Search** - Advanced property search with:
  - Multiple filter options
  - Interactive sorting
  - Grid and list view options
  - Paginated results

- **Property Details** - Comprehensive property information:
  - Image gallery carousel
  - Detailed property specifications
  - Amenities and features
  - Owner contact information
  - Similar properties

- **User Profile** - Personalized user dashboard:
  - Profile information management
  - Property listing management
  - Saved favorites
  - Message center

- **Authentication Pages** - User access management:
  - Login with credential validation
  - Registration with form validation
  - Password recovery

- **Property Forms** - Property management:
  - Add property with multiple sections
  - Edit property details
  - Multi-image upload interface

- **Messaging** - User communication:
  - Message inbox and sent messages
  - Reply functionality
  - Meeting scheduling
  - Message filtering and search

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh authentication token

### Properties
- `GET /api/properties` - Get all properties with optional filters
- `GET /api/properties/{id}` - Get a specific property
- `POST /api/properties` - Create a new property
- `PUT /api/properties/{id}` - Update an existing property
- `DELETE /api/properties/{id}` - Delete a property
- `POST /api/properties/{id}/images` - Upload images for a property
- `PUT /api/properties/status/{id}` - Update property status

### Users
- `GET /api/users/{id}` - Get user profile
- `PUT /api/users/{id}` - Update user profile
- `GET /api/users/{id}/properties` - Get properties for a user
- `POST /api/users/{id}/favorites` - Add property to favorites

### Messaging
- `POST /api/messages/send` - Send a message
- `GET /api/messages/received` - Get received messages
- `GET /api/messages/sent` - Get sent messages
- `PUT /api/messages/{id}/read` - Mark message as read

### Meetings
- `POST /api/meetings` - Create a meeting
- `GET /api/meetings/user/{id}` - Get user's meetings
- `PUT /api/meetings/{id}/status` - Update meeting status

## Deployment

### Frontend
The frontend is built for production using Angular CLI and can be deployed to any static hosting service.

### Backend
The backend is packaged as a Java application and can be deployed using Docker or traditional Java deployment methods.

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## License
This project is licensed under the MIT License - see the LICENSE file for details.
