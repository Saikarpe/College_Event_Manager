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
    team_name       VARCHAR(100) NULL DEFAULT NULL,
    team_size       INT          NOT NULL DEFAULT 1,
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

-- IT Department
('it', 'ITERA', 'Technical', 'Focuses on programming skills, coding practices, and software development.'),
('it', 'AI/ML Club', 'Technical', 'Works on artificial intelligence, machine learning models, and data-driven solutions.'),
('it', 'AWS Club', 'Technical', 'Promotes cloud computing knowledge, AWS services, and deployment practices.'),
('it', 'Cyber Security Club', 'Technical', 'Focuses on ethical hacking, network security, and cyber threat analysis.'),
('it', 'CSI', 'Technical', 'Engages students in computer science advancements, technical knowledge sharing, and innovation.'),
('it', 'GeeksforGeeks Club', 'Technical', 'Enhances problem-solving skills and strengthens data structures and algorithms knowledge.'),

-- Mechanical Department
('me', 'MESA', 'Technical', 'Develops mechanical engineering knowledge through design, manufacturing, and analysis activities.'),
('me', 'SAE India', 'Technical', 'Focuses on automotive engineering, vehicle design, and mobility solutions.'),
('me', 'ISHARE', 'Technical', 'Promotes research and development in mechanical systems and innovative engineering ideas.'),
('me', 'MBAJA Club', 'Technical', 'Works on designing and building all-terrain vehicles and practical automotive applications.'),
('me', '3D Printing Club', 'Technical', 'Explores additive manufacturing, prototyping, and product design using 3D printing.'),

-- Structural / Civil (STR)
('st', 'ASES', 'Technical', 'Focuses on structural engineering concepts, design analysis, and construction techniques.'),

-- Mechatronics / Robotics (MTX)
('mx', 'EMCC', 'Technical', 'Encourages robotics development, embedded systems, and automation projects.'),
('mx', 'TechTitans Robotics', 'Technical', 'Focuses on robotics design, programming, and intelligent system development.'),
('mx', 'Nexas Aerotech', 'Technical', 'Specializes in drone technology, aerodynamics, and UAV development.');

-- Insert sample events
INSERT INTO events (dept_id, club_id, title, description, event_date, event_time, venue, status, rsvp_count) VALUES

-- IT Department Events
('it', 1, 'CodeWar', 'Competitive coding competition focusing on problem-solving and algorithmic skills.', '2026-04-20', '9:00 AM', 'IT Lab 1', 'upcoming', 120),
('it', 2, 'AI/ML Workshop', 'Hands-on session on machine learning models and AI tools.', '2026-04-14', '11:00 AM', 'Seminar Hall IT', 'ongoing', 85),
('it', 3, 'AWS Student Community Day', 'Cloud computing session covering AWS services and real-world deployment.', '2026-04-10', '10:00 AM', 'Auditorium', 'completed', 150),
('it', 4, 'Cyber Security Awareness', 'Workshop on ethical hacking, cyber threats, and data protection.', '2026-04-22', '2:00 PM', 'IT Lab 2', 'upcoming', 90),
('it', 5, 'Coder Kesary 2K26', 'Coding competition to test programming logic and speed.', '2026-04-12', '9:30 AM', 'Computer Center', 'completed', 110),
('it', 6, 'ByteBattle Coding Challenge', 'Competitive programming contest with real-world coding challenges.', '2026-04-14', '10:00 AM', 'IT Lab 3', 'ongoing', 95),

-- Mechanical Department Events
('me', 7, 'Jalawa Premier League', 'Fun and competitive team-based activities.', '2026-04-18', '4:00 PM', 'Mechanical Ground', 'upcoming', 140),
('me', 8, 'Automotive Design Workshop', 'Session on vehicle design and engineering concepts.', '2026-04-13', '10:00 AM', 'Mech Lab', 'completed', 60),
('me', 9, 'Innovation Meetup', 'Platform for students to present innovative ideas.', '2026-04-14', '1:00 PM', 'Seminar Hall Mech', 'ongoing', 50),
('me', 10, 'BAJA Vehicle Session', 'Discussion on all-terrain vehicle design.', '2026-04-21', '11:00 AM', 'Workshop Area', 'upcoming', 70),
('me', 11, '3D Printing Demo', 'Demonstration of additive manufacturing.', '2026-04-11', '2:00 PM', 'Design Lab', 'completed', 65),

-- Structural Department Events
('st', 12, 'Art Mela', 'Sketching and painting competition.', '2026-04-14', '3:00 PM', 'Civil Hall', 'ongoing', 80),
('st', 12, 'SPACE 2K25', 'National level technical competition on structural design.', '2026-04-25', '9:00 AM', 'Civil Department', 'upcoming', 130),

-- Mechatronics / Robotics Events
('mx', 13, 'RoboRace', 'Robotics competition with racing bots.', '2026-04-13', '10:00 AM', 'Robotics Lab', 'completed', 75),
('mx', 14, 'Line Follower Robot', 'Autonomous robot competition.', '2026-04-14', '12:00 PM', 'Electronics Lab', 'ongoing', 68),
('mx', 15, 'Drone Tech Workshop', 'Workshop on drone building and aerodynamics.', '2026-04-23', '11:00 AM', 'Open Ground', 'upcoming', 90);