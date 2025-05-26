-- Roles
INSERT INTO Role (roleName) VALUES ('ADMIN');
INSERT INTO Role (roleName) VALUES ('PARENT');
INSERT INTO Role (roleName) VALUES ('NURSE');
INSERT INTO Role (roleName) VALUES ('MANAGER');

-- Parents (Users with parent role)
INSERT INTO users (username, password, firstName, lastName, dob, gender, phone, email, address, jobTitle, createdDate, lastModifiedDate, enabled, roleID)
VALUES ('parent1', '$2a$10$HGHmL5XVbDzo9pDfHO/WS.WgpVEhOyXb9TUZ7PwJEM1bIJy1Hz7K.', 'John', 'Smith', '1980-05-15', 'M', '0901234567', 'john.smith@example.com', '123 Main St, District 1, HCMC', 'Engineer', NOW(), NOW(), true, 2);

INSERT INTO users (username, password, firstName, lastName, dob, gender, phone, email, address, jobTitle, createdDate, lastModifiedDate, enabled, roleID)
VALUES ('parent2', '$2a$10$HGHmL5XVbDzo9pDfHO/WS.WgpVEhOyXb9TUZ7PwJEM1bIJy1Hz7K.', 'Mary', 'Johnson', '1982-07-22', 'F', '0912345678', 'mary.johnson@example.com', '456 Oak St, District 2, HCMC', 'Accountant', NOW(), NOW(), true, 2);

INSERT INTO users (username, password, firstName, lastName, dob, gender, phone, email, address, jobTitle, createdDate, lastModifiedDate, enabled, roleID)
VALUES ('parent3', '$2a$10$HGHmL5XVbDzo9pDfHO/WS.WgpVEhOyXb9TUZ7PwJEM1bIJy1Hz7K.', 'David', 'Nguyen', '1979-03-10', 'M', '0923456789', 'david.nguyen@example.com', '789 Pine St, District 3, HCMC', 'Business Owner', NOW(), NOW(), true, 2);

INSERT INTO users (username, password, firstName, lastName, dob, gender, phone, email, address, jobTitle, createdDate, lastModifiedDate, enabled, roleID)
VALUES ('parent4', '$2a$10$HGHmL5XVbDzo9pDfHO/WS.WgpVEhOyXb9TUZ7PwJEM1bIJy1Hz7K.', 'Linda', 'Tran', '1985-11-30', 'F', '0934567890', 'linda.tran@example.com', '321 Maple St, District 1, HCMC', 'Teacher', NOW(), NOW(), true, 2);

INSERT INTO users (username, password, firstName, lastName, dob, gender, phone, email, address, jobTitle, createdDate, lastModifiedDate, enabled, roleID)
VALUES ('parent5', '$2a$10$HGHmL5XVbDzo9pDfHO/WS.WgpVEhOyXb9TUZ7PwJEM1bIJy1Hz7K.', 'Michael', 'Pham', '1978-09-25', 'M', '0945678901', 'michael.pham@example.com', '654 Cedar St, District 2, HCMC', 'IT Specialist', NOW(), NOW(), true, 2);

-- Nurses (Users with nurse role)
INSERT INTO users (username, password, firstName, lastName, dob, gender, phone, email, address, jobTitle, createdDate, lastModifiedDate, enabled, roleID)
VALUES ('nurse1', '$2a$10$HGHmL5XVbDzo9pDfHO/WS.WgpVEhOyXb9TUZ7PwJEM1bIJy1Hz7K.', 'Sarah', 'Williams', '1990-02-18', 'F', '0956789012', 'sarah.williams@school.edu.vn', '111 School Rd, District 1, HCMC', 'School Nurse', NOW(), NOW(), true, 3);

INSERT INTO users (username, password, firstName, lastName, dob, gender, phone, email, address, jobTitle, createdDate, lastModifiedDate, enabled, roleID)
VALUES ('nurse2', '$2a$10$HGHmL5XVbDzo9pDfHO/WS.WgpVEhOyXb9TUZ7PwJEM1bIJy1Hz7K.', 'James', 'Lee', '1988-06-12', 'M', '0967890123', 'james.lee@school.edu.vn', '222 School Rd, District 2, HCMC', 'School Nurse', NOW(), NOW(), true, 3);

INSERT INTO users (username, password, firstName, lastName, dob, gender, phone, email, address, jobTitle, createdDate, lastModifiedDate, enabled, roleID)
VALUES ('nurse3', '$2a$10$HGHmL5XVbDzo9pDfHO/WS.WgpVEhOyXb9TUZ7PwJEM1bIJy1Hz7K.', 'Emily', 'Hoang', '1992-04-05', 'F', '0978901234', 'emily.hoang@school.edu.vn', '333 School Rd, District 3, HCMC', 'School Nurse', NOW(), NOW(), true, 3);

-- Students
INSERT INTO Student (firstName, lastName, dob, gender, className, birthPlace, address, citizenship, bloodType, isDisabled)
VALUES ('Alex', 'Smith', '2010-03-20', 'M', '7A', 'HCMC', '123 Main St, District 1, HCMC', 'Vietnamese', 'A+', false);

INSERT INTO Student (firstName, lastName, dob, gender, className, birthPlace, address, citizenship, bloodType, isDisabled)
VALUES ('Emma', 'Johnson', '2011-05-12', 'F', '6B', 'HCMC', '456 Oak St, District 2, HCMC', 'Vietnamese', 'O+', false);

