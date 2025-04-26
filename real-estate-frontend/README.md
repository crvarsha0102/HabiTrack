# Real Estate Frontend

This is the Angular frontend for the Real Estate Marketplace web application. It provides a modern, responsive UI for browsing property listings, user authentication, and property management.

## Features

- User authentication (login/register) with JWT
- Property listings with search and filtering
- Property details view
- Responsive design with TailwindCSS
- Server-side rendering for improved SEO

## Prerequisites

- Node.js (v14.x or higher)
- npm (v6.x or higher)
- Angular CLI (v17.x)

## Getting Started

1. Clone the repository
```bash
git clone https://github.com/yourusername/real-estate-project.git
cd real-estate-project/real-estate-frontend
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```
The application will open automatically in your default browser at `http://localhost:4200`.

## Project Structure

```
src/
├── app/
│   ├── components/     # Reusable UI components
│   ├── guards/         # Route guards for authentication
│   ├── interceptors/   # HTTP interceptors (JWT auth)
│   ├── models/         # TypeScript interfaces and models
│   ├── pages/          # Page components
│   ├── services/       # API services
│   └── shared/         # Shared modules and utilities
├── assets/             # Static assets (images, icons)
└── environments/       # Environment configuration
```

## Authentication

The application uses JWT authentication. When a user logs in, a JWT token is stored in localStorage and attached to subsequent API requests through the JWT interceptor.

## Styling

The application uses TailwindCSS for styling. Utility classes are used throughout the application for responsive design.

## Building for Production

```bash
npm run build
```

This will generate a production-ready build in the `dist/` folder.

## Server-Side Rendering

The application uses Angular Universal for server-side rendering, which improves SEO and initial load performance.

To run the SSR version:

```bash
npm run build:ssr
npm run serve:ssr
```

## Backend API

This frontend connects to a Spring Boot backend API. The API URL is configured in the `environment.ts` file.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
