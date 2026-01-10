-- Seed script to create 100+ flights from the past 12 months
-- Run this in Supabase SQL Editor

-- This script generates realistic ferry flight data with:
-- - Dates distributed across the past 12 months
-- - Realistic airport codes
-- - Various flight purposes
-- - Mostly completed flights (90%), some aborted (10%)
-- - References existing aircraft, organizations, and users when available

DO $$
DECLARE
  -- Airport codes
  airports TEXT[] := ARRAY[
    'KORD', 'KLAX', 'KDFW', 'KJFK', 'KMIA', 'KSEA', 'KPHX', 'KIAH', 'KATL', 'KCLT',
    'KDEN', 'KMCI', 'KBOS', 'KBDL', 'KLAS', 'KPDX', 'KSFO', 'KSAN', 'KDTW', 'KMSP',
    'KBWI', 'KDCA', 'KIAD', 'KEWR', 'KLGA', 'KBNA', 'KMSY', 'KSTL', 'KCLE', 'KIND',
    'KCMH', 'KPIT', 'KBUF', 'KRDU', 'KCHS', 'KSAV', 'KJAX', 'KMCO', 'KTPA', 'KFLL',
    'KRSW', 'KPBI', 'KTLH', 'KGNV', 'KAGS', 'KCAE', 'KGSP', 'KAVL', 'KTYS'
  ];
  
  -- Flight purposes
  purposes TEXT[] := ARRAY[
    'Delivery', 'Maintenance', 'Repositioning', 'Storage', 'Training',
    'Export', 'Inspection', 'Weighing', 'Sale', 'Relocation'
  ];
  
  -- Get existing data
  aircraft_ids UUID[];
  org_ids UUID[];
  user_ids UUID[];
  pilot_ids UUID[];
  mechanic_ids UUID[];
  
  -- Loop variables
  i INTEGER;
  num_flights INTEGER := 120; -- Generate 120 to ensure at least 100 succeed
  departure_date TIMESTAMPTZ;
  arrival_date TIMESTAMPTZ;
  origin_code TEXT;
  dest_code TEXT;
  flight_purpose TEXT;
  flight_status TEXT;
  flight_duration_hours NUMERIC;
  hour_of_day INTEGER;
  random_aircraft_id UUID;
  random_org_id UUID;
  random_pilot_id UUID;
  random_mechanic_id UUID;
  created_by_id UUID;
  tail_num TEXT;
  letters TEXT := 'ABCDEFGHJKLMNPRSTUVWXYZ';
  numbers TEXT := '0123456789';
  
