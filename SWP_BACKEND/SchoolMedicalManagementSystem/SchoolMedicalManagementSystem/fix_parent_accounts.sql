-- Script khắc phục vấn đề parent accounts
-- Chạy từng bước một và kiểm tra kết quả

-- BƯỚC 1: Kích hoạt tất cả parent accounts bị disabled
UPDATE users 
SET enabled = 1 
WHERE roleID = (SELECT roleID FROM Role WHERE roleName = 'PARENT') 
  AND enabled = 0;

-- Kiểm tra kết quả BƯỚC 1
SELECT 'AFTER STEP 1 - ENABLED PARENTS' as step,
       COUNT(*) as total_enabled_parents
FROM users 
WHERE roleID = (SELECT roleID FROM Role WHERE roleName = 'PARENT') 
  AND enabled = 1;

-- BƯỚC 2: Kiểm tra và sửa role name nếu cần
-- Đảm bảo role name chính xác là 'PARENT'
UPDATE Role 
SET roleName = 'PARENT' 
WHERE roleName IN ('ROLE_PARENT', 'parent', 'Parent');

-- Kiểm tra kết quả BƯỚC 2
SELECT 'AFTER STEP 2 - ROLES' as step, 
       roleID, roleName, 
       COUNT(*) as user_count 
FROM Role r 
LEFT JOIN users u ON r.roleID = u.roleID 
GROUP BY r.roleID, r.roleName;

-- BƯỚC 3: Tạo parent accounts cho students chưa có
-- Trước tiên, xem có bao nhiêu student chưa có parent
SELECT 'STUDENTS WITHOUT PARENTS' as step,
       COUNT(*) as count
FROM Student 
WHERE (motherId IS NULL OR motherId NOT IN (SELECT userID FROM users WHERE enabled = 1))
  AND (fatherId IS NULL OR fatherId NOT IN (SELECT userID FROM users WHERE enabled = 1));

-- BƯỚC 4: Tạo parent accounts mẫu cho students chưa có parent
-- (Chỉ tạo mẫu cho 5 students đầu tiên để test)
INSERT INTO users (firstName, lastName, dob, gender, phone, address, jobTitle, enabled, roleID)
SELECT 
    CONCAT('Phụ huynh của ', s.firstName) as firstName,
    s.lastName,
    DATE_SUB(s.dob, INTERVAL 25 YEAR) as dob, -- Giả sử phụ huynh lớn hơn con 25 tuổi
    'M' as gender,
    CONCAT('0987', LPAD(s.studentID, 6, '0')) as phone, -- Tạo số điện thoại giả
    s.address,
    'Phụ huynh' as jobTitle,
    1 as enabled,
    (SELECT roleID FROM Role WHERE roleName = 'PARENT') as roleID
FROM Student s
WHERE s.motherId IS NULL 
  AND s.fatherId IS NULL
  AND s.studentID <= (SELECT MIN(studentID) + 4 FROM Student WHERE motherId IS NULL AND fatherId IS NULL)
LIMIT 5;

-- BƯỚC 5: Liên kết parent accounts vừa tạo với students
-- Cập nhật motherId cho students chưa có parent
UPDATE Student s
SET motherId = (
    SELECT u.userID 
    FROM users u 
    WHERE u.firstName = CONCAT('Phụ huynh của ', s.firstName)
      AND u.lastName = s.lastName
      AND u.roleID = (SELECT roleID FROM Role WHERE roleName = 'PARENT')
    LIMIT 1
)
WHERE s.motherId IS NULL 
  AND s.fatherId IS NULL
  AND EXISTS (
    SELECT 1 FROM users u 
    WHERE u.firstName = CONCAT('Phụ huynh của ', s.firstName)
      AND u.lastName = s.lastName
      AND u.roleID = (SELECT roleID FROM Role WHERE roleName = 'PARENT')
  );

-- BƯỚC 6: Kiểm tra kết quả cuối cùng  
SELECT 'FINAL RESULT' as step,
       (SELECT COUNT(*) FROM Student) as total_students,
       (SELECT COUNT(*) FROM Student WHERE motherId IS NOT NULL OR fatherId IS NOT NULL) as students_with_parents,
       (SELECT COUNT(*) FROM users WHERE roleID = (SELECT roleID FROM Role WHERE roleName = 'PARENT') AND enabled = 1) as enabled_parents;

-- BƯỚC 7: Hiển thị mẫu dữ liệu sau khi fix
SELECT 'SAMPLE FIXED DATA' as step,
       s.studentID,
       CONCAT(s.lastName, ' ', s.firstName) as student_name,
       s.className,
       CASE 
           WHEN s.motherId IS NOT NULL THEN CONCAT('Mother: ', m.phone, ' (', m.firstName, ' ', m.lastName, ')')
           ELSE 'No Mother'
       END as mother_info,
       CASE 
           WHEN s.fatherId IS NOT NULL THEN CONCAT('Father: ', f.phone, ' (', f.firstName, ' ', f.lastName, ')')
           ELSE 'No Father'
       END as father_info
FROM Student s
LEFT JOIN users m ON s.motherId = m.userID
LEFT JOIN users f ON s.fatherId = f.userID
LIMIT 10; 