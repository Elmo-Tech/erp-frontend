export const WORKING_DAYS_PER_WEEK = 5;

export function calculateMonthlyWorkHours(workHoursPerDay: number): number {
	if (!Number.isFinite(workHoursPerDay) || workHoursPerDay <= 0) {
		return 0;
	}

	return Math.round(((workHoursPerDay * WORKING_DAYS_PER_WEEK * 52) / 12) * 100) / 100;
}

export function calculateHourlyRate(monthlySalary: number | null | undefined, workHoursPerDay: number): number | null {
	if (monthlySalary === null || monthlySalary === undefined || !Number.isFinite(monthlySalary)) {
		return null;
	}

	const monthlyHours = calculateMonthlyWorkHours(workHoursPerDay);
	return monthlyHours > 0 ? Math.round((monthlySalary / monthlyHours) * 100) / 100 : null;
}
