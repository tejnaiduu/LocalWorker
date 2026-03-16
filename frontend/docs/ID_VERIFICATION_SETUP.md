# Worker ID Verification Feature - Implementation Guide

## Overview
The Worker ID Verification feature allows workers to upload their ID proof (Aadhaar, PAN, or Driving License) during registration or profile update. Admins can then review and approve these documents before the worker is verified in the system.

## ✅ Feature Status: FULLY IMPLEMENTED

### Backend Implementation
- **Multer Configuration**: File uploads are handled via Multer in `/backend/routes/idProofRoutes.js`
- **Upload Directory**: Files are stored in `/backend/uploads/idproofs/`
- **Worker Model**: Updated with ID proof fields:
  - `idProof` (string): Filename of the uploaded proof
  - `idProofApproved` (boolean): Admin approval status
  - `isVerified` (boolean): Worker verification status

### API Endpoints

#### Worker ID Proof Upload
```
POST /api/idproof/upload
Headers: Authorization: Bearer {token}
Body: formData with 'idProof' file (JPG, PNG, or PDF, max 5MB)
Response: { success: true, message: "...", filename: "...", worker: {...} }
```

#### Admin Verification Endpoints
```
GET /api/admin/idproofs/pending
- Returns list of workers with pending ID proof approvals

PUT /api/admin/idproofs/:workerId/approve
- Marks worker's ID proof as approved

PUT /api/admin/idproofs/:workerId/reject
- Rejects and removes worker's ID proof
```

## Frontend Components

### 1. IDProofUpload Component
**Location**: `/frontend/src/components/idProof/IDProofUpload.jsx`

**Features**:
- File selection with validation
- File type validation (JPG, PNG, PDF)
- File size validation (max 5MB)
- Upload progress indication
- Displays current upload status
- Shows approval status (Pending/Approved)

**Usage**:
```jsx
import IDProofUpload from '../idProof/IDProofUpload';

<IDProofUpload onClose={() => {/* Handle close */}} />
```

### 2. IDProofVerification Component (Admin)
**Location**: `/frontend/src/components/idProof/IDProofVerification.jsx`

**Features**:
- Displays all pending ID proofs
- Shows worker details (name, skill, phone, location, experience)
- Approve/Reject buttons for each submission
- Real-time updates after approval/rejection

**Access**: Admin Panel → ID Proofs menu item

### 3. WorkerRegister Integration
**Location**: `/frontend/src/components/worker/WorkerRegister.jsx`

**Flow**:
1. Worker fills in profile details (name, skill, experience, location)
2. Clicks "Complete Profile" or "Update Profile"
3. On success, ID proof upload panel appears automatically
4. Worker can upload ID or skip for now
5. After upload, worker is redirected to dashboard

## Complete Worker Registration Flow

```
┌─ Registration Start ─────────────┐
│  Name, Phone, Skill, Experience  │
│  Location (Manual/Map/Geolocation)
│  ├─ Save Profile                 │
│  └─ Show Success Message  ✓      │
└────────────────────────────────┘
              ↓
┌─ ID Proof Upload ────────────────┐
│  Select ID Type:                 │
│  - Aadhaar Card                  │
│  - PAN Card                      │
│  - Driving License               │
│  - Upload File (JPG/PNG/PDF)     │
│  - Show upload status            │
│  ├─ Continue to Dashboard  ✓     │
│  └─ Skip for Now          (☐)    │
└────────────────────────────────┘
              ↓
┌─ Worker Dashboard ───────────────┐
│  - View Profile                  │
│  - ID Status: Pending/Approved   │
│  - Find Bookings                 │
│  - Manage Availability           │
└────────────────────────────────┘
              ↓
┌─ Admin Verification ─────────────┐
│  Admin Panel → ID Proofs Section  │
│  - View pending proofs           │
│  - Review worker details         │
│  - Approve/Reject               │
│  - Update worker status         │
└────────────────────────────────┘
```

## File Structure

### Backend
```
backend/
├── models/
│   └── Worker.js (includes idProof, idProofApproved fields)
├── routes/
│   ├── idProofRoutes.js (file upload & manual verification)
│   └── adminRoutes.js (admin verification endpoints)
├── middleware/
│   └── auth.js (token validation)
├── uploads/
│   └── idproofs/ (uploaded files stored here)
└── server.js (routes registered)
```

