# ElectroMart Backend

This is the backend service for the ElectroMart e-commerce platform, providing RESTful APIs for Firebase integration, Cloudinary image management, and Razorpay payment processing.

## Features

- **Firebase Integration**: CRUD operations for Firestore collections
- **Cloudinary Integration**: Image upload, management, and optimization
- **Razorpay Integration**: Payment processing and verification
- **Authentication Middleware**: JWT-based authentication with Firebase
- **Order Management**: Complete order lifecycle management
- **RESTful API**: Well-structured API endpoints

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase project
- Cloudinary account
- Razorpay account

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

2. Navigate to the backend directory:
   ```bash
   cd backend
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

5. Configure environment variables in the `.env` file with your credentials.

## Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Firebase Configuration
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
FIREBASE_APP_ID=your_firebase_app_id
FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

## Running the Application

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
# Build the application
npm run build

# Start the application
npm start
```

## API Endpoints

### Firebase Operations
- `GET /api/firebase/:collectionName` - Get all documents in a collection
- `GET /api/firebase/:collectionName/:docId` - Get a specific document
- `POST /api/firebase/:collectionName` - Add a new document
- `PUT /api/firebase/:collectionName/:docId` - Update a document
- `DELETE /api/firebase/:collectionName/:docId` - Delete a document

### Cloudinary Operations
- `POST /api/cloudinary/upload` - Upload an image
- `DELETE /api/cloudinary/delete/:publicId` - Delete an image
- `GET /api/cloudinary/details/:publicId` - Get image details

### Payment Operations
- `POST /api/payment/create-order` - Create a new Razorpay order
- `POST /api/payment/verify-payment` - Verify payment signature
- `GET /api/payment/order/:orderId` - Get order details
- `GET /api/payment/payment/:paymentId` - Get payment details

## Project Structure

```
backend/
├── config/          # Configuration files
├── controllers/     # Request handlers
├── middleware/      # Custom middleware
├── models/          # Data models
├── routes/          # API route definitions
├── services/        # Business logic
├── utils/           # Utility functions
├── .env.example     # Environment variables template
├── server.ts        # Main server file
├── package.json     # Project dependencies
└── tsconfig.json    # TypeScript configuration
```

## Authentication

Most endpoints require authentication using Firebase ID tokens. Include the token in the Authorization header:

```
Authorization: Bearer <firebase_id_token>
```

## Error Handling

All API responses follow a consistent format:

```json
{
  "success": true|false,
  "data": {},
  "message": "Description of the response"
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## License

This project is licensed under the MIT License."# electromart-backend" 
