"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";
import { Id } from "../_generated/dataModel";

// Common US airports for realistic flight data
const AIRPORTS = [
  "KORD", "KLAX", "KDFW", "KJFK", "KMIA", "KSEA", "KPHX", "KIAH", "KATL", "KCLT",
  "KDEN", "KMCI", "KBOS", "KBDL", "KLAS", "KPDX", "KSFO", "KSAN", "KDTW", "KMSP",
  "KBWI", "KDCA", "KIAD", "KEWR", "KLGA", "KBNA", "KMSY", "KSTL", "KCLE", "KIND",
  "KCMH", "KPIT", "KBUF", "KRDU", "KCHS", "KSAV", "KJAX", "KMCO", "KTPA", "KFLL",
];

const PURPOSES = [
  "Delivery",
  "Maintenance",
  "Repositioning",
  "Storage",
  "Training",
  "Export",
  "Inspection",
  "Weighing",
  "Sale",
  "Relocation",
];

const STATUSES: Array<
  | "draft"
  | "inspection_pending"
  | "inspection_complete"
  | "faa_submitted"
  | "faa_questions"
  | "permit_issued"
  | "scheduled"
  | "in_progress"
  | "completed"
  | "aborted"
  | "denied"
> = [
  "draft",
  "inspection_pending",
  "inspection_complete",
  "faa_submitted",
  "faa_questions",
  "permit_issued",
  "scheduled",
  "in_progress",
  "completed",
  "completed",
  "completed",
  "aborted",
  "denied",
];

const MANUFACTURERS = [
  "Cessna",
  "Piper",
  "Beechcraft",
  "Mooney",
  "Cirrus",
  "Diamond",
  "Gulfstream",
  "Bombardier",
];

const MODELS = [
  "172N",
  "172SP",
  "182",
  "206",
  "PA-28",
  "PA-32",
  "Bonanza",
  "Baron",
  "M20",
  "SR22",
  "DA40",
  "DA42",
];

const ORGANIZATION_NAMES = [
  "Skyward Aviation LLC",
  "Aero Transport Inc",
  "Wings & Wheels Corp",
  "Pacific Flight Services",
  "Mountain View Aviation",
  "Coastal Air Transport",
  "Desert Wings LLC",
  "Northern Lights Aviation",
];

function randomDateInPast12Months(): number {
  const now = Date.now();
  const twelveMonthsAgo = now - 365 * 24 * 60 * 60 * 1000;
  const randomFactor = Math.pow(Math.random(), 0.7); // Bias toward recent dates
  return Math.floor(twelveMonthsAgo + randomFactor * (now - twelveMonthsAgo));
}

function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomNNumber(): string {
  const letters = "ABCDEFGHJKLMNPRSTUVWXYZ";
  const numbers = "0123456789";
  let nNumber = "N";
  for (let i = 0; i < 3; i++) {
    nNumber += numbers[Math.floor(Math.random() * numbers.length)];
  }
  for (let i = 0; i < 2; i++) {
    nNumber += letters[Math.floor(Math.random() * letters.length)];
  }
  return nNumber;
}