### Frontend
```
frontend/
├── src/
│   ├── components/
│   │   ├── idProof/
│   │   │   ├── IDProofUpload.jsx
│   │   │   └── IDProofVerification.jsx
│   │   └── worker/
│   │       └── WorkerRegister.jsx (integrated)
│   ├── pages/
│   │   └── admin/
│   │       ├── AdminLayout.jsx (sidebar link added)
│   │       └── IDProofVerification.jsx (route)
│   └── styles/
│       └── IDProofUpload.css
└── App.jsx (routes configured)
```

## Testing the Feature

### For Workers:

1. **Register as a new worker**:
   - Go to `/worker-register`
   - Fill all profile details
   - Click "Complete Profile"
   - See ID upload panel appear
   - Upload ID proof (JPG/PNG/PDF, <5MB)
   - See success message

2. **Upload ID proof later**:
   - Go to worker dashboard
   - Find ID proof section
   - Upload whenever ready

3. **Check verification status**:
   - Dashboard shows: "Pending Approval" or "✓ Approved"

### For Admins:

1. **Review pending proofs**:
   - Login as admin
   - Go to Admin Panel
   - Click "ID Proofs" (📄) in sidebar
   - See list of workers with pending proofs

2. **Approve worker**:
   - Click "✓ Approve" button
   - Worker status updates immediately
   - Worker can now receive bookings

3. **Reject proof**:
   - Click "✕ Reject" button
   - File is deleted, worker notified
   - Worker can upload again

## Key Features Implemented

✅ **File Upload**
- Multer middleware configured
- File type validation (JPG, PNG, PDF)
- File size limit (5MB max)
- Automatic storage in uploads directory

✅ **Database Integration**
- Worker model updated with idProof fields
- Automatic file path saving
- Approval status tracking

✅ **Admin Dashboard**
- View pending proofs
- Approve/reject with one click
- Real-time updates
- Worker details display

✅ **Worker Experience**
- Auto-prompted after profile save
- File upload with validation feedback
- Skip option for later
- Status display in dashboard

✅ **Security**
- Token-based authentication
- Admin authorization middleware
- File type validation
- File size limits

## Configuration

### File Upload Settings (Backend)

**Max File Size**: 5MB (configurable in `idProofRoutes.js`)
```javascript
limits: { fileSize: 5 * 1024 * 1024 }
```

**Allowed File Types**: JPG, PNG, PDF
```javascript
const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
```

**Upload Directory**: `/backend/uploads/idproofs/`

### Environment Variables

Ensure these are set in `.env`:
```
MONGODB_URI=your_mongodb_connection
JWT_SECRET=your_jwt_secret
```

## Troubleshooting

### Issue: Upload fails with "No file uploaded"
- **Solution**: Ensure file is selected and ContentType header is set to 'multipart/form-data'

### Issue: File size exceeds limit
- **Solution**: Use files smaller than 5MB. Compress images if needed.

### Issue: Unsupported file type
- **Solution**: Only JPG, PNG, and PDF files are supported.

### Issue: Admin can't see pending proofs
- **Solution**: Ensure logged-in user has 'admin' role in database

### Issue: Approve/Reject buttons don't work
- **Solution**: Check network tab in browser DevTools for API errors. Ensure admin token is valid.

## Future Enhancements

- [ ] OCR integration to extract information from ID cards
- [ ] Automatic verification using AI/ML
- [ ] Bulk upload for multiple documents
- [ ] Document expiry tracking (for licenses, etc.)
- [ ] Multiple document uploads
- [ ] Document versioning and history
- [ ] Email notifications on approval/rejection

## Security Considerations

1. **File Validation**: Server validates file type and size
2. **Authentication**: All endpoints require valid JWT token
3. **Authorization**: Admin-only endpoints check admin role
4. **File Storage**: Files stored outside web root, not directly accessible
5. **CORS**: Proper CORS headers configured for secure cross-origin requests

## Support

For issues or questions:
1. Check browser console for errors
2. Check network tab for API response
3. Check server logs for backend errors
4. Ensure all required fields are filled
5. Try uploading a different file/format

---

**Last Updated**: March 16, 2026
**Status**: Production Ready ✅
