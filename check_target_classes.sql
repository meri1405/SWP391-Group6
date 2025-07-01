-- ============================================
-- CHECK TARGET CLASSES DATA
-- ============================================

-- 1. Check main campaign data
SELECT 
    id,
    name,
    status,
    minAge,
    maxAge,
    startDate,
    endDate
FROM HealthCheckCampaign 
WHERE id = 1;

-- 2. Check target classes collection table
SELECT 
    campaign_id,
    class_name
FROM campaign_target_classes 
WHERE campaign_id = 1;

-- 3. Check if the table exists and its structure
SHOW TABLES LIKE '%campaign%';

-- 4. Describe campaign_target_classes table structure
DESCRIBE campaign_target_classes;

-- 5. Check all data in target classes table
SELECT * FROM campaign_target_classes;

-- 6. Verify students in class 2B exist
SELECT 
    studentID,
    firstName,
    lastName,
    className,
    dob,
    TIMESTAMPDIFF(YEAR, dob, CURDATE()) as age
FROM Student 
WHERE className = '2B' 
AND TIMESTAMPDIFF(YEAR, dob, CURDATE()) BETWEEN 6 AND 12
LIMIT 10; 