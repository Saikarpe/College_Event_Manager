-- ============================================================
-- college_events.sql
-- MySQL Database Schema for CampusConnect Event Management
-- 
-- How to use:
-- 1. Open phpMyAdmin (http://localhost/phpmyadmin)
-- 2. Click "SQL" tab and paste this entire file
-- 3. Click "Go"
-- ============================================================

-- Create the database if it doesn't already exist
CREATE DATABASE IF NOT EXISTS college_events;

-- Select this database for all following commands
USE college_events;

-- ────────────────────────────────────────
-- TABLE 1: departments
-- Stores all departments of the college
-- ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS departments (
    id         VARCHAR(10)  NOT NULL PRIMARY KEY,   -- e.g. 'cs', 'it', 'ece'
    name       VARCHAR(100) NOT NULL,               -- Full name: 'Computer Science'
    short_name VARCHAR(10)  NOT NULL                -- Abbreviation: 'CS'
);

-- ────────────────────────────────────────
-- TABLE 2: coordinators
-- One coordinator per department; they manage clubs and events
-- ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coordinators (
    id        INT         NOT NULL AUTO_INCREMENT PRIMARY KEY,
    dept_id   VARCHAR(10) NOT NULL,
    coord_id  VARCHAR(30) NOT NULL,   -- Login username e.g. 'COORD-CS-01'
    password  VARCHAR(50) NOT NULL,   -- Password (plain text for demo; use hashing in real apps)
    FOREIGN KEY (dept_id) REFERENCES departments(id)  -- Must exist in departments table
);

-- ────────────────────────────────────────
-- TABLE 3: clubs
-- Student clubs/organizations under each department
-- ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clubs (
    id          INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
    dept_id     VARCHAR(10)  NOT NULL,
    name        VARCHAR(100) NOT NULL,
    category    VARCHAR(50)  NOT NULL DEFAULT 'Technical',
    description TEXT,
    FOREIGN KEY (dept_id) REFERENCES departments(id)
);

-- ────────────────────────────────────────
-- TABLE 4: events
-- Events organized by student clubs
-- ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS events (
    id          INT           NOT NULL AUTO_INCREMENT PRIMARY KEY,
    dept_id     VARCHAR(10)   NOT NULL,
    club_id     INT           NOT NULL,
    title       VARCHAR(150)  NOT NULL,
    description TEXT,
    event_date  DATE          NOT NULL,
    event_time  VARCHAR(20)   NOT NULL DEFAULT '10:00 AM',
    venue       VARCHAR(100)  NOT NULL,
    status      ENUM('upcoming','ongoing','past') NOT NULL DEFAULT 'upcoming',
    rsvp_count  INT           NOT NULL DEFAULT 0,
    FOREIGN KEY (dept_id) REFERENCES departments(id),
    FOREIGN KEY (club_id) REFERENCES clubs(id)
);

-- ────────────────────────────────────────
-- TABLE 5: rsvp
-- Student event registrations — inserted by the Java Servlet
-- ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rsvp (
    id              INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
    event_id        INT          NOT NULL,
    student_name    VARCHAR(100) NOT NULL,
    student_email   VARCHAR(100) NOT NULL,
    registered_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id)
);

-- ============================================================
-- SEED DATA: Sample records to demo the application
-- ============================================================

-- Insert all 8 departments
INSERT INTO departments (id, name, short_name) VALUES
    ('cs',  'Computer Science',           'CS'),
    ('it',  'Information Technology',     'IT'),
    ('ece', 'Electronics & Computer Eng', 'ECE'),
    ('me',  'Mechanical Engineering',     'ME'),
    ('ee',  'Electrical Engineering',     'EE'),
    ('mx',  'Mechatronics',               'MX'),
    ('st',  'Structural Engineering',     'ST'),
    ('cv',  'Civil Engineering',          'CV');

-- Insert one coordinator per department
INSERT INTO coordinators (dept_id, coord_id, password) VALUES
    ('cs',  'COORD-CS-01',  'cs@123'),
    ('it',  'COORD-IT-01',  'it@123'),
    ('ece', 'COORD-ECE-01', 'ece@123'),
    ('me',  'COORD-ME-01',  'me@123'),
    ('ee',  'COORD-EE-01',  'ee@123'),
    ('mx',  'COORD-MX-01',  'mx@123'),
    ('st',  'COORD-ST-01',  'st@123'),
    ('cv',  'COORD-CV-01',  'cv@123');

-- Insert sample clubs (id is auto-assigned: 1–8)
INSERT INTO clubs (dept_id, name, category, description) VALUES
    ('cs',  'Coding Club',        'Technical', 'Competitive programming and software development workshops.'),
    ('cs',  'AI/ML Society',      'Technical', 'Artificial intelligence and machine learning research projects.'),
    ('cs',  'Cultural Society',   'Cultural',  'Arts, music, drama and cultural events for all students.'),
    ('it',  'CSI Chapter',        'Technical', 'Computer Society of India student chapter activities.'),
    ('ece', 'IEEE ECE',           'Technical', 'IEEE student branch for electronics and communication enthusiasts.'),
    ('me',  'Robocon Team',       'Technical', 'National Robocon robotics competition team.'),
    ('ee',  'Power Systems Club', 'Technical', 'Electrical power systems and smart grid research group.'),
    ('cv',  'GreenBuild Club',    'Social',    'Sustainable construction and eco-friendly design initiatives.');

-- Insert sample events
INSERT INTO events (dept_id, club_id, title, description, event_date, event_time, venue, status, rsvp_count) VALUES
    ('cs',  1, 'Code Sprint 2026',    '24-hour competitive programming marathon. Cash prizes worth 15,000.',        '2026-04-15', '8:00 AM',  'CS Building',        'upcoming', 98),
    ('cs',  2, 'AI & ML Seminar',     'Expert talk on real-world applications of AI and ML in industry.',           '2026-04-18', '11:00 AM', 'Seminar Hall A',     'upcoming', 72),
    ('it',  4, 'Web Dev Bootcamp',    '3-day hands-on bootcamp — HTML, CSS, JavaScript, and PHP.',                 '2026-04-10', '10:00 AM', 'Lab 3 & 4',          'upcoming', 56),
    ('ece', 5, 'Arduino Workshop',    'Build IoT projects from scratch using Arduino microcontrollers.',             '2026-04-08', '2:00 PM',  'Electronics Lab',    'ongoing',  34),
    ('me',  6, 'Robocon Qualifier',   'Internal qualifier for the national Robocon robotics competition.',          '2026-04-20', '9:00 AM',  'Mech Workshop',      'upcoming', 28),
    ('cs',  3, 'Tarang Cultural Fest','Annual cultural extravaganza — dance, drama, music and art.',                '2026-04-25', '5:00 PM',  'Auditorium',         'upcoming', 210),
    ('ee',  7, 'Smart Grid Talk',     'Industry expert session on smart grids and renewable energy integration.',   '2026-04-08', '3:00 PM',  'EE Seminar Room',    'ongoing',  41),
    ('cv',  8, 'Green Build Expo',    'Showcase of sustainable construction materials and modern techniques.',      '2026-04-22', '10:00 AM', 'Civil Dept Hall',    'upcoming', 36);
