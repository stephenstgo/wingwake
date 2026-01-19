/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as actions_documents from "../actions/documents.js";
import type * as actions_index from "../actions/index.js";
import type * as actions_migrateFlights from "../actions/migrateFlights.js";
import type * as actions_seedExampleData from "../actions/seedExampleData.js";
import type * as auth from "../auth.js";
import type * as mutations_aircraft from "../mutations/aircraft.js";
import type * as mutations_auditLogs from "../mutations/auditLogs.js";
import type * as mutations_discrepancies from "../mutations/discrepancies.js";
import type * as mutations_documents from "../mutations/documents.js";
import type * as mutations_faaPermits from "../mutations/faaPermits.js";
import type * as mutations_ferryFlights from "../mutations/ferryFlights.js";
import type * as mutations_index from "../mutations/index.js";
import type * as mutations_insurancePolicies from "../mutations/insurancePolicies.js";
import type * as mutations_mechanicSignoffs from "../mutations/mechanicSignoffs.js";
import type * as mutations_organizations from "../mutations/organizations.js";
import type * as mutations_pilotQualifications from "../mutations/pilotQualifications.js";
import type * as mutations_profiles from "../mutations/profiles.js";
import type * as queries_aircraft from "../queries/aircraft.js";
import type * as queries_auditLogs from "../queries/auditLogs.js";
import type * as queries_discrepancies from "../queries/discrepancies.js";
import type * as queries_documents from "../queries/documents.js";
import type * as queries_faaPermits from "../queries/faaPermits.js";
import type * as queries_ferryFlights from "../queries/ferryFlights.js";
import type * as queries_index from "../queries/index.js";
import type * as queries_mechanicSignoffs from "../queries/mechanicSignoffs.js";
import type * as queries_organizations from "../queries/organizations.js";
import type * as queries_profiles from "../queries/profiles.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "actions/documents": typeof actions_documents;
  "actions/index": typeof actions_index;
  "actions/migrateFlights": typeof actions_migrateFlights;
  "actions/seedExampleData": typeof actions_seedExampleData;
  auth: typeof auth;
  "mutations/aircraft": typeof mutations_aircraft;
  "mutations/auditLogs": typeof mutations_auditLogs;
  "mutations/discrepancies": typeof mutations_discrepancies;
  "mutations/documents": typeof mutations_documents;
  "mutations/faaPermits": typeof mutations_faaPermits;
  "mutations/ferryFlights": typeof mutations_ferryFlights;
  "mutations/index": typeof mutations_index;
  "mutations/insurancePolicies": typeof mutations_insurancePolicies;
  "mutations/mechanicSignoffs": typeof mutations_mechanicSignoffs;
  "mutations/organizations": typeof mutations_organizations;
  "mutations/pilotQualifications": typeof mutations_pilotQualifications;
  "mutations/profiles": typeof mutations_profiles;
  "queries/aircraft": typeof queries_aircraft;
  "queries/auditLogs": typeof queries_auditLogs;
  "queries/discrepancies": typeof queries_discrepancies;
  "queries/documents": typeof queries_documents;
  "queries/faaPermits": typeof queries_faaPermits;
  "queries/ferryFlights": typeof queries_ferryFlights;
  "queries/index": typeof queries_index;
  "queries/mechanicSignoffs": typeof queries_mechanicSignoffs;
  "queries/organizations": typeof queries_organizations;
  "queries/profiles": typeof queries_profiles;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
