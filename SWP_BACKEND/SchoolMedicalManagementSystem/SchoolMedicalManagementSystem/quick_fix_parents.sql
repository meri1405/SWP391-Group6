-- QUICK FIX: Khắc phục ngay lập tức để test thông báo

-- 1. Kích hoạt tất cả parent accounts bị disabled
UPDATE users SET enabled = 1 WHERE roleID = 4;

-- 2. Tạo parent accounts đơn giản cho 10 students đầu tiên chưa có parent
INSERT INTO users (firstName, lastName, dob, gender, phone, address, jobTitle, enabled, roleID)
SELECT 
    CONCAT('PH_', s.firstName) as firstName,
    s.lastName,
    '1990-01-01' as dob,
    'M' as gender,
    CONCAT('098765', LPAD(s.studentid, 4, '0')) as phone,
    s.address,
    'Phụ huynh' as jobTitle,
    1 as enabled,
    4 as roleID
FROM Student s
WHERE (s.father_id IS NULL OR s.father_id = 0) 
  AND (s.mother_id IS NULL OR s.mother_id = 0)
LIMIT 10;

-- 3. Liên kết parent accounts với students
UPDATE Student s
SET mother_id = (
    SELECT u.userID 
    FROM users u 
    WHERE u.firstName = CONCAT('PH_', s.firstName)
      AND u.lastName = s.lastName
      AND u.roleID = 4
    LIMIT 1
)
WHERE (s.father_id IS NULL OR s.father_id = 0) 
  AND (s.mother_id IS NULL OR s.mother_id = 0)
  AND EXISTS (
    SELECT 1 FROM users u 
    WHERE u.firstName = CONCAT('PH_', s.firstName)
      AND u.lastName = s.lastName
      AND u.roleID = 4
  );

-- 4. Kiểm tra kết quả
SELECT 
    'QUICK FIX RESULT' as status,
    COUNT(*) as total_students,
    COUNT(CASE WHEN mother_id IS NOT NULL OR father_id IS NOT NULL THEN 1 END) as students_with_parents
FROM Student; 