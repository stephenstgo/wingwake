-- Redistribute created_at dates for flights across the past 12 months
-- This makes the flights appear to have been created at different times, not all today

-- Temporarily disable triggers to avoid validation issues
SET session_replication_role = replica;

DO $$
DECLARE
  flight_record RECORD;
  new_created_at TIMESTAMPTZ;
  new_updated_at TIMESTAMPTZ;
  days_ago NUMERIC;
  random_factor NUMERIC;
  
BEGIN
  -- Loop through all flights from the past 12 months
  FOR flight_record IN 
    SELECT 
      id, 
      created_at, 
      updated_at,
      planned_departure,
      actual_departure,
      status
    FROM ferry_flights
    WHERE created_at >= NOW() - INTERVAL '12 months'
    ORDER BY RANDOM()
  LOOP
    -- Generate a random date in the past 12 months
    -- Use power function to bias toward more recent dates (more realistic)
    random_factor := POWER(RANDOM(), 0.7);
    days_ago := random_factor * 365;
    
    new_created_at := NOW() - (days_ago || ' days')::INTERVAL;
    
    -- Add some randomness to the time of day (business hours bias)
    -- Most flights created during business hours (8 AM - 6 PM)
    IF RANDOM() < 0.7 THEN
      -- Business hours
      new_created_at := DATE_TRUNC('day', new_created_at) + 
        (8 + FLOOR(RANDOM() * 10) || ' hours')::INTERVAL +
        (FLOOR(RANDOM() * 60) || ' minutes')::INTERVAL;
    ELSE
      -- Any time of day
      new_created_at := DATE_TRUNC('day', new_created_at) + 
        (FLOOR(RANDOM() * 24) || ' hours')::INTERVAL +
        (FLOOR(RANDOM() * 60) || ' minutes')::INTERVAL;
    END IF;
    
    -- Set updated_at to be after created_at
    -- For completed/aborted flights, updated_at should be near the flight date
    -- For other flights, updated_at can be more recent (but not in future)
    IF flight_record.status IN ('completed', 'aborted') AND 
       flight_record.actual_departure IS NOT NULL THEN
      -- Updated when flight completed/aborted
      new_updated_at := flight_record.actual_departure + 
        CASE 
          WHEN flight_record.status = 'completed' AND flight_record.actual_departure IS NOT NULL THEN
            -- Updated shortly after arrival
            (0.5 + RANDOM() * 2) * INTERVAL '1 hour'
          WHEN flight_record.status = 'aborted' THEN
            -- Updated shortly after abort
            (0.1 + RANDOM() * 1) * INTERVAL '1 hour'
          ELSE
            (0.5 + RANDOM() * 4) * INTERVAL '1 hour'
        END;
      
      -- Ensure updated_at is not in the future
      IF new_updated_at > NOW() THEN
        new_updated_at := NOW() - (RANDOM() * 7 || ' days')::INTERVAL;
      END IF;
    ELSIF flight_record.planned_departure IS NOT NULL AND 
          flight_record.planned_departure < NOW() THEN
      -- Flight was planned in the past, updated_at should be between created_at and planned_departure
      -- or shortly after if status suggests it was updated
      IF flight_record.status IN ('scheduled', 'in_progress', 'permit_issued') THEN
        -- Updated closer to flight date
        new_updated_at := flight_record.planned_departure - 
          (RANDOM() * 7 || ' days')::INTERVAL;
      ELSE
        -- Updated sometime between creation and now
        new_updated_at := new_created_at + 
          (RANDOM() * EXTRACT(EPOCH FROM (NOW() - new_created_at)) || ' seconds')::INTERVAL;
      END IF;
      
      -- Ensure updated_at is not before created_at or in the future
      IF new_updated_at < new_created_at THEN
        new_updated_at := new_created_at + (RANDOM() * 1 || ' hours')::INTERVAL;
      END IF;
      IF new_updated_at > NOW() THEN
        new_updated_at := NOW() - (RANDOM() * 1 || ' days')::INTERVAL;
      END IF;
    ELSE
      -- Recent flight or no planned departure, updated_at can be recent
      new_updated_at := new_created_at + 
        (RANDOM() * EXTRACT(EPOCH FROM (NOW() - new_created_at)) || ' seconds')::INTERVAL;
      
      -- Ensure updated_at is not before created_at
      IF new_updated_at < new_created_at THEN
        new_updated_at := new_created_at + (RANDOM() * 1 || ' hours')::INTERVAL;
      END IF;
    END IF;
    
    -- Ensure created_at is not after planned_departure (if it exists and is in the past)
    IF flight_record.planned_departure IS NOT NULL AND 
       flight_record.planned_departure < NOW() AND
       new_created_at > flight_record.planned_departure THEN
      -- Set created_at to be before planned_departure
      new_created_at := flight_record.planned_departure - 
        (7 + RANDOM() * 60 || ' days')::INTERVAL;
    END IF;
    
    -- Update the flight
    UPDATE ferry_flights
    SET 
      created_at = new_created_at,
      updated_at = new_updated_at
    WHERE id = flight_record.id;
    
  END LOOP;
  
  RAISE NOTICE 'Redistributed created_at dates across the past 12 months';
  
END $$;

-- Re-enable triggers
SET session_replication_role = DEFAULT;

-- Show the distribution of created dates
SELECT 
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as flights_created,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) as percentage
FROM ferry_flights
WHERE created_at >= NOW() - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;

-- Show distribution by status and creation month
SELECT 
  DATE_TRUNC('month', created_at) as month,
  status,
  COUNT(*) as count
FROM ferry_flights
WHERE created_at >= NOW() - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', created_at), status
ORDER BY month DESC, status;
