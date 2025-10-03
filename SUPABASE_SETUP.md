# Supabase Setup Guide for SmartLOR

## What's Already Done

✅ **Database Schema Created**
- `profiles` table for user information
- `lor_requests` table for LOR requests
- `notifications` table for notifications
- Row Level Security (RLS) policies configured
- Auto-notification triggers on status changes

✅ **Code Integration**
- Supabase client configured
- Authentication using Supabase Auth
- All API calls use Supabase
- Real-time auth state management

## How to Use the App

### 1. Sign Up as a Student or Faculty

1. Click "Sign Up" on the login page
2. Fill in your details:
   - Full Name
   - Email
   - Password (minimum 6 characters)
   - Select role: Student or Faculty
   - Department (optional)
3. Click "Create Account"

**Your user account will be created in both:**
- Supabase Auth (authentication)
- `profiles` table (user information)

### 2. For Students

After signing up/logging in:
- Click "New Request" to create a LOR request
- Fill in program details, university, deadline, etc.
- Select a faculty member from the dropdown
- Submit the request
- Track your request status on the dashboard
- Download approved LORs

### 3. For Faculty

After signing up/logging in:
- View all incoming requests on the dashboard
- Click on any request to see details
- Accept or Decline requests
- Generate AI drafts with one click
- Edit drafts inline
- Approve and release final LORs to students

### 4. Notifications

- Bell icon in header shows unread notifications
- Click to view all notifications
- Automatic notifications on:
  - New request submissions
  - Status changes (accepted, declined, approved)
- Toast notifications appear in bottom-right corner

## Database Tables

### `profiles`
Stores user information linked to Supabase Auth users.

**Columns:**
- `id` (uuid) - Links to auth.users
- `email` (text)
- `role` (student | faculty)
- `full_name` (text)
- `department` (text, optional)
- `created_at`, `updated_at` (timestamps)

### `lor_requests`
Stores LOR request information.

**Columns:**
- `id` (uuid)
- `student_id`, `faculty_id` (references profiles)
- `program`, `university`, `purpose` (text)
- `deadline` (date)
- `details` (text)
- `status` (pending | in_review | approved | declined)
- `ai_draft`, `final_lor` (text, optional)
- `created_at`, `updated_at` (timestamps)

### `notifications`
Stores notification history.

**Columns:**
- `id` (uuid)
- `user_id` (references profiles)
- `request_id` (references lor_requests)
- `message` (text)
- `is_read` (boolean)
- `created_at` (timestamp)

## Security (Row Level Security)

All tables have RLS enabled:

- **profiles**: Users can read their own profile + all faculty profiles
- **lor_requests**: Students see their requests, faculty see assigned requests
- **notifications**: Users only see their own notifications

## Troubleshooting

### "Profile creation error" in console
This is usually fine - it means the profile was already created. The app will continue to work.

### Can't see other users
- Students can only see faculty members (to select for requests)
- Faculty members can see their assigned requests
- This is by design for security

### Notifications not appearing
- Notifications are created automatically via database triggers
- Check the bell icon in the header
- Refresh the page if needed
- Auto-refresh happens every 10 seconds

## Environment Variables

Already configured in `.env`:
```
VITE_SUPABASE_URL=https://0ec90b57d6e95fcbda19832f.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Features Working with Supabase

✅ User signup with email/password
✅ User login with session management
✅ Profile creation and retrieval
✅ LOR request creation and listing
✅ Request status updates
✅ AI draft generation (mock implementation)
✅ Draft editing and saving
✅ Final LOR approval and release
✅ Notification creation and management
✅ Real-time notification polling
✅ Row Level Security for data privacy

## Demo Workflow

1. **Create Faculty Account**: Sign up as faculty (e.g., faculty@example.com)
2. **Create Student Account**: Sign up as student (e.g., student@example.com)
3. **Student Creates Request**: Log in as student, create LOR request, select faculty
4. **Faculty Reviews**: Log in as faculty, see request, click to review
5. **Faculty Accepts**: Click "Accept Request" - moves to "In Review"
6. **Generate Draft**: Click "Generate AI Draft"
7. **Edit Draft**: Click "Edit Draft", make changes, save
8. **Approve**: Click "Approve & Release to Student"
9. **Student Downloads**: Log in as student, view approved request, download LOR

Enjoy using SmartLOR! 🎓
