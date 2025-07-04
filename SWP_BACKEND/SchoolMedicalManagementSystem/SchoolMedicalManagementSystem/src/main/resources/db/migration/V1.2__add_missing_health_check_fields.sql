-- Add missing fields to Vision table
ALTER TABLE Vision ADD COLUMN IF NOT EXISTS colorVision VARCHAR(50);
ALTER TABLE Vision ADD COLUMN IF NOT EXISTS eyeMovement VARCHAR(50);
ALTER TABLE Vision ADD COLUMN IF NOT EXISTS eyePressure INTEGER;
ALTER TABLE Vision ADD COLUMN IF NOT EXISTS needsGlasses BOOLEAN DEFAULT FALSE;
ALTER TABLE Vision ADD COLUMN IF NOT EXISTS recommendations TEXT;

-- Add missing fields to Hearing table
ALTER TABLE Hearing ADD COLUMN IF NOT EXISTS hearingAcuity VARCHAR(50);
ALTER TABLE Hearing ADD COLUMN IF NOT EXISTS tympanometry VARCHAR(50);
ALTER TABLE Hearing ADD COLUMN IF NOT EXISTS earWaxPresent BOOLEAN DEFAULT FALSE;
ALTER TABLE Hearing ADD COLUMN IF NOT EXISTS earInfection BOOLEAN DEFAULT FALSE;
ALTER TABLE Hearing ADD COLUMN IF NOT EXISTS recommendations TEXT;

-- Add missing fields to Oral table  
ALTER TABLE Oral ADD COLUMN IF NOT EXISTS oralHygiene VARCHAR(50);
ALTER TABLE Oral ADD COLUMN IF NOT EXISTS cavitiesCount INTEGER DEFAULT 0;
ALTER TABLE Oral ADD COLUMN IF NOT EXISTS plaquePresent BOOLEAN DEFAULT FALSE;
ALTER TABLE Oral ADD COLUMN IF NOT EXISTS gingivitis BOOLEAN DEFAULT FALSE;
ALTER TABLE Oral ADD COLUMN IF NOT EXISTS mouthUlcers BOOLEAN DEFAULT FALSE;
ALTER TABLE Oral ADD COLUMN IF NOT EXISTS recommendations TEXT;

-- Add missing fields to Skin table
ALTER TABLE Skin ADD COLUMN IF NOT EXISTS acne BOOLEAN DEFAULT FALSE;
ALTER TABLE Skin ADD COLUMN IF NOT EXISTS scars BOOLEAN DEFAULT FALSE;
ALTER TABLE Skin ADD COLUMN IF NOT EXISTS birthmarks BOOLEAN DEFAULT FALSE;
ALTER TABLE Skin ADD COLUMN IF NOT EXISTS skinTone VARCHAR(50);
ALTER TABLE Skin ADD COLUMN IF NOT EXISTS recommendations TEXT;

-- Add missing fields to Respiratory table
ALTER TABLE Respiratory ADD COLUMN IF NOT EXISTS chestExpansion VARCHAR(50);
ALTER TABLE Respiratory ADD COLUMN IF NOT EXISTS lungSounds VARCHAR(50);
ALTER TABLE Respiratory ADD COLUMN IF NOT EXISTS asthmaHistory BOOLEAN DEFAULT FALSE;
ALTER TABLE Respiratory ADD COLUMN IF NOT EXISTS allergicRhinitis BOOLEAN DEFAULT FALSE;
ALTER TABLE Respiratory ADD COLUMN IF NOT EXISTS recommendations TEXT;

-- Update existing records with default values where necessary
UPDATE Vision SET 
    colorVision = 'NORMAL' WHERE colorVision IS NULL,
    eyeMovement = 'NORMAL' WHERE eyeMovement IS NULL,
    needsGlasses = FALSE WHERE needsGlasses IS NULL;

UPDATE Hearing SET 
    hearingAcuity = 'NORMAL' WHERE hearingAcuity IS NULL,
    tympanometry = 'NORMAL' WHERE tympanometry IS NULL,
    earWaxPresent = FALSE WHERE earWaxPresent IS NULL,
    earInfection = FALSE WHERE earInfection IS NULL;

UPDATE Oral SET 
    oralHygiene = 'GOOD' WHERE oralHygiene IS NULL,
    cavitiesCount = 0 WHERE cavitiesCount IS NULL,
    plaquePresent = FALSE WHERE plaquePresent IS NULL,
    gingivitis = FALSE WHERE gingivitis IS NULL,
    mouthUlcers = FALSE WHERE mouthUlcers IS NULL;

UPDATE Skin SET 
    acne = FALSE WHERE acne IS NULL,
    scars = FALSE WHERE scars IS NULL,
    birthmarks = FALSE WHERE birthmarks IS NULL,
    skinTone = 'NORMAL' WHERE skinTone IS NULL;

UPDATE Respiratory SET 
    chestExpansion = 'NORMAL' WHERE chestExpansion IS NULL,
    lungSounds = 'CLEAR' WHERE lungSounds IS NULL,
    asthmaHistory = FALSE WHERE asthmaHistory IS NULL,
    allergicRhinitis = FALSE WHERE allergicRhinitis IS NULL;
