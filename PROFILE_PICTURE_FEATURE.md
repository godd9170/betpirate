# Profile Picture Feature

## Overview
Users can now add profile pictures during onboarding. The feature supports:
- Taking photos with device camera
- Selecting images from gallery/camera roll
- Automatic client-side compression
- Server-side optimization to 500x500px
- Storage as BLOB in PostgreSQL

## Implementation Details

### Database
- Added `profilePicture` field (Bytes) to `Sailor` model in Prisma schema
- Stored as BLOB in PostgreSQL for efficient retrieval

### Components
- **ProfilePictureUpload** (`app/components/ProfilePictureUpload/index.tsx`)
  - Dual-button interface: Camera and Gallery
  - Client-side compression using `browser-image-compression`
  - Real-time preview with remove option
  - Loading states during processing

### Image Processing
- **Client-side**: `browser-image-compression` reduces file size before upload
- **Server-side**: `sharp` resizes to exactly 500x500px with 85% JPEG quality
- Images stored as base64 data URLs in form, converted to Buffer on server

### Routes
- **Onboard** (`app/routes/onboard._index.tsx`): Upload during onboarding
- **Profile Picture Endpoint** (`app/routes/sailors.$sailorId.profile-picture.tsx`): Serves images via `/sailors/{id}/profile-picture`

### Usage Example
```tsx
// Display a sailor's profile picture
<img 
  src={`/sailors/${sailor.id}/profile-picture`}
  alt={sailor.username}
  className="rounded-full"
/>
```

## Dependencies
- `browser-image-compression`: Client-side compression
- `sharp`: Server-side image processing
- `@types/sharp`: TypeScript definitions
