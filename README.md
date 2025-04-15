# Real Estate Marketplace Frontend

This is the Angular frontend for the Real Estate Marketplace application, designed to work with the Spring Boot backend.

## Features

- Browse and filter real estate listings
- Search for properties
- User authentication and registration
- Add new properties with image uploads
- Edit and delete your property listings
- User profiles
- Responsive design for all screen sizes

## Technologies Used

- Angular
- TypeScript
- TailwindCSS
- Swiper.js (for image carousels)
- RxJS
- Angular Router

## Prerequisites

- Node.js (v14.x or later)
- npm (v6.x or later)
- Angular CLI

## Getting Started

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd real-estate-frontend
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Configure the backend API URL
   - Edit `src/environments/environment.ts` for development
   - Edit `src/environments/environment.prod.ts` for production

4. Start the development server
   ```bash
   ng serve
   ```

5. Open your browser and navigate to `http://localhost:4200`

## Building for Production

```bash
ng build --configuration production
```

## Project Structure

- `src/app/components/` - Reusable UI components
- `src/app/pages/` - Page components (routes)
- `src/app/models/` - TypeScript interfaces for data models
- `src/app/services/` - Services for API communication
- `src/app/guards/` - Route guards for authentication
- `src/app/interceptors/` - HTTP interceptors

## Backend API

This frontend is designed to work with the Real Estate Marketplace Backend API. Make sure the backend server is running and the API URL is correctly configured in the environment files.

## Screenshots

[Screenshots will be added here]

## License

[License information] 