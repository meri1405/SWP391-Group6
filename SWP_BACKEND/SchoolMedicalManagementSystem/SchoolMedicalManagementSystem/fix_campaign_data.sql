-- Fix campaign data nếu thiếu thông tin targetClasses, minAge, maxAge

-- Kiểm tra campaign hiện tại (thay campaign_id = 1 bằng ID thực tế)
SELECT 
    id,
    name,
    minAge,
    maxAge,
    targetClasses,
    status
FROM HealthCheckCampaign 
WHERE id = 1;

-- Update campaign với dữ liệu đúng (dựa vào test thành công)
UPDATE HealthCheckCampaign 
SET 
    targetClasses = '["2B"]',  -- JSON format cho Set<String>
    minAge = 6,
    maxAge = 12
WHERE id = 1;

-- Kiểm tra lại sau khi update
SELECT 
    'AFTER UPDATE' as status,
    id,
    name,
    minAge,
    maxAge,
    targetClasses,
    status
FROM HealthCheckCampaign 
WHERE id = 1; 