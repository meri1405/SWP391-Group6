-- Fix Campaign Status Script
-- Update campaign status from CANCELED to APPROVED for testing

-- 1. Check current campaign status
SELECT 'CURRENT CAMPAIGN STATUS' as info;
SELECT id, name, status, targetClasses, minAge, maxAge 
FROM HealthCheckCampaign 
ORDER BY id;

-- 2. Update campaign ID 1 to APPROVED status
UPDATE HealthCheckCampaign 
SET status = 'APPROVED' 
WHERE id = 1;

-- 3. Verify the update
SELECT 'UPDATED CAMPAIGN STATUS' as info;
SELECT id, name, status, targetClasses, minAge, maxAge 
FROM HealthCheckCampaign 
WHERE id = 1;

-- 4. Optional: Update multiple campaigns if needed
-- UPDATE HealthCheckCampaign 
-- SET status = 'APPROVED' 
-- WHERE id IN (1, 2, 3, 4);

SELECT 'READY TO TEST' as info;
SELECT 'Now you can test send notifications API' as message; 