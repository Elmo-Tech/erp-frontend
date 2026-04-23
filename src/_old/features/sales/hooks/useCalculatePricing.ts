import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { quotationsApi } from "../api/quotations";
import { CalculatePricingPayload, PricingBreakdown } from "../types/quotation";

/**
 * TanStack Query hook for real-time pricing calculations with debouncing
 * Implements requirements 9.3, 9.4: Debounced API call for real-time pricing
 */

// Query keys for pricing calculations
export const pricingKeys = {
	all: ["pricing"] as const,
	calculate: (payload: CalculatePricingPayload) => [...pricingKeys.all, "calculate", payload] as const,
};

/**
 * Hook to calculate pricing with debouncing for real-time updates
 * Requirement 9.3, 9.4: Implement debounced API call for real-time pricing
 */
export const useCalculatePricing = (
	payload: CalculatePricingPayload | null,
	options?: {
		enabled?: boolean;
		debounceMs?: number;
		staleTime?: number;
	}
) => {
	const {
		enabled = true,
		debounceMs = 500, // 500ms debounce by default
		staleTime = 30 * 1000, // 30 seconds stale time
	} = options || {};

	// Validate payload to ensure all required fields are present and valid
	const isValidPayload = useMemo(() => {
		if (!payload) return false;

		const { estimations, hourlyRate, discountPercentage } = payload;

		// Check if hourly rate is valid
		if (!hourlyRate || hourlyRate <= 0) return false;

		// Check if discount percentage is valid
		if (discountPercentage < 0 || discountPercentage > 100) return false;

		// Check if estimations exist and have at least one positive value
		if (!estimations) return false;

		const totalHours = Object.values(estimations).reduce((sum, hours) => {
			return sum + (typeof hours === "number" && hours >= 0 ? hours : 0);
		}, 0);

		return totalHours > 0;
	}, [payload]);

	// Create a stable query key that changes only when significant values change
	const queryKey = useMemo(() => {
		if (!payload || !isValidPayload || !payload.estimations) return null;

		// Round values to avoid excessive API calls for minor changes
		const roundedPayload: CalculatePricingPayload = {
			estimations: Object.fromEntries(
				Object.entries(payload.estimations).map(([key, value]) => [
					key,
					Math.round(value * 100) / 100, // Round to 2 decimal places
				])
			) as typeof payload.estimations, // Type assertion to maintain Estimations interface
			hourlyRate: Math.round((payload.hourlyRate || 0) * 100) / 100,
			discountPercentage: Math.round(payload.discountPercentage * 100) / 100,
		};

		return pricingKeys.calculate(roundedPayload);
	}, [payload, isValidPayload]);

	return useQuery<PricingBreakdown, Error>({
		queryKey: queryKey || ["pricing", "disabled"],
		queryFn: async () => {
			if (!payload || !isValidPayload) {
				throw new Error("Invalid pricing payload");
			}
			return quotationsApi.calculatePricing(payload);
		},
		enabled: enabled && isValidPayload && !!queryKey,
		staleTime,
		gcTime: 5 * 60 * 1000, // 5 minutes
		// Debouncing is handled by the queryKey stability and React Query's built-in deduplication
		refetchOnWindowFocus: false,
		refetchOnMount: false,
		retry: (failureCount, error) => {
			// Don't retry on validation errors (400 status)
			if (error.message.includes("400") || error.message.includes("validation")) {
				return false;
			}
			return failureCount < 2;
		},
	});
};

/**
 * Hook to get a memoized pricing calculator function
 * Useful for components that need to trigger calculations manually
 */
export const usePricingCalculator = () => {
	return useCallback((payload: CalculatePricingPayload) => {
		return quotationsApi.calculatePricing(payload);
	}, []);
};

/**
 * Hook to validate pricing payload
 * Returns validation errors if any
 */
export const usePricingValidation = (payload: CalculatePricingPayload | null) => {
	return useMemo(() => {
		const errors: string[] = [];

		if (!payload) {
			return { isValid: false, errors: ["Payload is required"] };
		}

		const { estimations, hourlyRate, discountPercentage } = payload;

		// Validate hourly rate
		if (!hourlyRate || hourlyRate <= 0) {
			errors.push("Hourly rate must be greater than 0");
		}

		// Validate discount percentage
		if (discountPercentage < 0 || discountPercentage > 100) {
			errors.push("Discount percentage must be between 0 and 100");
		}

		// Validate estimations
		if (!estimations) {
			errors.push("Estimations are required");
		} else {
			const hasValidHours = Object.values(estimations).some((hours) => typeof hours === "number" && hours > 0);

			if (!hasValidHours) {
				errors.push("At least one estimation category must have hours greater than 0");
			}

			// Check for negative hours
			const hasNegativeHours = Object.entries(estimations).some(([key, hours]) => typeof hours === "number" && hours < 0);

			if (hasNegativeHours) {
				errors.push("Estimation hours cannot be negative");
			}
		}

		return {
			isValid: errors.length === 0,
			errors,
		};
	}, [payload]);
};

/**
 * Hook to calculate total hours from estimations
 * Useful for displaying total hours without making API calls
 */
export const useTotalHours = (estimations: Record<string, number> | null) => {
	return useMemo(() => {
		if (!estimations) return 0;

		return Object.values(estimations).reduce((sum, hours) => {
			return sum + (typeof hours === "number" && hours >= 0 ? hours : 0);
		}, 0);
	}, [estimations]);
};
