# Image Upload Microservice

A full-stack microservice solution for image upload, validation, and processing with advanced facial detection.

## Features

### Backend
- **Image Processing**: Converts HEIC to JPEG and extracts image metadata using Sharp
- **Advanced Validation Pipeline**:
  - Facial detection using AWS Rekognition (rejects images with no faces or multiple faces)
  - Format validation (JPG, PNG, HEIC)
  - Size/dimension validation (minimum 300x300px)
  - Similarity detection using perceptual hashing to prevent duplicates
  - Blur detection using Laplacian variance
- **Storage**:
  - Amazon S3 for image files with pre-signed URLs
  - PostgreSQL with Prisma ORM for metadata
- **API Endpoints**:
  - Upload single image
  - Upload multiple images
  - Get user images with filtering and pagination
  - Delete image
  - Get pre-signed URL for image access

### Frontend
- Modern React application with Tailwind CSS
- Drag & drop file uploading with preview
- Client-side validation before uploading
- Real-time upload progress tracking
- Separate sections for accepted and rejected photos
- Detailed rejection reasons for failed uploads
- Dynamic progress bar with minimum (6) and maximum (10) upload requirements

## Tech Stack

### Backend
- Node.js with Express
- Prisma ORM with PostgreSQL
- AWS SDK (S3 and Rekognition)
- Sharp for image processing
- Multer for file uploads

### Frontend
- React with React Hooks
- Tailwind CSS for styling
- Axios for API requests
- React Dropzone for file uploads

## Installation

### Backend Setup

1. Clone the repository and navigate to the backend directory:
```bash
git clone <repository-url>
cd aragon-image-upload
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Create a .env file with the following variables
DATABASE_URL="postgresql://username:password@localhost:5432/aragon_image_upload"
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="us-east-1"
S3_BUCKET_NAME="your-s3-bucket-name"
PORT=3000
```

4. Initialize Prisma and run migrations:
```bash
npx prisma generate
npx prisma migrate dev --name init
```

5. Start the development server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd ../aragon-image-upload-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Create a .env file with the following variables
REACT_APP_API_URL=http://localhost:3000/api
```

4. Start the development server:
```bash
npm start
```

## Project Structure

### Backend
```
aragon-image-upload/
├── config/             # Configuration files
├── prisma/             # Prisma schema and migrations
├── src/
│   ├── controllers/    # Route controllers
│   ├── middleware/     # Express middleware
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   └── utils/          # Helper functions
├── app.js              # Express application setup
├── server.js           # Server entry point
└── package.json        # Dependencies and scripts
```

### Frontend
```
aragon-image-upload-frontend/
├── public/             # Static files
├── src/
│   ├── components/     # React components
│   │   ├── ImageUpload/# Image upload components
│   │   └── UI/         # Reusable UI components
│   ├── services/       # API service
│   ├── utils/          # Helper functions
│   ├── App.js          # Main application component
│   └── index.js        # Entry point
└── package.json        # Dependencies and scripts
```

## API Endpoints

### Image Upload
- `POST /api/images/upload` - Upload a single image
- `POST /api/images/upload/multiple` - Upload multiple images

### Image Retrieval
- `GET /api/images/:userId` - Get all images for a user
- `GET /api/images/:userId?status=ACCEPTED` - Get accepted images for a user
- `GET /api/images/:userId?status=REJECTED` - Get rejected images for a user
- `GET /api/images/url/:imageId` - Get a pre-signed URL for an image

### Image Management
- `DELETE /api/images/:imageId` - Delete an image

## Validation Rules

The system implements the following validation rules:

1. **Face Detection**:
   - Rejects images with no faces
   - Rejects images with multiple faces
   - Rejects images with faces that are too small (< 5% of image area)

2. **Format Validation**:
   - Accepts only JPEG, PNG, and HEIC formats
   - Converts HEIC to JPEG

3. **Dimension Validation**:
   - Rejects images smaller than 300x300 pixels

4. **Similarity Detection**:
   - Rejects images that are over 85% similar to existing ones

5. **Blur Detection**:
   - Rejects blurry images using Laplacian variance algorithm

## Development

### Running Tests
```bash
# Backend tests
cd aragon-image-upload
npm test

# Frontend tests
cd aragon-image-upload-frontend
npm test
```

### Building for Production
```bash
# Backend
cd aragon-image-upload
npm run build

# Frontend
cd aragon-image-upload-frontend
npm run build
```

## License

[MIT](LICENSE)
