-- Update existing flights to have a more diverse distribution of statuses
-- This spreads flights across the entire workflow, not just completed/aborted
-- Uses session_replication_role to temporarily bypass triggers

-- Temporarily disable triggers using session replication role
SET session_replication_role = replica;

DO $$
DECLARE
  flight_record RECORD;
  new_status TEXT;
  status_weights NUMERIC[];
  random_value NUMERIC;
  cumulative_weight NUMERIC;
  i INTEGER;
  
  -- Status distribution weights (higher = more likely)
  -- For flights in the past, favor completed/aborted
  -- For recent flights, spread across all statuses
  statuses TEXT[] := ARRAY[
    'draft',
    'inspection_pending',
    'inspection_complete',
    'faa_submitted',
    'faa_questions',
    'permit_issued',
    'scheduled',
    'in_progress',
    'completed',
    'aborted',
    'denied'
  ];
  
  -- Weights for flights older than 3 months (mostly completed/aborted)
  old_weights NUMERIC[] := ARRAY[2, 3, 2, 2, 1, 2, 3, 2, 50, 8, 2];
  
  -- Weights for flights in last 3 months (spread across workflow)
  recent_weights NUMERIC[] := ARRAY[10, 12, 10, 10, 5, 8, 10, 8, 15, 5, 2];
  
  total_weight NUMERIC;
  selected_index INTEGER;
  
BEGIN
  -- Loop through all flights from the past 12 months
  FOR flight_record IN 
    SELECT id, planned_departure, actual_departure, actual_arrival, status
    FROM ferry_flights
    WHERE created_at >= NOW() - INTERVAL '12 months'
    ORDER BY RANDOM()
  LOOP
    -- Determine if flight is old (more than 3 months ago) or recent
    IF flight_record.planned_departure IS NULL OR 
       flight_record.planned_departure < NOW() - INTERVAL '3 months' THEN
      -- Old flight: mostly completed/aborted, some in other states
      status_weights := old_weights;
    ELSE
      -- Recent flight: spread across all workflow stages
      status_weights := recent_weights;
    END IF;
    
    -- Calculate total weight
    total_weight := 0;
    FOR i IN 1..ARRAY_LENGTH(status_weights, 1) LOOP
      total_weight := total_weight + status_weights[i];
    END LOOP;
    
    -- Select random status based on weights
    random_value := RANDOM() * total_weight;
    cumulative_weight := 0;
    selected_index := 1;
    
    FOR i IN 1..ARRAY_LENGTH(status_weights, 1) LOOP
      cumulative_weight := cumulative_weight + status_weights[i];
      IF random_value <= cumulative_weight THEN
        selected_index := i;
        EXIT;
      END IF;
    END LOOP;
    
    new_status := statuses[selected_index];
    
    -- Update the flight with new status and appropriate dates
    UPDATE ferry_flights
    SET 
      status = new_status,
      -- Set actual_departure/arrival based on status
      actual_departure = CASE 
        WHEN new_status IN ('completed', 'aborted', 'in_progress') 
          AND planned_departure IS NOT NULL
        THEN planned_departure
        ELSE actual_departure
      END,
      actual_arrival = CASE 
        WHEN new_status = 'completed' 
          AND planned_departure IS NOT NULL
        THEN planned_departure + (1.5 + RANDOM() * 9.5) * INTERVAL '1 hour'
        ELSE CASE WHEN new_status != 'completed' THEN NULL ELSE actual_arrival END
      END,
      updated_at = NOW()
    WHERE id = flight_record.id;
    
  END LOOP;
  
  RAISE NOTICE 'Updated all flights with new status distribution';
  
END $$;

-- Re-enable triggers
SET session_replication_role = DEFAULT;

-- Show the new distribution
SELECT 
  status,
  COUNT(*) as count,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) as percentage
FROM ferry_flights
WHERE created_at >= NOW() - INTERVAL '12 months'
GROUP BY status
ORDER BY 
  CASE status
    WHEN 'draft' THEN 1
    WHEN 'inspection_pending' THEN 2
    WHEN 'inspection_complete' THEN 3
    WHEN 'faa_submitted' THEN 4
    WHEN 'faa_questions' THEN 5
    WHEN 'permit_issued' THEN 6
    WHEN 'scheduled' THEN 7
    WHEN 'in_progress' THEN 8
    WHEN 'completed' THEN 9
    WHEN 'aborted' THEN 10
    WHEN 'denied' THEN 11
    ELSE 12
  END;

-- Show distribution by age
SELECT 
  CASE 
    WHEN planned_departure < NOW() - INTERVAL '3 months' THEN 'Older than 3 months'
    WHEN planned_departure >= NOW() - INTERVAL '3 months' THEN 'Last 3 months'
    ELSE 'No departure date'
  END as flight_age,
  status,
  COUNT(*) as count
FROM ferry_flights
WHERE created_at >= NOW() - INTERVAL '12 months'
GROUP BY 
  CASE 
    WHEN planned_departure < NOW() - INTERVAL '3 months' THEN 'Older than 3 months'
    WHEN planned_departure >= NOW() - INTERVAL '3 months' THEN 'Last 3 months'
    ELSE 'No departure date'
  END,
  status
ORDER BY flight_age, status;
