# Lost Item Platform - Backend

A comprehensive NestJS backend for the Lost Item Platform, providing RESTful APIs for user authentication, post management, comments, and more.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with refresh tokens
- **User Management**: User registration, login, profile management
- **Post Management**: Create, read, update, delete posts with categories and filtering
- **Comments System**: Nested comments with likes
- **File Upload**: Image upload support for posts
- **Search & Filtering**: Advanced search and filtering capabilities
- **Database**: PostgreSQL with Prisma ORM
- **Validation**: Comprehensive input validation
- **API Documentation**: Swagger/OpenAPI documentation

## 🛠️ Tech Stack

- **Framework**: NestJS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with Passport.js
- **Validation**: class-validator & class-transformer
- **Documentation**: Swagger/OpenAPI
- **File Upload**: Multer
- **Password Hashing**: bcryptjs

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   # Database Configuration (Supabase)
   DATABASE_URL="postgresql://username:password@host:port/database"
   SUPABASE_URL="https://your-project.supabase.co"
   SUPABASE_ANON_KEY="your-supabase-anon-key"
   SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"

   # JWT Configuration
   JWT_SECRET="your-super-secret-jwt-key-here"
   JWT_REFRESH_SECRET="your-super-secret-refresh-key-here"
   JWT_EXPIRES_IN="15m"
   JWT_REFRESH_EXPIRES_IN="7d"

   # Application Configuration
   PORT=3001
   NODE_ENV=development
   API_PREFIX=api

   # File Upload Configuration
   MAX_FILE_SIZE=5242880
   UPLOAD_DEST=./uploads
   ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp

   # CORS Configuration
   CORS_ORIGIN=http://localhost:3000
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   npm run db:generate

   # Push schema to database
   npm run db:push

   # Seed the database with initial data
   npm run db:seed
   ```

5. **Start the application**
   ```bash
   # Development mode
   npm run start:dev

   # Production mode
   npm run build
   npm run start:prod
   ```

## 📚 API Documentation

Once the application is running, you can access the Swagger documentation at:
```
http://localhost:3001/api/docs
```

## 🔐 Authentication

The API uses JWT-based authentication. Here's how to use it:

1. **Register a new user**
   ```bash
   POST /api/auth/register
   {
     "email": "user@example.com",
     "username": "username",
     "password": "Password123!",
     "confirmPassword": "Password123!",
     "firstName": "John",
     "lastName": "Doe"
   }
   ```

2. **Login**
   ```bash
   POST /api/auth/login
   {
     "email": "user@example.com",
     "password": "Password123!"
   }
   ```

3. **Use the token**
   Include the returned `accessToken` in the Authorization header:
   ```
   Authorization: Bearer <your-access-token>
   ```

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/profile` - Get current user profile

### Users
- `GET /api/users/:id` - Get user profile by ID
- `GET /api/users/username/:username` - Get user profile by username
- `PUT /api/users/profile` - Update current user profile
- `GET /api/users/:id/posts` - Get user posts
- `GET /api/users/:id/stats` - Get user statistics

### Posts
- `GET /api/posts` - Get all posts (with filtering and pagination)
- `POST /api/posts` - Create a new post
- `GET /api/posts/:id` - Get a specific post
- `PUT /api/posts/:id` - Update a post
- `DELETE /api/posts/:id` - Delete a post
- `POST /api/posts/:id/like` - Like a post
- `DELETE /api/posts/:id/like` - Unlike a post

### Comments
- `GET /api/posts/:postId/comments` - Get comments for a post
- `POST /api/posts/:postId/comments` - Create a comment
- `GET /api/posts/:postId/comments/:id` - Get a specific comment
- `PUT /api/posts/:postId/comments/:id` - Update a comment
- `DELETE /api/posts/:postId/comments/:id` - Delete a comment
- `POST /api/posts/:postId/comments/:id/like` - Like a comment
- `DELETE /api/posts/:postId/comments/:id/like` - Unlike a comment

## 🗄️ Database Schema

The application uses the following main entities:

- **Users**: User accounts with profiles and preferences
- **Posts**: Lost/found item posts with categories and locations
- **Comments**: Nested comments on posts
- **Categories**: Post categories (electronics, jewelry, etc.)
- **Likes**: User likes on posts and comments
- **PostImages**: Images associated with posts
- **Notifications**: User notifications

## 🧪 Testing

```bash
# Unit tests
npm run test

# e2e tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📦 Available Scripts

- `npm run start:dev` - Start development server with hot reload
- `npm run build` - Build the application
- `npm run start:prod` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run unit tests
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with initial data
- `npm run db:studio` - Open Prisma Studio

## 🔧 Configuration

The application uses configuration files in the `src/config/` directory:

- `app.config.ts` - Application configuration
- `database.config.ts` - Database configuration
- `jwt.config.ts` - JWT configuration
- `upload.config.ts` - File upload configuration
- `validation.config.ts` - Validation configuration

## 🚀 Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set up environment variables** for production

3. **Run database migrations**
   ```bash
   npm run db:migrate
   ```

4. **Start the application**
   ```bash
   npm run start:prod
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please open an issue in the repository or contact the development team.