INSERT INTO Student (firstName, lastName, dob, gender, className, birthPlace, address, citizenship, bloodType, isDisabled)
VALUES ('Daniel', 'Nguyen', '2010-08-30', 'M', '7A', 'Hanoi', '789 Pine St, District 3, HCMC', 'Vietnamese', 'B+', false);

INSERT INTO Student (firstName, lastName, dob, gender, className, birthPlace, address, citizenship, bloodType, isDisabled)
VALUES ('Sophia', 'Tran', '2012-01-15', 'F', '5C', 'HCMC', '321 Maple St, District 1, HCMC', 'Vietnamese', 'AB+', false);

INSERT INTO Student (firstName, lastName, dob, gender, className, birthPlace, address, citizenship, bloodType, isDisabled)
VALUES ('Ryan', 'Pham', '2011-11-05', 'M', '6B', 'Da Nang', '654 Cedar St, District 2, HCMC', 'Vietnamese', 'A-', false);

INSERT INTO Student (firstName, lastName, dob, gender, className, birthPlace, address, citizenship, bloodType, isDisabled)
VALUES ('Olivia', 'Smith', '2009-07-19', 'F', '8A', 'HCMC', '123 Main St, District 1, HCMC', 'Vietnamese', 'O-', false);

INSERT INTO Student (firstName, lastName, dob, gender, className, birthPlace, address, citizenship, bloodType, isDisabled)
VALUES ('William', 'Johnson', '2012-09-22', 'M', '5C', 'HCMC', '456 Oak St, District 2, HCMC', 'Vietnamese', 'B-', false);

INSERT INTO Student (firstName, lastName, dob, gender, className, birthPlace, address, citizenship, bloodType, isDisabled)
VALUES ('Ava', 'Nguyen', '2010-04-10', 'F', '7A', 'Can Tho', '789 Pine St, District 3, HCMC', 'Vietnamese', 'AB-', true);

-- Student-Parent relationships
-- Linking students to their parents (many-to-many relationship)
INSERT INTO student_parent (student_id, parent_id) VALUES (1, 1); -- Alex Smith is John Smith's child
INSERT INTO student_parent (student_id, parent_id) VALUES (6, 1); -- Olivia Smith is John Smith's child

INSERT INTO student_parent (student_id, parent_id) VALUES (2, 2); -- Emma Johnson is Mary Johnson's child
INSERT INTO student_parent (student_id, parent_id) VALUES (7, 2); -- William Johnson is Mary Johnson's child

INSERT INTO student_parent (student_id, parent_id) VALUES (3, 3); -- Daniel Nguyen is David Nguyen's child
INSERT INTO student_parent (student_id, parent_id) VALUES (8, 3); -- Ava Nguyen is David Nguyen's child

INSERT INTO student_parent (student_id, parent_id) VALUES (4, 4); -- Sophia Tran is Linda Tran's child

INSERT INTO student_parent (student_id, parent_id) VALUES (5, 5); -- Ryan Pham is Michael Pham's child

-- Creating some sample medication requests
INSERT INTO MedicationRequest (requestDate, note, status, nurseID, studentID, parentID)
VALUES ('2025-05-20', 'Allergy medication needed during school hours', 'APPROVED', 6, 1, 1);

INSERT INTO MedicationRequest (requestDate, note, status, nurseID, studentID, parentID)
VALUES ('2025-05-21', 'Asthma inhaler to be kept with nurse', 'PENDING', 7, 3, 3);

INSERT INTO MedicationRequest (requestDate, note, status, nurseID, studentID, parentID)
VALUES ('2025-05-22', 'Headache medicine as needed', 'APPROVED', 6, 4, 4);

INSERT INTO MedicationRequest (requestDate, note, status, nurseID, studentID, parentID)
VALUES ('2025-05-23', 'Vitamins to be taken after lunch', 'REJECTED', 8, 2, 2);

-- Creating sample item requests for the medication requests
INSERT INTO ItemRequest (itemName, purpose, itemType, dosage, frequency, startDate, endDate, note, requestID)
VALUES ('Cetirizine', 'Allergy relief', 'PRESCRIPTION', 1, 1, '2025-05-20', '2025-06-20', 'Take after lunch', 1);

INSERT INTO ItemRequest (itemName, purpose, itemType, dosage, frequency, startDate, endDate, note, requestID)
VALUES ('Albuterol Inhaler', 'Asthma control', 'PRESCRIPTION', 2, 3, '2025-05-21', '2025-08-21', 'Use as needed when experiencing asthma symptoms', 2);

INSERT INTO ItemRequest (itemName, purpose, itemType, dosage, frequency, startDate, endDate, note, requestID)
VALUES ('Paracetamol', 'Pain relief', 'OTC', 1, 2, '2025-05-22', '2025-05-29', 'For headaches only', 3);

INSERT INTO ItemRequest (itemName, purpose, itemType, dosage, frequency, startDate, endDate, note, requestID)
VALUES ('Multivitamin', 'Nutrition supplement', 'SUPPLEMENT', 1, 1, '2025-05-23', '2025-07-23', 'Take after lunch with food', 4);

INSERT INTO ItemRequest (itemName, purpose, itemType, dosage, frequency, startDate, endDate, note, requestID)
VALUES ('Nasal Spray', 'Allergy symptom relief', 'PRESCRIPTION', 2, 2, '2025-05-20', '2025-06-20', 'Use when needed for nasal congestion', 1);
