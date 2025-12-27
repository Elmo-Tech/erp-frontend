/**
 * Sales API functions index
 * Exports all API functions for the sales module
 */

export { leadsApi } from "./leads";
export { quotationsApi } from "./quotations";
export { timeEntriesApi } from "./timeEntries";

// Re-export types for convenience
export type { Lead, CreateLeadPayload, UpdateLeadPayload, LeadListResponse, LeadFilters } from "../types/lead";

export type { Quotation, CreateQuotationPayload, UpdateQuotationPayload, CalculatePricingPayload, PricingBreakdown, QuotationListResponse, QuotationFilters } from "../types/quotation";

export type { TimeEntry, StartTimerPayload, ActiveTimerResponse, TimeEntryListResponse, TimeEntryFilters } from "../types/timeEntry";
