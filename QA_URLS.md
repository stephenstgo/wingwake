# QA Testing URLs

## Base URL
- **Local Development**: `http://localhost:3000`
- **Production**: (Update when deployed)

---

## Public Pages (No Authentication Required)

### Authentication
- `/` - Home/Landing page
- `/login` - User login page
- `/signup` - User registration page
- `/auth/callback` - OAuth callback handler (redirects automatically)
- `/auth/auth-code-error` - Authentication error page

---

## Protected Pages (Authentication Required)

### Dashboard
- `/dashboard` - Main dashboard (shows active, pending, and completed flights)
  - Features: Stats cards, flight lists, "Load Example Data" button, "Delete Example Data" button

### Ferry Flights Management
- `/dashboard/flights` - Ferry flights list page (if exists)
- `/dashboard/flights/new` - Create new ferry flight
- `/dashboard/flights/[id]` - View/edit individual ferry flight details
  - Example: `/dashboard/flights/e383711d-0c4e-477f-8b6c-c8c69a6dc1da`
  - Features: Flight overview, discrepancies, mechanic signoffs, FAA permits, documents

### Flight Type Pages (Legacy/Example Pages)
- `/dashboard/flight/delivery` - Delivery flight page
- `/dashboard/flight/demo` - Demo flight page
- `/dashboard/flight/export` - Export flight page
- `/dashboard/flight/inspection` - Inspection flight page
- `/dashboard/flight/maintenance` - Maintenance flight page
- `/dashboard/flight/repositioning` - Repositioning flight page
- `/dashboard/flight/storage` - Storage flight page
- `/dashboard/flight/training` - Training flight page
- `/dashboard/flight/weighing` - Weighing flight page

---

## API Endpoints (For Testing)

### Data Management
- `POST /api/seed` - Create example data (organizations, aircraft, flights)
- `POST /api/delete-example` - Delete example data

### Diagnostic/Testing
- `GET /api/seed/test-auth` - Test authentication context
- `POST /api/seed/test-insert` - Test INSERT operations
- `GET /api/seed/test-rls` - Test RLS policies

---

## Testing Scenarios

### 1. Authentication Flow
1. Visit `/` → Should redirect to `/login` if not authenticated
2. Visit `/login` → Login form
3. Visit `/signup` → Registration form
4. After login → Should redirect to `/dashboard`

### 2. Dashboard Flow
1. Visit `/dashboard` → Should show:
   - Stats cards (Active Flights, Pending Documents, Completed Flights)
   - Flight lists (if any exist)
   - "Load Example Data" button
   - "Delete Example Data" button

### 3. Ferry Flight Management
1. Visit `/dashboard/flights/new` → Create new flight form
2. Create a flight → Should redirect to flight detail page
3. Visit `/dashboard/flights/[id]` → Should show flight details with tabs:
   - Overview
   - Discrepancies
   - Mechanic Signoffs
   - FAA Permits
   - Documents

### 4. Data Seeding
1. Click "Load Example Data" → Should create 9 organizations, 9 aircraft, and flights
2. Check dashboard → Should show created flights
3. Click "Delete Example Data" → Should remove all example data

### 5. Error Scenarios
1. Visit `/dashboard/flights/invalid-id` → Should show 404
2. Try to access `/dashboard` without login → Should redirect to `/login`
3. Visit `/auth/auth-code-error` → Should show error message

---

## Quick Test Checklist

- [ ] Home page loads
- [ ] Login page works
- [ ] Signup page works
- [ ] Dashboard loads after login
- [ ] Can create new ferry flight
- [ ] Can view ferry flight details
- [ ] Can load example data
- [ ] Can delete example data
- [ ] Flight detail page shows all tabs
- [ ] Can add discrepancies
- [ ] Can upload documents
- [ ] Can manage FAA permits
- [ ] Can add mechanic signoffs

---

## Notes

- All `/dashboard/*` routes require authentication
- Dynamic routes like `/dashboard/flights/[id]` need a valid flight ID
- API endpoints return JSON and require authentication (except auth callback)
- The seed/delete buttons are only visible on the dashboard


