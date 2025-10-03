/*
  # SmartLOR Database Schema
  
  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text)
      - `role` (text: 'student' or 'faculty')
      - `full_name` (text)
      - `department` (text, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `lor_requests`
      - `id` (uuid, primary key)
      - `student_id` (uuid, foreign key to profiles)
      - `faculty_id` (uuid, foreign key to profiles)
      - `program` (text)
      - `university` (text)
      - `purpose` (text)
      - `deadline` (date)
      - `details` (text)
      - `status` (text: 'pending', 'in_review', 'approved', 'declined')
      - `ai_draft` (text, nullable)
      - `final_lor` (text, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `notifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `request_id` (uuid, foreign key to lor_requests)
      - `message` (text)
      - `is_read` (boolean)
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS on all tables
    - Users can read their own profile data
    - Students can create requests and view their own requests
    - Faculty can view requests assigned to them
    - Notifications are private to each user
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL CHECK (role IN ('student', 'faculty')),
  full_name text NOT NULL,
  department text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can read faculty profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (role = 'faculty');

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create lor_requests table
CREATE TABLE IF NOT EXISTS lor_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  faculty_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  program text NOT NULL,
  university text NOT NULL,
  purpose text NOT NULL,
  deadline date NOT NULL,
  details text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'approved', 'declined')),
  ai_draft text,
  final_lor text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE lor_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own requests"
  ON lor_requests FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Faculty can view assigned requests"
  ON lor_requests FOR SELECT
  TO authenticated
  USING (faculty_id = auth.uid());

CREATE POLICY "Students can create requests"
  ON lor_requests FOR INSERT
  TO authenticated
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Faculty can update assigned requests"
  ON lor_requests FOR UPDATE
  TO authenticated
  USING (faculty_id = auth.uid())
  WITH CHECK (faculty_id = auth.uid());

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  request_id uuid REFERENCES lor_requests(id) ON DELETE CASCADE,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_lor_requests_student_id ON lor_requests(student_id);
CREATE INDEX IF NOT EXISTS idx_lor_requests_faculty_id ON lor_requests(faculty_id);
CREATE INDEX IF NOT EXISTS idx_lor_requests_status ON lor_requests(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lor_requests_updated_at
  BEFORE UPDATE ON lor_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to create notification on request status change
CREATE OR REPLACE FUNCTION create_status_notification()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO notifications (user_id, request_id, message, is_read, created_at)
    VALUES (
      NEW.student_id,
      NEW.id,
      'Your LOR request has been ' || NEW.status,
      false,
      now()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notify_on_status_change
  AFTER UPDATE ON lor_requests
  FOR EACH ROW
  EXECUTE FUNCTION create_status_notification();