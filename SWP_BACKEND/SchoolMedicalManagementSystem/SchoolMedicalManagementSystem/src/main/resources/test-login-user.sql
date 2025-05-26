-- Insert roles if they don't exist
INSERT INTO role (roleid, role_name)
VALUES (1, 'ADMIN'),
       (2, 'MANAGER'),
       (3, 'SCHOOLNURSE'),
       (4, 'PARENT')
ON DUPLICATE KEY UPDATE role_name = VALUES(role_name);

-- Insert a test user with simple credentials for login testing
INSERT INTO users (
    username,
    password,
    first_name,
    last_name,
    dob,
    gender,
    phone,
    email,
    address,
    job_title,
    created_date,
    last_modified_date,
    enabled,
    roleid
)
VALUES (
    'testuser',
    'password123',
    'Test',
    'User',
    '1990-01-01',
    'M',
    '0123456789',
    'test@example.com',
    '123 Test St',
    'Tester',
    NOW(),
    NOW(),
    true,
    1
);

-- Print test user credentials
SELECT 'Created test user with the following credentials:' as Message;
SELECT 'Username: testuser' as Username;
SELECT 'Password: password123' as Password;
