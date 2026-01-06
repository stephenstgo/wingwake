export interface ChecklistItem {
  id: string;
  title: string;
  description?: string;
  items?: string[];
  selectableItems?: { id: string; title: string }[];
  warning?: string;
  note?: string;
  roles?: ('owner' | 'mechanic' | 'pilot')[];
}

export interface ChecklistSection {
  step: number;
  title: string;
  items: ChecklistItem[];
}

export const checklistData: ChecklistSection[] = [
  {
    step: 1,
    title: "Determine the Need for a Ferry Flight",
    items: [
      {
        id: "1-1",
        title: "Aircraft is not airworthy but can be flown safely",
        roles: ['owner']
      },
      {
        id: "1-2",
        title: "Identify reason for ferry flight",
        selectableItems: [
          { id: "1-2-1", title: "Repositioning to a maintenance facility" },
          { id: "1-2-2", title: "Returning to base" },
          { id: "1-2-3", title: "Export/import delivery" },
          { id: "1-2-4", title: "Storage relocation" },
          { id: "1-2-5", title: "Weighing or modifications" },
          { id: "1-2-6", title: "Flight testing after major repairs or modifications" },
          { id: "1-2-7", title: "Delivery to new owner (domestic sale)" },
          { id: "1-2-8", title: "Moving to paint facility" },
          { id: "1-2-9", title: "Moving to avionics shop" },
          { id: "1-2-10", title: "Moving to annual inspection location" },
          { id: "1-2-11", title: "Pre-purchase inspection" },
          { id: "1-2-12", title: "Moving to different FBO or hangar" },
          { id: "1-2-13", title: "Repositioning for charter or lease operations" }
        ],
        roles: ['owner']
      },
      {
        id: "1-3",
        title: "Confirm ferry permit is needed",
        note: "If the aircraft is fully airworthy, a ferry permit is not needed",
        roles: ['owner']
      }
    ]
  },
  {
    step: 2,
    title: "Identify the Aircraft's Unairworthy Condition",
    items: [
      {
        id: "2-1",
        title: "Document what is broken, missing, or non-compliant",
        roles: ['owner', 'mechanic']
      },
      {
        id: "2-2",
        title: "Document why it prevents normal airworthiness",
        roles: ['mechanic']
      },
      {
        id: "2-3",
        title: "Assess affected systems",
        selectableItems: [
          { id: "2-3-1", title: "Powerplant" },
          { id: "2-3-2", title: "Flight controls" },
          { id: "2-3-3", title: "Navigation instruments" },
          { id: "2-3-4", title: "Structural integrity" },
          { id: "2-3-5", title: "Required equipment (per type certificate)" },
          { id: "2-3-6", title: "Electrical systems" },
          { id: "2-3-7", title: "Hydraulic systems" },
          { id: "2-3-8", title: "Landing gear" },
          { id: "2-3-9", title: "Fuel systems" },
          { id: "2-3-10", title: "Environmental systems (pressurization, heating, air conditioning)" },
          { id: "2-3-11", title: "Communication systems" },
          { id: "2-3-12", title: "Avionics" },
          { id: "2-3-13", title: "Propeller systems" },
          { id: "2-3-14", title: "Emergency systems (oxygen, fire suppression, ELT)" },
          { id: "2-3-15", title: "Pitot-static systems" },
          { id: "2-3-16", title: "Anti-ice/de-ice systems" }
        ],
        roles: ['mechanic']
      },
      {
        id: "2-4",
        title: "Determine impact on permit approval and operating limitations",
        roles: ['mechanic']
      }
    ]
  },
  {
    step: 3,
    title: "Engage a Certificated Mechanic (A&P or IA)",
    items: [
      {
        id: "3-1",
        title: "Schedule mechanic inspection",
        roles: ['owner']
      },
      {
        id: "3-2",
        title: "Inspect the aircraft thoroughly",
        roles: ['mechanic']
      },
      {
        id: "3-3",
        title: "Determine aircraft is safe for intended flight",
        roles: ['mechanic']
      },
      {
        id: "3-4",
        title: "Identify any required limitations",
        roles: ['mechanic']
      },
      {
        id: "3-5",
        title: "Make logbook entry",
        items: [
          "Aircraft is safe for a special flight",
          "Purpose of the flight",
          "Known discrepancies"
        ],
        warning: "An IA is not always required, but some FSDOs prefer one for complex cases",
        roles: ['mechanic']
      }
    ]
  },
  {
    step: 4,
    title: "Prepare Required Documentation",
    items: [
      {
        id: "4-1",
        title: "Gather aircraft documents",
        items: [
          "Registration",
          "Airworthiness certificate (even if invalid)",
          "Maintenance logbooks",
          "Weight & balance",
          "Equipment list (if relevant)"
        ],
        roles: ['owner']
      },
      {
        id: "4-2",
        title: "Obtain mechanic statement",
        description: "Written or logbook endorsement confirming safe flight",
        roles: ['mechanic']
      }
    ]
  },
  {
    step: 5,
    title: "Apply for a Special Flight Permit (Ferry Permit)",
    items: [
      {
        id: "5-1",
        title: "Complete FAA Form 8130-6",
        roles: ['owner']
      },
      {
        id: "5-2",
        title: "Submit online (FAA portal) or via email to local FSDO/MIDO",
        roles: ['owner']
      },
      {
        id: "5-3",
        title: "Include required information",
        items: [
          "Aircraft details",
          "Current location",
          "Destination(s)",
          "Purpose of flight",
          "Description of discrepancies",
          "Proposed route",
          "Pilot information"
        ],
        roles: ['owner']
      }
    ]
  },
  {
    step: 6,
    title: "Coordinate With the FAA (FSDO or MIDO)",
    items: [
      {
        id: "6-1",
        title: "Respond to FAA requests for additional documentation",
        roles: ['owner']
      },
      {
        id: "6-2",
        title: "Answer clarifying questions",
        roles: ['owner']
      },
      {
        id: "6-3",
        title: "Review any modified route or limitations",
        roles: ['owner']
      },
      {
        id: "6-4",
        title: "Complete additional inspections if required",
        roles: ['mechanic']
      },
      {
        id: "6-5",
        title: "Wait for approval",
        note: "Approval time: Same day (simple cases) to several days (complex issues)",
        roles: ['owner']
      }
    ]
  },
  {
    step: 7,
    title: "Receive the Special Flight Permit",
    items: [
      {
        id: "7-1",
        title: "Review all operating limitations",
        items: [
          "Day VFR only",
          "No passengers (crew only)",
          "Altitude restrictions",
          "Weather minimums",
          "Speed limitations",
          "Required placards",
          "Maintenance actions required before flight",
          "Single-leg or multi-leg authorization"
        ],
        warning: "The permit is aircraft-specific and route-specific",
        roles: ['owner', 'pilot']
      }
    ]
  },
  {
    step: 8,
    title: "Select and Verify the Pilot",
    items: [
      {
        id: "8-1",
        title: "Verify pilot holds appropriate certificate and ratings",
        roles: ['owner']
      },
      {
        id: "8-2",
        title: "Confirm pilot currency",
        items: [
          "Medical",
          "Flight review",
          "Aircraft category/class"
        ],
        roles: ['pilot']
      },
      {
        id: "8-3",
        title: "Verify pilot qualification for aircraft complexity",
        roles: ['owner', 'pilot']
      },
      {
        id: "8-4",
        title: "Verify pilot is qualified for known deficiencies",
        roles: ['pilot']
      },
      {
        id: "8-5",
        title: "Verify pilot is qualified for operating limitations",
        roles: ['pilot']
      },
      {
        id: "8-6",
        title: "Confirm named pilot requirements (if applicable)",
        roles: ['owner', 'pilot']
      },
      {
        id: "8-7",
        title: "Brief pilot on ferry flight specifics",
        items: [
          "Review all known aircraft discrepancies",
          "Discuss operating limitations from permit",
          "Cover route details and restrictions",
          "Review emergency procedures specific to unairworthy condition",
          "Confirm pilot understands all permit conditions"
        ],
        roles: ['owner', 'pilot']
      }
    ]
  },
  {
    step: 9,
    title: "Insurance & Owner Authorization",
    items: [
      {
        id: "9-1",
        title: "Confirm insurance coverage includes ferry operations",
        roles: ['owner']
      },
      {
        id: "9-2",
        title: "Notify insurer if required",
        roles: ['owner']
      },
      {
        id: "9-3",
        title: "Obtain written authorization from aircraft owner",
        description: "Required if pilot is not the owner",
        roles: ['owner']
      }
    ]
  },
  {
    step: 10,
    title: "Flight Planning With Restrictions",
    items: [
      {
        id: "10-1",
        title: "Plan route as approved by FAA",
        roles: ['pilot']
      },
      {
        id: "10-2",
        title: "Plan fuel requirements and stops",
        items: [
          "Calculate fuel requirements for each leg",
          "Ensure adequate fuel reserves per regulations",
          "Identify fuel stops (if allowed)",
          "Verify fuel availability at planned stops",
          "Confirm fuel type/grade availability",
          "Plan fuel quantities for each leg"
        ],
        roles: ['pilot']
      },
      {
        id: "10-3",
        title: "Calculate weight and balance for ferry flight",
        items: [
          "Account for pilot weight",
          "Calculate fuel load",
          "Verify within aircraft limits",
          "Document weight and balance calculation"
        ],
        roles: ['pilot']
      },
      {
        id: "10-4",
        title: "Review terrain and obstacle clearance",
        roles: ['pilot']
      },
      {
        id: "10-5",
        title: "Verify weather is within permit limits",
        roles: ['pilot']
      },
      {
        id: "10-6",
        title: "Identify emergency landing options",
        roles: ['pilot']
      },
      {
        id: "10-7",
        title: "Review NOTAMs and TFRs",
        roles: ['pilot']
      },
      {
        id: "10-8",
        title: "Establish communication plan and flight following",
        items: [
          "Set up flight following procedures",
          "Establish emergency contact information",
          "Plan check-in procedures with ground support",
          "Verify communication equipment is operational",
          "Confirm backup communication methods"
        ],
        roles: ['pilot']
      },
      {
        id: "10-9",
        title: "Review emergency procedures specific to unairworthy condition",
        items: [
          "Review procedures if known discrepancy worsens",
          "Plan response to equipment failures",
          "Identify abort criteria and procedures",
          "Review emergency landing procedures"
        ],
        roles: ['pilot']
      },
      {
        id: "10-10",
        title: "Coordinate ground support arrangements",
        items: [
          "Confirm arrival arrangements at destination",
          "Coordinate ground handling at fuel stops",
          "Notify maintenance facility (if applicable)",
          "Arrange for aircraft security at stops"
        ],
        roles: ['owner', 'pilot']
      },
      {
        id: "10-11",
        title: "Confirm no deviations unless approved by FAA",
        warning: "No deviations unless approved by FAA",
        roles: ['pilot']
      }
    ]
  },
  {
    step: 11,
    title: "Preflight Inspection (Enhanced)",
    items: [
      {
        id: "11-1",
        title: "Verify special flight permit is valid and present",
        items: [
          "Confirm permit is not expired",
          "Verify permit matches intended flight (route, aircraft, pilot)",
          "Ensure permit is physically present in aircraft",
          "Review all permit limitations one final time"
        ],
        roles: ['pilot']
      },
      {
        id: "11-2",
        title: "Perform thorough preflight inspection",
        roles: ['pilot']
      },
      {
        id: "11-3",
        title: "Focus on known discrepancies",
        roles: ['pilot']
      },
      {
        id: "11-4",
        title: "Verify required equipment per permit limitations",
        items: [
          "Confirm all required equipment is operational",
          "Verify backup systems (if applicable)",
          "Check that placards and limitations are properly installed",
          "Ensure no unauthorized equipment modifications"
        ],
        roles: ['pilot']
      },
      {
        id: "11-5",
        title: "Confirm compliance with all permit conditions",
        roles: ['pilot']
      }
    ]
  },
  {
    step: 12,
    title: "Conduct the Ferry Flight",
    items: [
      {
        id: "12-1",
        title: "Operate strictly within permit limitations",
        roles: ['pilot']
      },
      {
        id: "12-2",
        title: "Ensure no unauthorized passengers or cargo",
        roles: ['pilot']
      },
      {
        id: "12-3",
        title: "Be prepared to abort if safety becomes questionable",
        roles: ['pilot']
      },
      {
        id: "12-4",
        title: "Log flight time normally",
        roles: ['pilot']
      }
    ]
  },
  {
    step: 13,
    title: "Post-Flight Actions",
    items: [
      {
        id: "13-1",
        title: "Secure aircraft",
        roles: ['pilot']
      },
      {
        id: "13-2",
        title: "Log the ferry flight",
        roles: ['pilot']
      },
      {
        id: "13-3",
        title: "Deliver aircraft to authorized destination",
        items: [
          "Maintenance facility",
          "Storage",
          "Export handler"
        ],
        roles: ['pilot']
      },
      {
        id: "13-4",
        title: "Begin corrective maintenance",
        note: "The ferry permit expires once the purpose is completed",
        roles: ['mechanic']
      }
    ]
  },
  {
    step: 14,
    title: "Maintenance & Return to Airworthiness",
    items: [
      {
        id: "14-1",
        title: "Complete required repairs",
        roles: ['mechanic']
      },
      {
        id: "14-2",
        title: "Perform inspections",
        roles: ['mechanic']
      },
      {
        id: "14-3",
        title: "Make logbook entries",
        roles: ['mechanic']
      },
      {
        id: "14-4",
        title: "Issue return-to-service endorsement",
        roles: ['mechanic']
      },
      {
        id: "14-5",
        title: "Reinstate full airworthiness",
        roles: ['mechanic']
      }
    ]
  }
];