export const seedExampleData = action({
  args: {},
  handler: async (ctx): Promise<{
    success: boolean;
    created: {
      profiles: number;
      organizations: number;
      organizationMembers: number;
      aircraft: number;
      ferryFlights: number;
      discrepancies: number;
      mechanicSignoffs: number;
      faaPermits: number;
      documents: number;
      pilotQualifications: number;
      insurancePolicies: number;
      auditLogs: number;
    };
    errors: string[];
  }> => {
    const errors: string[] = [];
    const now = Date.now();

    // Track created IDs
    const profileIds: Id<"profiles">[] = [];
    const organizationIds: Id<"organizations">[] = [];
    const aircraftIds: Id<"aircraft">[] = [];
    const flightIds: Id<"ferryFlights">[] = [];

    try {
      // 1. Create Profiles (10 profiles with different roles)
      console.log("Creating profiles...");
      const profileRoles: Array<"owner" | "mechanic" | "pilot" | "admin" | "viewer"> = [
        "admin",
        "owner",
        "owner",
        "mechanic",
        "mechanic",
        "pilot",
        "pilot",
        "pilot",
        "viewer",
        "viewer",
      ];

      for (let i = 0; i < 10; i++) {
        try {
          const profileId = await ctx.runMutation(
            (api as any)["mutations/profiles"].createProfile,
            {
              email: `user${i + 1}@example.com`,
              fullName: `User ${i + 1} Name`,
              role: profileRoles[i],
            }
          );
          profileIds.push(profileId);
        } catch (error) {
          errors.push(`Failed to create profile ${i + 1}: ${error}`);
        }
      }

      // 2. Create Organizations (8 organizations)
      console.log("Creating organizations...");
      const orgTypes: Array<"individual" | "llc" | "corporation" | "partnership"> = [
        "llc",
        "corporation",
        "llc",
        "individual",
        "corporation",
        "partnership",
        "llc",
        "individual",
      ];

      for (let i = 0; i < 8; i++) {
        try {
          const orgId = await ctx.runMutation(
            (api as any)["mutations/organizations"].createOrganization,
            {
              name: ORGANIZATION_NAMES[i] || `Organization ${i + 1}`,
              type: orgTypes[i],
            }
          );
          organizationIds.push(orgId);
        } catch (error) {
          errors.push(`Failed to create organization ${i + 1}: ${error}`);
        }
      }

      // 3. Create Organization Members (link profiles to orgs)
      console.log("Creating organization members...");
      let orgMemberCount = 0;
      for (let i = 0; i < organizationIds.length; i++) {
        const orgId = organizationIds[i];
        // Each org gets 2-4 members
        const numMembers = 2 + Math.floor(Math.random() * 3);
        for (let j = 0; j < numMembers && j < profileIds.length; j++) {
          try {
            const memberRole = j === 0 ? "owner" : j === 1 ? "manager" : "member";
            await ctx.runMutation(
              (api as any)["mutations/organizations"].addMemberToOrganization,
              {
                organizationId: orgId,
                userId: profileIds[j % profileIds.length],
                role: memberRole,
              }
            );
            orgMemberCount++;
          } catch (error) {
            errors.push(`Failed to add member to org ${i + 1}: ${error}`);
          }
        }
      }

      // 4. Create Aircraft (15 aircraft)
      console.log("Creating aircraft...");
      for (let i = 0; i < 15; i++) {
        try {
          const ownerId = Math.random() > 0.3 ? randomElement(organizationIds) : undefined;
          const aircraftId = await ctx.runMutation(
            (api as any)["mutations/aircraft"].createAircraft,
            {
              nNumber: randomNNumber(),
              manufacturer: randomElement(MANUFACTURERS),
              model: randomElement(MODELS),
              serialNumber: `SN${1000 + i}`,
              year: 1980 + Math.floor(Math.random() * 44),
              baseLocation: randomElement(AIRPORTS),
              ownerId,
            }
          );
          aircraftIds.push(aircraftId);
        } catch (error) {
          errors.push(`Failed to create aircraft ${i + 1}: ${error}`);
        }
      }

      // 5. Create Ferry Flights (50 flights)
      console.log("Creating ferry flights...");
      const pilotProfiles = profileIds.filter((_, i) => profileRoles[i] === "pilot" || profileRoles[i] === "admin");
      const mechanicProfiles = profileIds.filter((_, i) => profileRoles[i] === "mechanic" || profileRoles[i] === "admin");
      const ownerProfiles = profileIds.filter((_, i) => profileRoles[i] === "owner" || profileRoles[i] === "admin");

      for (let i = 0; i < 50; i++) {
        try {
          const departureDate = randomDateInPast12Months();
          const flightDuration = 2 + Math.random() * 8; // 2-10 hours
          const arrivalDate = departureDate + flightDuration * 60 * 60 * 1000;

          const status = randomElement(STATUSES);
          const aircraftId = randomElement(aircraftIds);
          const ownerId = randomElement(organizationIds);
          const pilotId = pilotProfiles.length > 0 ? randomElement(pilotProfiles) : undefined;
          const mechanicId = mechanicProfiles.length > 0 ? randomElement(mechanicProfiles) : undefined;
          const createdById = ownerProfiles.length > 0 ? randomElement(ownerProfiles) : undefined;

          const flightId = await ctx.runMutation(
            (api as any)["mutations/ferryFlights"].createFerryFlight,
            {
              aircraftId,
              tailNumber: randomNNumber(),
              ownerId,
              pilotUserId: pilotId,
              mechanicUserId: mechanicId,
              origin: randomElement(AIRPORTS),
              destination: randomElement(AIRPORTS),
              purpose: randomElement(PURPOSES),
              status,
              plannedDeparture: departureDate,
              actualDeparture: status === "completed" || status === "in_progress" ? departureDate : undefined,
              actualArrival: status === "completed" ? arrivalDate : undefined,
              createdBy: createdById,
              createdAt: departureDate - 7 * 24 * 60 * 60 * 1000, // Created 7 days before departure
              updatedAt: now,
            }
          );
          flightIds.push(flightId);
        } catch (error) {
          errors.push(`Failed to create flight ${i + 1}: ${error}`);
        }
      }

      // 6. Create Discrepancies (for some flights)
      console.log("Creating discrepancies...");
      let discrepancyCount = 0;
      const severities: Array<"minor" | "major" | "critical"> = ["minor", "major", "critical"];
      const affectedSystems = ["Engine", "Avionics", "Landing Gear", "Electrical", "Fuel System", "Hydraulics"];

      for (let i = 0; i < Math.min(30, flightIds.length); i++) {
        const flightId = flightIds[i];
        const numDiscrepancies = Math.random() > 0.6 ? 1 : 0; // 40% of flights have discrepancies
        if (numDiscrepancies > 0) {
          try {
            await ctx.runMutation(
              (api as any)["mutations/discrepancies"].createDiscrepancy,
              {
                ferryFlightId: flightId,
                description: `Discrepancy found: ${randomElement(affectedSystems)} issue`,
                severity: randomElement(severities),
                affectsFlight: Math.random() > 0.5,
                affectedSystem: randomElement(affectedSystems),
                createdBy: randomElement(profileIds),
              }
            );
            discrepancyCount++;
          } catch (error) {
            errors.push(`Failed to create discrepancy for flight ${i + 1}: ${error}`);
          }
        }
      }

      // 7. Create Mechanic Signoffs (for some flights)
      console.log("Creating mechanic signoffs...");
      let signoffCount = 0;
      // Filter to only actual mechanics (role === "mechanic" or "admin")
      const actualMechanics = profileIds.filter((_, idx) => {
        const role = profileRoles[idx];
        return role === "mechanic" || role === "admin";
      });
      
      for (let i = 0; i < Math.min(25, flightIds.length); i++) {
        const flightId = flightIds[i];
        if (actualMechanics.length > 0 && Math.random() > 0.4) {
          try {
            await ctx.runMutation(
              (api as any)["mutations/mechanicSignoffs"].createSignoff,
              {
                ferryFlightId: flightId,
                mechanicUserId: randomElement(actualMechanics),
                statement: "I certify that this aircraft is airworthy for ferry flight operations.",
                limitations: Math.random() > 0.7 ? "Day VFR only" : undefined,
              }
            );
            signoffCount++;
          } catch (error) {
            errors.push(`Failed to create signoff for flight ${i + 1}: ${error}`);
          }
        }
      }

      // 8. Create FAA Permits (for some flights)
      console.log("Creating FAA permits...");
      let permitCount = 0;
      const permitStatuses: Array<"draft" | "submitted" | "approved" | "denied" | "expired"> = [
        "draft",
        "submitted",
        "approved",
        "approved",
        "denied",
      ];

      for (let i = 0; i < Math.min(35, flightIds.length); i++) {
        const flightId = flightIds[i];
        if (Math.random() > 0.3) {
          try {
            const status = randomElement(permitStatuses);
            const submittedAt = status !== "draft" ? randomDateInPast12Months() : undefined;
            const approvedAt = status === "approved" && submittedAt ? submittedAt + 2 * 24 * 60 * 60 * 1000 : undefined;
            const expiresAt = approvedAt ? approvedAt + 30 * 24 * 60 * 60 * 1000 : undefined;

            await ctx.runMutation(
              (api as any)["mutations/faaPermits"].createPermit,
              {
                ferryFlightId: flightId,
                status,
                submittedAt,
                submittedVia: submittedAt ? randomElement(["Email", "Phone", "Online"]) : undefined,
                fsdoMido: submittedAt ? `FSDO-${Math.floor(Math.random() * 50)}` : undefined,
                approvedAt,
                expiresAt,
                permitNumber: status === "approved" ? `PERMIT-${1000 + i}` : undefined,
                limitationsText: status === "approved" ? "Day VFR only, single pilot" : undefined,
                faaContactName: submittedAt ? "John Doe" : undefined,
                faaContactEmail: submittedAt ? "john.doe@faa.gov" : undefined,
              }
            );
            permitCount++;
          } catch (error) {
            errors.push(`Failed to create permit for flight ${i + 1}: ${error}`);
          }
        }
      }

      // 9. Create Documents (for some flights)
      console.log("Creating documents...");
      let documentCount = 0;
      const documentTypes: Array<
        "registration" | "airworthiness" | "logbook" | "permit" | "insurance" | "mechanic_statement" | "weight_balance" | "other"
      > = ["registration", "airworthiness", "logbook", "permit", "insurance", "mechanic_statement", "weight_balance", "other"];

      for (let i = 0; i < Math.min(40, flightIds.length); i++) {
        const flightId = flightIds[i];
        const numDocs = Math.random() > 0.5 ? 1 : 0; // 50% of flights have documents
        if (numDocs > 0) {
          try {
            await ctx.runMutation(
              (api as any)["mutations/documents"].createDocument,
              {
                ferryFlightId: flightId,
                uploadedBy: randomElement(profileIds),
                fileName: `${randomElement(documentTypes)}_document_${i + 1}.pdf`,
                filePath: `documents/flight_${i + 1}/${randomElement(documentTypes)}_document_${i + 1}.pdf`,
                fileSize: 100000 + Math.floor(Math.random() * 900000),
                mimeType: "application/pdf",
                type: randomElement(documentTypes),
                category: randomElement(["Required", "Optional", "Supporting"]),
                description: `Document for flight ${i + 1}`,
              }
            );
            documentCount++;
          } catch (error) {
            errors.push(`Failed to create document for flight ${i + 1}: ${error}`);
          }
        }
      }

      // 10. Create Pilot Qualifications (for pilot profiles)
      console.log("Creating pilot qualifications...");
      let qualificationCount = 0;
      for (const pilotId of pilotProfiles) {
        if (Math.random() > 0.3) {
          try {
            await ctx.runMutation(
              (api as any)["mutations/pilotQualifications"].createPilotQualification,
              {
                pilotUserId: pilotId,
                certificateType: randomElement(["Private", "Commercial", "ATP"]),
                certificateNumber: `CERT-${Math.floor(Math.random() * 100000)}`,
                ratings: ["Instrument", "Multi-Engine"],
                medicalExpires: now + 180 * 24 * 60 * 60 * 1000, // 6 months from now
                flightReviewExpires: now + 90 * 24 * 60 * 60 * 1000, // 3 months from now
                bfrExpires: now + 120 * 24 * 60 * 60 * 1000, // 4 months from now
                aircraftTypes: ["Single Engine", "Multi Engine"],
              }
            );
            qualificationCount++;
          } catch (error) {
            errors.push(`Failed to create qualification for pilot: ${error}`);
          }
        }
      }

      // 11. Create Insurance Policies (for organizations)
      console.log("Creating insurance policies...");
      let insuranceCount = 0;
      for (let i = 0; i < organizationIds.length; i++) {
        if (Math.random() > 0.2) {
          try {
            const orgId = organizationIds[i];
            const aircraftId = Math.random() > 0.5 ? randomElement(aircraftIds) : undefined;
            await ctx.runMutation(
              (api as any)["mutations/insurancePolicies"].createInsurancePolicy,
              {
                organizationId: orgId,
                aircraftId,
                provider: randomElement(["Aviation Insurance Group", "Global Aerospace", "Starr Aviation", "USAIG"]),
                policyNumber: `POL-${1000 + i}`,
                coverageLimits: "$1,000,000 / $2,000,000",
                coversFerryFlights: Math.random() > 0.3,
                effectiveDate: randomDateInPast12Months(),
                expirationDate: now + 180 * 24 * 60 * 60 * 1000, // 6 months from now
              }
            );
            insuranceCount++;
          } catch (error) {
            errors.push(`Failed to create insurance policy ${i + 1}: ${error}`);
          }
        }
      }

      // 12. Create Audit Logs (various actions)
      console.log("Creating audit logs...");
      let auditLogCount = 0;
      const actions = ["created", "updated", "status_changed", "document_uploaded", "permit_submitted"];

      for (let i = 0; i < 100; i++) {
        try {
          const flightId = Math.random() > 0.3 ? randomElement(flightIds) : undefined;
          await ctx.runMutation(
            (api as any)["mutations/auditLogs"].createAuditLog,
            {
              ferryFlightId: flightId,
              userId: randomElement(profileIds),
              action: randomElement(actions),
              entityType: randomElement(["ferry_flight", "document", "permit", "discrepancy"]),
              entityId: flightId || undefined,
              changes: { field: "status", oldValue: "draft", newValue: "submitted" },
            }
          );
          auditLogCount++;
        } catch (error) {
          errors.push(`Failed to create audit log ${i + 1}: ${error}`);
        }
      }

      return {
        success: true,
        created: {
          profiles: profileIds.length,
          organizations: organizationIds.length,
          organizationMembers: orgMemberCount,
          aircraft: aircraftIds.length,
          ferryFlights: flightIds.length,
          discrepancies: discrepancyCount,
          mechanicSignoffs: signoffCount,
          faaPermits: permitCount,
          documents: documentCount,
          pilotQualifications: qualificationCount,
          insurancePolicies: insuranceCount,
          auditLogs: auditLogCount,
        },
        errors: errors.slice(0, 50), // Limit errors to first 50
      };
    } catch (error) {
      return {
        success: false,
        created: {
          profiles: profileIds.length,
          organizations: organizationIds.length,
          organizationMembers: 0,
          aircraft: aircraftIds.length,
          ferryFlights: flightIds.length,
          discrepancies: 0,
          mechanicSignoffs: 0,
          faaPermits: 0,
          documents: 0,
          pilotQualifications: 0,
          insurancePolicies: 0,
          auditLogs: 0,
        },
        errors: [error instanceof Error ? error.message : String(error), ...errors],
      };
    }
  },
});
