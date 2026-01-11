# FinTech Application

A comprehensive financial technology application built with React, TypeScript, Redux Toolkit, and TailwindCSS. Features role-based access control, user management, and a modern, responsive UI.

## Features

- 🔐 **Role-Based Authentication** - Admin, Maker, Checker, and Investor roles
- 👥 **User Management** - Complete CRUD operations for managing users (Admin only)
- 🎨 **Modern UI** - Built with TailwindCSS and custom components
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- 🔄 **State Management** - Redux Toolkit for predictable state management
- ✅ **Form Validation** - Zod schema validation with react-hook-form
- 🐳 **Docker Support** - Easy deployment with Docker and docker-compose

## Tech Stack

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **State Management**: Redux Toolkit
- **Routing**: React Router v7
- **Form Handling**: React Hook Form + Zod
- **Icons**: Lucide React
- **Date Handling**: date-fns

## Getting Started

### Prerequisites

- Node.js 20+ and npm
- Docker and Docker Compose (for containerized deployment)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fintech-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Docker Deployment

### Using Docker Compose (Recommended)

1. **Build and start the container**
   ```bash
   docker-compose up -d
   ```

2. **Access the application**
   Navigate to `http://localhost:3000`

3. **Stop the container**
   ```bash
   docker-compose down
   ```

### Using Docker Directly

1. **Build the image**
   ```bash
   docker build -t fintech-app .
   ```

2. **Run the container**
   ```bash
   docker run -d -p 3000:80 --name fintech-app fintech-app
   ```

3. **Stop and remove the container**
   ```bash
   docker stop fintech-app
   docker rm fintech-app
   ```

## Default Users

For testing purposes, the following users are available:

| Email | Staff ID | Role | Password |
|-------|----------|------|----------|
| admin@fintech.com | STAFF-100 | Admin | any |
| maker@fintech.com | STAFF-101 | Maker | any |
| checker@fintech.com | STAFF-102 | Checker | any |
| investor@fintech.com | STAFF-103 | Investor | any |

> **Note**: You can login using either **email** or **staff ID**. In demo mode, any password will work for login.

## Database Status

⚠️ **Important**: This application is currently **NOT connected to a database**. All data is stored in-memory using mock data and will reset when the application restarts.

### Current Setup
- Data is stored in JavaScript arrays in memory
- Changes persist only during the current session
- No backend API or database connection
- Perfect for development and demonstration

### To Connect to a Real Database
You would need to:
1. Set up a backend API (Node.js, Python, etc.)
2. Choose and configure a database (PostgreSQL, MySQL, MongoDB)
3. Create API endpoints for CRUD operations
4. Replace mock functions with real API calls
5. Implement proper authentication with JWT or sessions

See the [walkthrough documentation](./walkthrough.md) for detailed implementation guidance.

## User Roles & Permissions

### Admin
- Full system access
- User management (Create, Read, Update, Delete users)
- View all dashboards and features

### Maker
- Create customer records
- Submit IPO applications
- View banking and portfolio information

### Checker
- Verify and approve submissions
- Review pending applications
- Access verification queue

### Investor
- View portfolio
- Track investments
- Apply for IPOs

## User Management (Admin Only)

Admins have access to a comprehensive user management system:

- **Create Users** - Add new users with specific roles
- **Edit Users** - Update user information and status
- **Delete Users** - Remove users from the system
- **Search & Filter** - Find users by name, email, role, or status
- **User Status** - Activate or deactivate user accounts

## Project Structure

```
fintech-app/
├── src/
│   ├── app/              # Redux store configuration
│   ├── components/       # Reusable UI components
│   │   ├── common/       # Common components (Button, Input, Modal, etc.)
│   │   └── layout/       # Layout components (Header, Sidebar, etc.)
│   ├── features/         # Feature-based modules
│   │   ├── admin/        # Admin features (Dashboard, User Management)
│   │   ├── auth/         # Authentication
│   │   ├── checker/      # Checker features
│   │   ├── investor/     # Investor features
│   │   └── maker/        # Maker features
│   ├── services/         # API services and mock data
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Utility functions
├── Dockerfile            # Docker configuration
├── docker-compose.yml    # Docker Compose configuration
├── nginx.conf            # Nginx server configuration
└── package.json          # Project dependencies
```

## Building for Production

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Preview the build**
   ```bash
   npm run preview
   ```

The production build will be created in the `dist` directory.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email support@fintech.com or open an issue in the repository.
