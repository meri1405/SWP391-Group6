-- Kiểm tra nhanh tình trạng hiện tại của dữ liệu

-- 1. Kiểm tra tổng quan parent accounts
SELECT 
    'PARENT ACCOUNTS STATUS' as check_type,
    COUNT(*) as total_parents,
    COUNT(CASE WHEN enabled = 1 THEN 1 END) as enabled_parents,
    COUNT(CASE WHEN enabled = 0 THEN 1 END) as disabled_parents
FROM users 
WHERE roleID = (SELECT roleID FROM Role WHERE roleName = 'PARENT');

-- 2. Kiểm tra students có parent
SELECT 
    'STUDENTS WITH PARENTS' as check_type,
    COUNT(*) as total_students,
    COUNT(CASE WHEN mother_id IS NOT NULL THEN 1 END) as students_with_mother,
    COUNT(CASE WHEN father_id IS NOT NULL THEN 1 END) as students_with_father,
    COUNT(CASE WHEN mother_id IS NOT NULL OR father_id IS NOT NULL THEN 1 END) as students_with_any_parent
FROM Student;

-- 3. Kiểm tra students có parent HỢP LỆ (enabled = 1)
SELECT 
    'STUDENTS WITH VALID PARENTS' as check_type,
    COUNT(DISTINCT s.studentid) as students_with_valid_parents
FROM Student s
LEFT JOIN users m ON s.mother_id = m.userID AND m.enabled = 1 AND m.roleID = (SELECT roleID FROM Role WHERE roleName = 'PARENT')
LEFT JOIN users f ON s.father_id = f.userID AND f.enabled = 1 AND f.roleID = (SELECT roleID FROM Role WHERE roleName = 'PARENT')
WHERE m.userID IS NOT NULL OR f.userID IS NOT NULL;

-- 4. Mẫu 10 students và tình trạng parent của họ
SELECT 
    'SAMPLE STUDENT STATUS' as check_type,
    s.studentid,
    CONCAT(s.lastname, ' ', s.firstname) as student_name,
    s.class_name,
    CASE 
        WHEN s.mother_id IS NOT NULL THEN 
            CONCAT('Mother ID:', s.mother_id, 
                   ' (enabled:', IFNULL(m.enabled, 'NULL'), 
                   ', role:', IFNULL(mr.roleName, 'NULL'), ')')
        ELSE 'No Mother'
    END as mother_status,
    CASE 
        WHEN s.father_id IS NOT NULL THEN 
            CONCAT('Father ID:', s.father_id,
                   ' (enabled:', IFNULL(f.enabled, 'NULL'),
                   ', role:', IFNULL(fr.roleName, 'NULL'), ')')
        ELSE 'No Father'
    END as father_status
FROM Student s
LEFT JOIN users m ON s.mother_id = m.userID
LEFT JOIN users f ON s.father_id = f.userID  
LEFT JOIN Role mr ON m.roleID = mr.roleID
LEFT JOIN Role fr ON f.roleID = fr.roleID
LIMIT 10;

-- 5. Kiểm tra HealthCheckForm đã tạo cho campaign này chưa
SELECT 
    'HEALTH CHECK FORMS' as check_type,
    COUNT(*) as total_forms_in_system
FROM HealthCheckForm;

-- 6. Đếm students trong lớp 2B (dựa vào hình ảnh)
SELECT 
    'CLASS 2B ANALYSIS' as check_type,
    COUNT(*) as total_students_in_2B,
    COUNT(CASE WHEN mother_id IS NOT NULL OR father_id IS NOT NULL THEN 1 END) as students_with_parents_in_2B,
    COUNT(CASE WHEN 
        (mother_id IS NOT NULL AND EXISTS(SELECT 1 FROM users WHERE userID = mother_id AND enabled = 1)) OR
        (father_id IS NOT NULL AND EXISTS(SELECT 1 FROM users WHERE userID = father_id AND enabled = 1))
        THEN 1 END) as students_with_enabled_parents_in_2B
FROM Student 
WHERE class_name = '2B'; 