# Rich Tym Luxe Backend System

A production-ready backend admin system for the Rich Tym Luxe e-commerce website, deployed on Railway using Railway's internal MongoDB service.

## Features

- **Node.js + Express** backend server
- **MongoDB** database via Mongoose
- **JWT Authentication** for admin login
- **Product Management** - Add, edit, delete boutique and mobile phone products
- **Image Upload** with Multer
- **Static File Serving** for images and frontend
- **Modern Admin Dashboard** with soft pink theme

## Project Structure

```
backend/
├── admin/              # Admin dashboard frontend
│   ├── index.html
│   ├── admin.css
│   └── admin.js
├── config/
│   └── db.js           # MongoDB connection
├── controllers/
│   └── productController.js
├── middleware/
│   ├── authMiddleware.js
│   └── errorMiddleware.js
├── models/
│   ├── Admin.js
│   └── Product.js
├── routes/
│   ├── adminRoutes.js
│   └── productRoutes.js
├── uploads/           # Image storage
├── server.js          # Main entry point
├── seed.js           # Database seeder
├── package.json
└── .env.example
```

## Railway Deployment Guide

### 1. Deploy to Railway

1. Push your code to GitHub
2. Go to [Railway.app](https://railway.app)
3. Create a new project and connect your GitHub repository
4. Add a MongoDB plugin to your Railway project
5. Deploy the backend

### 2. Environment Variables

Set these in Railway dashboard under "Variables":

| Variable | Description |
|----------|-------------|
| PORT | Server port (default: 5000) |
| MONGODB_URI | MongoDB connection string from Railway |
| JWT_SECRET | A secure random string for JWT tokens |
| NODE_ENV | Set to "production" |

### 3. Seed the Database

After deployment, run the seed script to create the default admin user:

```bash
npm run seed
```

Default admin credentials:
- Username: `admin`
- Password: `admin123`

**Important**: Change the default password after first login!

## API Endpoints

### Public Routes
- `GET /api/products/boutique` - Get all boutique products
- `GET /api/products/mobile` - Get all mobile products
- `GET /api/products/:id` - Get product by ID

### Admin Routes (Protected)
- `POST /api/admin/login` - Admin login
- `GET /api/admin/profile` - Get admin profile
- `GET /api/products/admin/all` - Get all products (admin)
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Image Upload
- `POST /api/upload` - Upload single image
- `POST /api/upload-multiple` - Upload multiple images

## Development

### Install Dependencies
```bash
cd backend
npm install
```

### Run Locally
```bash
# Create .env file
cp .env.example .env
# Edit .env with your local MongoDB URI

# Start server
npm start
# or
npm run dev
```

### Seed Database
```bash
npm run seed
```

## Admin Dashboard

Access the admin dashboard at: `/admin`

## Product Features

- **Two Product Types**: Boutique and Mobile Phones
- **Dynamic Badges**: New Arrival, Bestseller, Sale (auto-calculated discount)
- **Stock Management**: Track inventory with low stock warnings
- **Image Gallery**: Cover image + multiple additional images

## Tech Stack

- Node.js
- Express.js
- MongoDB / Mongoose
- JWT Authentication
- Multer (file uploads)
- bcryptjs (password hashing)