BEGIN
  -- Get existing IDs from database
  SELECT ARRAY_AGG(id) INTO aircraft_ids FROM aircraft LIMIT 100;
  SELECT ARRAY_AGG(id) INTO org_ids FROM organizations LIMIT 100;
  SELECT ARRAY_AGG(id) INTO user_ids FROM profiles LIMIT 100;
  SELECT ARRAY_AGG(id) INTO pilot_ids FROM profiles WHERE role IN ('pilot', 'admin') LIMIT 100;
  SELECT ARRAY_AGG(id) INTO mechanic_ids FROM profiles WHERE role IN ('mechanic', 'admin') LIMIT 100;
  
  -- Ensure arrays are not null
  IF aircraft_ids IS NULL THEN aircraft_ids := ARRAY[]::UUID[]; END IF;
  IF org_ids IS NULL THEN org_ids := ARRAY[]::UUID[]; END IF;
  IF user_ids IS NULL THEN user_ids := ARRAY[]::UUID[]; END IF;
  IF pilot_ids IS NULL THEN pilot_ids := user_ids; END IF;
  IF mechanic_ids IS NULL THEN mechanic_ids := user_ids; END IF;
  
  -- Generate flights
  FOR i IN 1..num_flights LOOP
    -- Generate random departure date in past 12 months (biased toward recent)
    -- Using power function to bias toward more recent dates
    departure_date := NOW() - INTERVAL '12 months' + 
      (POWER(RANDOM(), 0.7) * INTERVAL '12 months');
    
    -- Set random hour of day (6 AM to 8 PM)
    hour_of_day := 6 + FLOOR(RANDOM() * 14);
    departure_date := DATE_TRUNC('day', departure_date) + 
      (hour_of_day || ' hours')::INTERVAL + 
      (FLOOR(RANDOM() * 60) || ' minutes')::INTERVAL;
    
    -- Generate flight duration (1.5 to 11 hours)
    flight_duration_hours := 1.5 + RANDOM() * 9.5;
    arrival_date := departure_date + (flight_duration_hours || ' hours')::INTERVAL;
    
    -- Get random origin and destination (ensure they're different)
    origin_code := airports[1 + FLOOR(RANDOM() * ARRAY_LENGTH(airports, 1))];
    dest_code := airports[1 + FLOOR(RANDOM() * ARRAY_LENGTH(airports, 1))];
    -- Retry if same airport (max 10 attempts)
    FOR j IN 1..10 LOOP
      IF origin_code != dest_code THEN EXIT; END IF;
      dest_code := airports[1 + FLOOR(RANDOM() * ARRAY_LENGTH(airports, 1))];
    END LOOP;
    
    -- Get random purpose
    flight_purpose := purposes[1 + FLOOR(RANDOM() * ARRAY_LENGTH(purposes, 1))];
    
    -- Determine status (90% completed, 10% aborted)
    IF RANDOM() < 0.9 THEN
      flight_status := 'completed';
    ELSE
      flight_status := 'aborted';
    END IF;
    
    -- Get random references (with probability to use null)
    random_aircraft_id := NULL;
    IF ARRAY_LENGTH(aircraft_ids, 1) > 0 AND RANDOM() > 0.3 THEN
      random_aircraft_id := aircraft_ids[1 + FLOOR(RANDOM() * ARRAY_LENGTH(aircraft_ids, 1))];
    END IF;
    
    random_org_id := NULL;
    IF ARRAY_LENGTH(org_ids, 1) > 0 AND RANDOM() > 0.2 THEN
      random_org_id := org_ids[1 + FLOOR(RANDOM() * ARRAY_LENGTH(org_ids, 1))];
    END IF;
    
    random_pilot_id := NULL;
    IF ARRAY_LENGTH(pilot_ids, 1) > 0 AND RANDOM() > 0.4 THEN
      random_pilot_id := pilot_ids[1 + FLOOR(RANDOM() * ARRAY_LENGTH(pilot_ids, 1))];
    END IF;
    
    random_mechanic_id := NULL;
    IF ARRAY_LENGTH(mechanic_ids, 1) > 0 AND RANDOM() > 0.5 THEN
      random_mechanic_id := mechanic_ids[1 + FLOOR(RANDOM() * ARRAY_LENGTH(mechanic_ids, 1))];
    END IF;
    
    -- Generate tail number if no aircraft_id
    tail_num := NULL;
    IF random_aircraft_id IS NULL OR RANDOM() > 0.3 THEN
      tail_num := 'N' || 
        SUBSTR(letters, 1 + FLOOR(RANDOM() * LENGTH(letters))::INTEGER, 1) ||
        SUBSTR(letters, 1 + FLOOR(RANDOM() * LENGTH(letters))::INTEGER, 1) ||
        SUBSTR(letters, 1 + FLOOR(RANDOM() * LENGTH(letters))::INTEGER, 1) ||
        SUBSTR(numbers, 1 + FLOOR(RANDOM() * LENGTH(numbers))::INTEGER, 1) ||
        SUBSTR(numbers, 1 + FLOOR(RANDOM() * LENGTH(numbers))::INTEGER, 1) ||
        SUBSTR(numbers, 1 + FLOOR(RANDOM() * LENGTH(numbers))::INTEGER, 1);
    END IF;
    
    -- Get a random user for created_by (prefer from user_ids array, fallback to query)
    IF ARRAY_LENGTH(user_ids, 1) > 0 THEN
      created_by_id := user_ids[1 + FLOOR(RANDOM() * ARRAY_LENGTH(user_ids, 1))];
    ELSE
      created_by_id := COALESCE(
        (SELECT id FROM profiles ORDER BY RANDOM() LIMIT 1),
        (SELECT id FROM auth.users ORDER BY RANDOM() LIMIT 1)
      );
    END IF;
    
    -- Insert the flight
    INSERT INTO ferry_flights (
      aircraft_id,
      tail_number,
      owner_id,
      pilot_user_id,
      mechanic_user_id,
      origin,
      destination,
      purpose,
      status,
      planned_departure,
      actual_departure,
      actual_arrival,
      created_by
    ) VALUES (
      random_aircraft_id,
      tail_num,
      random_org_id,
      random_pilot_id,
      random_mechanic_id,
      origin_code,
      dest_code,
      flight_purpose,
      flight_status,
      departure_date,
      CASE WHEN flight_status IN ('completed', 'aborted') THEN departure_date ELSE NULL END,
      CASE WHEN flight_status = 'completed' THEN arrival_date ELSE NULL END,
      created_by_id
    );
    
  END LOOP;
  
  -- Report results
  RAISE NOTICE 'Successfully created % flights', num_flights;
  RAISE NOTICE 'Total flights in past 12 months: %', 
    (SELECT COUNT(*) FROM ferry_flights 
     WHERE created_at >= NOW() - INTERVAL '12 months');
  
END $$;

-- Verify the results
SELECT 
  COUNT(*) as total_flights,
  COUNT(*) FILTER (WHERE status = 'completed') as completed_flights,
  COUNT(*) FILTER (WHERE status = 'aborted') as aborted_flights,
  MIN(planned_departure) as earliest_flight,
  MAX(planned_departure) as latest_flight
FROM ferry_flights
WHERE created_at >= NOW() - INTERVAL '12 months';
