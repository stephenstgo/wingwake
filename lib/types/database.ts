// Database Types for WingWake Ferry Flight Tracking System
// Generated from Supabase schema

export type UserRole = 'owner' | 'mechanic' | 'pilot' | 'admin' | 'viewer';
export type OrganizationType = 'individual' | 'llc' | 'corporation' | 'partnership';
export type OrgMemberRole = 'owner' | 'manager' | 'member';
export type FerryFlightStatus = 
  | 'draft'
  | 'inspection_pending'
  | 'inspection_complete'
  | 'faa_submitted'
  | 'faa_questions'
  | 'permit_issued'
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'aborted'
  | 'denied';

export type DiscrepancySeverity = 'minor' | 'major' | 'critical';
export type FAAPermitStatus = 'draft' | 'submitted' | 'approved' | 'denied' | 'expired';
export type DocumentType = 
  | 'registration'
  | 'airworthiness'
  | 'logbook'
  | 'permit'
  | 'insurance'
  | 'mechanic_statement'
  | 'weight_balance'
  | 'other';

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  type: OrganizationType;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: OrgMemberRole;
  created_at: string;
}

export interface Aircraft {
  id: string;
  n_number: string;
  manufacturer: string | null;
  model: string | null;
  serial_number: string | null;
  year: number | null;
  base_location: string | null;
  owner_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface FerryFlight {
  id: string;
  aircraft_id: string | null;
  tail_number: string | null;
  owner_id: string | null;
  pilot_user_id: string | null;
  mechanic_user_id: string | null;
  origin: string;
  destination: string;
  purpose: string | null;
  status: FerryFlightStatus;
  planned_departure: string | null;
  actual_departure: string | null;
  actual_arrival: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Discrepancy {
  id: string;
  ferry_flight_id: string;
  description: string;
  severity: DiscrepancySeverity;
  affects_flight: boolean;
  affected_system: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface MechanicSignoff {
  id: string;
  ferry_flight_id: string;
  mechanic_user_id: string;
  statement: string;
  limitations: string | null;
  signed_at: string;
  created_at: string;
}

export interface FAAPermit {
  id: string;
  ferry_flight_id: string;
  status: FAAPermitStatus;
  submitted_at: string | null;
  submitted_via: string | null;
  fsdo_mido: string | null;
  approved_at: string | null;
  expires_at: string | null;
  permit_number: string | null;
  limitations: Record<string, any> | null; // JSONB
  limitations_text: string | null;
  faa_contact_name: string | null;
  faa_contact_email: string | null;
  faa_questions: string | null;
  faa_responses: string | null;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  ferry_flight_id: string;
  uploaded_by: string | null;
  file_name: string;
  file_path: string;
  file_size: number | null;
  mime_type: string | null;
  type: DocumentType | null;
  category: string | null;
  description: string | null;
  created_at: string;
}

export interface PilotQualification {
  id: string;
  pilot_user_id: string;
  certificate_type: string | null;
  certificate_number: string | null;
  ratings: string[] | null;
  medical_expires: string | null;
  flight_review_expires: string | null;
  bfr_expires: string | null;
  aircraft_types: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface InsurancePolicy {
  id: string;
  organization_id: string;
  aircraft_id: string | null;
  provider: string;
  policy_number: string;
  coverage_limits: string | null;
  covers_ferry_flights: boolean;
  effective_date: string;
  expiration_date: string;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  ferry_flight_id: string | null;
  user_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  changes: Record<string, any> | null; // JSONB
  created_at: string;
}

// Extended types with relations
export interface FerryFlightWithRelations extends FerryFlight {
  aircraft?: Aircraft;
  owner?: Organization;
  pilot?: Profile;
  mechanic?: Profile;
  discrepancies?: Discrepancy[];
  mechanic_signoffs?: MechanicSignoff[];
  faa_permits?: FAAPermit[];
  documents?: Document[];
}

export interface AircraftWithOwner extends Aircraft {
  owner?: Organization;
}

// Insert types (omitting auto-generated fields)
export type InsertProfile = Omit<Profile, 'id' | 'created_at' | 'updated_at'>;
export type InsertOrganization = Omit<Organization, 'id' | 'created_at' | 'updated_at'>;
export type InsertOrganizationMember = Omit<OrganizationMember, 'id' | 'created_at'>;
export type InsertAircraft = Omit<Aircraft, 'id' | 'created_at' | 'updated_at'>;
export type InsertFerryFlight = Omit<FerryFlight, 'id' | 'created_at' | 'updated_at'>;
export type InsertDiscrepancy = Omit<Discrepancy, 'id' | 'created_at' | 'updated_at'>;
export type InsertMechanicSignoff = Omit<MechanicSignoff, 'id' | 'signed_at' | 'created_at'>;
export type InsertFAAPermit = Omit<FAAPermit, 'id' | 'created_at' | 'updated_at'>;
export type InsertDocument = Omit<Document, 'id' | 'created_at'>;
export type InsertPilotQualification = Omit<PilotQualification, 'id' | 'created_at' | 'updated_at'>;
export type InsertInsurancePolicy = Omit<InsurancePolicy, 'id' | 'created_at' | 'updated_at'>;

// Update types (all fields optional except id)
export type UpdateProfile = Partial<Omit<Profile, 'id' | 'created_at'>>;
export type UpdateOrganization = Partial<Omit<Organization, 'id' | 'created_at'>>;
export type UpdateAircraft = Partial<Omit<Aircraft, 'id' | 'created_at'>>;
export type UpdateFerryFlight = Partial<Omit<FerryFlight, 'id' | 'created_at'>>;
export type UpdateDiscrepancy = Partial<Omit<Discrepancy, 'id' | 'created_at'>>;
export type UpdateFAAPermit = Partial<Omit<FAAPermit, 'id' | 'created_at'>>;
export type UpdateDocument = Partial<Omit<Document, 'id' | 'created_at'>>;


