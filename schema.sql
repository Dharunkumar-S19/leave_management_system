-- Leave Management System Database Schema

CREATE DATABASE IF NOT EXISTS leave_management;
USE leave_management;

-- Departments Table
CREATE TABLE departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10) NOT NULL UNIQUE
);

-- Users Table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('student', 'staff', 'hod', 'principal') NOT NULL,
    department_id INT,
    class VARCHAR(50), -- Only for students
    roll_number VARCHAR(50), -- Only for students
    phone VARCHAR(15),
    parent_phone VARCHAR(15), -- Only for students
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

-- Leave Balances Table
CREATE TABLE leave_balances (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    academic_year VARCHAR(10) NOT NULL,
    role_type ENUM('student', 'staff', 'hod', 'principal') NOT NULL,
    cl_total INT DEFAULT 6,
    cl_used INT DEFAULT 0,
    ml_total INT DEFAULT 10,
    ml_used INT DEFAULT 0,
    od_used INT DEFAULT 0,
    UNIQUE KEY (user_id, academic_year),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Leave Requests Table
CREATE TABLE leave_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    applicant_id INT NOT NULL,
    applicant_role ENUM('student', 'staff', 'hod', 'principal') NOT NULL,
    leave_type ENUM('CL', 'ML', 'OD') NOT NULL,
    from_date DATE NOT NULL,
    to_date DATE NOT NULL,
    days_count INT NOT NULL,
    reason TEXT NOT NULL,
    attachment_url VARCHAR(255),
    
    level1_reviewer_id INT,
    level1_status ENUM('pending', 'forwarded', 'rejected') DEFAULT 'pending',
    level1_remarks TEXT,
    level1_acted_at TIMESTAMP NULL,
    
    level2_reviewer_id INT,
    level2_status ENUM('pending', 'approved', 'rejected', 'na') DEFAULT 'na',
    level2_remarks TEXT,
    level2_acted_at TIMESTAMP NULL,
    
    overall_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (applicant_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (level1_reviewer_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (level2_reviewer_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Notifications Table
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    leave_id INT,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (leave_id) REFERENCES leave_requests(id) ON DELETE CASCADE
);

-- Leave Audit Log Table
CREATE TABLE leave_audit_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    leave_id INT NOT NULL,
    actor_id INT NOT NULL,
    actor_role ENUM('student', 'staff', 'hod', 'principal') NOT NULL,
    action VARCHAR(50) NOT NULL,
    remarks TEXT,
    acted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (leave_id) REFERENCES leave_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE CASCADE
);

-- TRIGGER: BEFORE INSERT - Set initial status based on role
DELIMITER //
CREATE TRIGGER tr_leave_request_before_insert
BEFORE INSERT ON leave_requests
FOR EACH ROW
BEGIN
    IF NEW.applicant_role = 'student' THEN
        SET NEW.level2_status = 'pending';
    ELSEIF NEW.applicant_role = 'staff' THEN
        SET NEW.level2_status = 'pending';
    ELSEIF NEW.applicant_role = 'hod' THEN
        SET NEW.level2_status = 'na';
    ELSEIF NEW.applicant_role = 'principal' THEN
        SET NEW.overall_status = 'approved';
        SET NEW.level1_status = 'forwarded';
        SET NEW.level2_status = 'na';
    END IF;
END //
DELIMITER ;

-- TRIGGER: AFTER UPDATE - Recalculate overall status
DELIMITER //
CREATE TRIGGER tr_leave_request_after_update_status
AFTER UPDATE ON leave_requests
FOR EACH ROW
BEGIN
    DECLARE v_new_overall ENUM('pending', 'approved', 'rejected');
    SET v_new_overall = OLD.overall_status;

    -- If either level is rejected, overall is rejected
    IF NEW.level1_status = 'rejected' OR NEW.level2_status = 'rejected' THEN
        SET v_new_overall = 'rejected';
    -- Single level approval (hod)
    ELSEIF NEW.level2_status = 'na' AND NEW.level1_status = 'forwarded' THEN
        SET v_new_overall = 'approved';
    -- Two level approval (student/staff)
    ELSEIF NEW.level2_status = 'approved' THEN
        SET v_new_overall = 'approved';
    END IF;

    -- Update overall_status in a separate update (triggers need care here)
    -- Using a conditional to avoid infinite recursion or just using BEFORE UPDATE might be better
    -- but the user specified AFTER UPDATE logic. For MySQL, we should update the table itself
    -- Careful: MySQL doesn't allow updating the same table in an AFTER UPDATE trigger on that table.
    -- I'll use a BEFORE UPDATE trigger instead for status recalculation.
END //
DELIMITER ;

-- Redefining triggers to be more MySQL compliant (Updating NEW fields in BEFORE trigger)
DROP TRIGGER IF EXISTS tr_leave_request_after_update_status;

DELIMITER //
CREATE TRIGGER tr_leave_request_before_update_status
BEFORE UPDATE ON leave_requests
FOR EACH ROW
BEGIN
    -- Only recalculate if statuses changed
    IF NEW.level1_status <> OLD.level1_status OR NEW.level2_status <> OLD.level2_status THEN
        IF NEW.level1_status = 'rejected' OR NEW.level2_status = 'rejected' THEN
            SET NEW.overall_status = 'rejected';
        ELSEIF NEW.level2_status = 'na' AND NEW.level1_status = 'forwarded' THEN
            SET NEW.overall_status = 'approved';
        ELSEIF NEW.level2_status = 'approved' THEN
            SET NEW.overall_status = 'approved';
        END IF;
    END IF;
END //
DELIMITER ;

-- TRIGGER: AFTER UPDATE on overall_status -> Deduct leave_balances
DELIMITER //
CREATE TRIGGER tr_leave_request_after_update_balance
AFTER UPDATE ON leave_requests
FOR EACH ROW
BEGIN
    -- Deduct only when status moves to approved
    IF NEW.overall_status = 'approved' AND OLD.overall_status = 'pending' THEN
        IF NEW.leave_type = 'CL' THEN
            UPDATE leave_balances SET cl_used = cl_used + NEW.days_count WHERE user_id = NEW.applicant_id;
        ELSEIF NEW.leave_type = 'ML' THEN
            UPDATE leave_balances SET ml_used = ml_used + NEW.days_count WHERE user_id = NEW.applicant_id;
        ELSEIF NEW.leave_type = 'OD' THEN
            UPDATE leave_balances SET od_used = od_used + NEW.days_count WHERE user_id = NEW.applicant_id;
        END IF;
    END IF;
END //
DELIMITER ;

-- TRIGGER: AFTER INSERT -> Deduct leave_balances (for Principal auto-approved leaves)
DELIMITER //
CREATE TRIGGER tr_leave_request_after_insert_balance
AFTER INSERT ON leave_requests
FOR EACH ROW
BEGIN
    IF NEW.overall_status = 'approved' THEN
        IF NEW.leave_type = 'CL' THEN
            UPDATE leave_balances SET cl_used = cl_used + NEW.days_count WHERE user_id = NEW.applicant_id;
        ELSEIF NEW.leave_type = 'ML' THEN
            UPDATE leave_balances SET ml_used = ml_used + NEW.days_count WHERE user_id = NEW.applicant_id;
        ELSEIF NEW.leave_type = 'OD' THEN
            UPDATE leave_balances SET od_used = od_used + NEW.days_count WHERE user_id = NEW.applicant_id;
        END IF;
    END IF;
END //
DELIMITER ;
