-- Debug script để kiểm tra dữ liệu parent và student relationships
-- Chạy script này để hiểu tại sao gửi thông báo đến 0 phụ huynh

-- 1. Kiểm tra tổng số học sinh và parent
SELECT 
    'TỔNG QUAN' as section,
    (SELECT COUNT(*) FROM Student) as total_students,
    (SELECT COUNT(*) FROM users WHERE roleID = (SELECT roleID FROM Role WHERE roleName = 'PARENT')) as total_parents,
    (SELECT COUNT(*) FROM users WHERE roleID = (SELECT roleID FROM Role WHERE roleName = 'PARENT') AND enabled = true) as enabled_parents;

-- 2. Kiểm tra role data
SELECT 
    'ROLE DATA' as section,
    r.roleID,
    r.roleName,
    COUNT(u.userID) as user_count
FROM Role r 
LEFT JOIN users u ON r.roleID = u.roleID 
GROUP BY r.roleID, r.roleName
ORDER BY r.roleName;

-- 3. Kiểm tra học sinh không có parent
SELECT 
    'HỌC SINH KHÔNG CÓ PARENT' as section,
    COUNT(*) as students_without_parents
FROM Student s 
WHERE s.motherId IS NULL AND s.fatherId IS NULL;

-- 4. Kiểm tra học sinh có parent nhưng parent bị disabled
SELECT 
    'HỌC SINH CÓ PARENT BỊ DISABLED' as section,
    COUNT(DISTINCT s.studentID) as count
FROM Student s 
LEFT JOIN users mother ON s.motherId = mother.userID
LEFT JOIN users father ON s.fatherId = father.userID
WHERE (mother.userID IS NOT NULL AND mother.enabled = false)
   OR (father.userID IS NOT NULL AND father.enabled = false);

-- 5. Chi tiết học sinh và parent của họ
SELECT 
    'CHI TIẾT HỌC SINH VÀ PARENT' as section,
    s.studentID,
    CONCAT(s.lastName, ' ', s.firstName) as student_name,
    s.className,
    CASE 
        WHEN s.motherId IS NOT NULL THEN CONCAT('Mother: ', mother.phone, ' (enabled: ', mother.enabled, ', role: ', mother_role.roleName, ')')
        ELSE 'No Mother'
    END as mother_info,
    CASE 
        WHEN s.fatherId IS NOT NULL THEN CONCAT('Father: ', father.phone, ' (enabled: ', father.enabled, ', role: ', father_role.roleName, ')')
        ELSE 'No Father'
    END as father_info
FROM Student s
LEFT JOIN users mother ON s.motherId = mother.userID
LEFT JOIN users father ON s.fatherId = father.userID
LEFT JOIN Role mother_role ON mother.roleID = mother_role.roleID
LEFT JOIN Role father_role ON father.roleID = father_role.roleID
LIMIT 20;

-- 6. Kiểm tra parent có role không đúng
SELECT 
    'PARENT CÓ ROLE KHÔNG ĐÚNG' as section,
    u.userID,
    u.phone,
    u.enabled,
    r.roleName,
    COUNT(CASE WHEN s.motherId = u.userID THEN 1 END) as children_as_mother,
    COUNT(CASE WHEN s.fatherId = u.userID THEN 1 END) as children_as_father
FROM users u
JOIN Role r ON u.roleID = r.roleID
LEFT JOIN Student s ON (s.motherId = u.userID OR s.fatherId = u.userID)
WHERE r.roleName != 'PARENT' 
  AND (s.motherId IS NOT NULL OR s.fatherId IS NOT NULL)
GROUP BY u.userID, u.phone, u.enabled, r.roleName;

-- 7. Thống kê theo lớp
SELECT 
    'THỐNG KÊ THEO LỚP' as section,
    s.className,
    COUNT(*) as total_students,
    COUNT(CASE WHEN s.motherId IS NOT NULL OR s.fatherId IS NOT NULL THEN 1 END) as students_with_parents,
    COUNT(CASE WHEN (mother.enabled = true AND mother_role.roleName = 'PARENT') 
                  OR (father.enabled = true AND father_role.roleName = 'PARENT') THEN 1 END) as students_with_valid_parents
FROM Student s
LEFT JOIN users mother ON s.motherId = mother.userID
LEFT JOIN users father ON s.fatherId = father.userID
LEFT JOIN Role mother_role ON mother.roleID = mother_role.roleID
LEFT JOIN Role father_role ON father.roleID = father_role.roleID
GROUP BY s.className
ORDER BY s.className;

-- 8. Tìm học sinh đủ điều kiện mẫu (giả sử chiến dịch cho học sinh 6-12 tuổi)
SELECT 
    'HỌC SINH ĐỦ ĐIỀU KIỆN MẪU' as section,
    s.studentID,
    CONCAT(s.lastName, ' ', s.firstName) as student_name,
    s.className,
    TIMESTAMPDIFF(YEAR, s.dob, CURDATE()) as age,
    CASE 
        WHEN s.motherId IS NOT NULL AND mother.enabled = true AND mother_role.roleName = 'PARENT' THEN 'Valid Mother'
        WHEN s.motherId IS NOT NULL THEN CONCAT('Invalid Mother: enabled=', mother.enabled, ', role=', IFNULL(mother_role.roleName, 'NULL'))
        ELSE 'No Mother'
    END as mother_status,
    CASE 
        WHEN s.fatherId IS NOT NULL AND father.enabled = true AND father_role.roleName = 'PARENT' THEN 'Valid Father'
        WHEN s.fatherId IS NOT NULL THEN CONCAT('Invalid Father: enabled=', father.enabled, ', role=', IFNULL(father_role.roleName, 'NULL'))
        ELSE 'No Father'
    END as father_status
FROM Student s
LEFT JOIN users mother ON s.motherId = mother.userID
LEFT JOIN users father ON s.fatherId = father.userID
LEFT JOIN Role mother_role ON mother.roleID = mother_role.roleID
LEFT JOIN Role father_role ON father.roleID = father_role.roleID
WHERE TIMESTAMPDIFF(YEAR, s.dob, CURDATE()) BETWEEN 6 AND 12
LIMIT 10; 