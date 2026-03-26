/**
 * InternalCostManager Component
 * Secure interface for managing user internal costs with permission-based access.
 *
 * Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6
 */

"use client";

import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, EyeOff, Save, AlertCircle, DollarSign, Users, Clock, CheckCircle2 } from "lucide-react";
import { useAdminPermissions } from "../hooks";
import { useUsersWithCosts, useUpdateInternalCost } from "../hooks";
import { toast } from "sonner";

/**
 * Interface for user cost data with reveal state
 */
interface UserCostData {
	userId: number;
	name: string;
	email: string;
	internalHourlyCost?: number;
	isRevealed: boolean;
	isEditing: boolean;
	editValue: string;
}

/**
 * Loading skeleton for the user list
 */
const UserListSkeleton: React.FC = () => (
	<div className="space-y-4">
		{Array.from({ length: 5 }).map((_, i) => (
			<Card key={i}>
				<CardContent className="p-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-3">
							<Skeleton className="h-10 w-10 rounded-full" />
							<div className="space-y-2">
								<Skeleton className="h-4 w-32" />
								<Skeleton className="h-3 w-48" />
							</div>
						</div>
						<div className="flex items-center space-x-2">
							<Skeleton className="h-8 w-20" />
							<Skeleton className="h-8 w-8" />
						</div>
					</div>
				</CardContent>
			</Card>
		))}
	</div>
);

/**
 * Individual user cost row component
 */
interface UserCostRowProps {
	user: UserCostData;
	onRevealToggle: (userId: number) => void;
	onEditToggle: (userId: number) => void;
	onCostChange: (userId: number, value: string) => void;
	onSave: (userId: number) => void;
	isUpdating: boolean;
}

const UserCostRow: React.FC<UserCostRowProps> = ({ user, onRevealToggle, onEditToggle, onCostChange, onSave, isUpdating }) => {
	const validateCost = (value: string): boolean => {
		const num = parseFloat(value);
		return !isNaN(num) && num > 0 && num <= 9999.99;
	};

	const isValidCost = validateCost(user.editValue);

	return (
		<Card className="transition-all duration-200 hover:shadow-md">
			<CardContent className="p-4">
				<div className="flex items-center justify-between">
					{/* User Info */}
					<div className="flex items-center space-x-3">
						<div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
							<span className="text-sm font-medium text-primary">{user.name.charAt(0).toUpperCase()}</span>
						</div>
						<div>
							<h4 className="font-medium text-sm">{user.name}</h4>
							<p className="text-xs text-muted-foreground">{user.email}</p>
						</div>
					</div>

					{/* Cost Management */}
					<div className="flex items-center space-x-2">
						{/* Cost Display/Edit */}
						{user.isEditing ? (
							<div className="flex items-center space-x-2">
								<div className="relative">
									<DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
									<Input
										type="number"
										value={user.editValue}
										onChange={(e) => onCostChange(user.userId, e.target.value)}
										className={`w-24 pl-8 text-sm ${!isValidCost && user.editValue ? "border-destructive" : ""}`}
										placeholder="0.00"
										min="0.01"
										max="9999.99"
										step="0.01"
									/>
								</div>
								<Button
									size="sm"
									onClick={() => onSave(user.userId)}
									disabled={!isValidCost || isUpdating}
									className="h-8 w-8 p-0"
								>
									{isUpdating ? <Clock className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
								</Button>
								<Button
									size="sm"
									variant="outline"
									onClick={() => onEditToggle(user.userId)}
									disabled={isUpdating}
									className="h-8 px-2 text-xs"
								>
									Cancel
								</Button>
							</div>
						) : (
							<div className="flex items-center space-x-2">
								{/* Cost Display */}
								<Badge
									variant={user.isRevealed ? "default" : "secondary"}
									className="font-mono text-xs"
								>
									{user.isRevealed ? (user.internalHourlyCost ? `$${user.internalHourlyCost.toFixed(2)}` : "$0.00") : "***"}
								</Badge>

								{/* Reveal/Hide Button */}
								<Button
									size="sm"
									variant="ghost"
									onClick={() => onRevealToggle(user.userId)}
									className="h-8 w-8 p-0"
								>
									{user.isRevealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
								</Button>

								{/* Edit Button */}
								{user.isRevealed && (
									<Button
										size="sm"
										variant="outline"
										onClick={() => onEditToggle(user.userId)}
										className="h-8 px-2 text-xs"
									>
										Edit
									</Button>
								)}
							</div>
						)}
					</div>
				</div>

				{/* Validation Error */}
				{user.isEditing && user.editValue && !isValidCost && (
					<div className="mt-2">
						<Alert variant="destructive">
							<AlertCircle className="h-4 w-4" />
							<AlertDescription className="text-xs">Cost must be a positive number between 0.01 and 9999.99</AlertDescription>
						</Alert>
					</div>
				)}
			</CardContent>
		</Card>
	);
};

/**
 * InternalCostManager Component
 * Requirement 16.1: Only accessible to users with manage_internal_costs permission
 * Requirement 16.2: Display user list with editable cost fields
 * Requirement 16.3: Mask cost values by default (show as ***)
 * Requirement 16.4: Reveal actual cost value on click
 * Requirement 16.5: Validate cost input as positive decimal
 * Requirement 16.6: Log all cost changes with timestamp
 */
export const InternalCostManager: React.FC = () => {
	const { canManageInternalCosts } = useAdminPermissions();
	const { data, isLoading, error, refetch } = useUsersWithCosts(canManageInternalCosts);
	const updateInternalCostMutation = useUpdateInternalCost();

	// Local state for user cost management
	const [users, setUsers] = useState<UserCostData[]>([]);
	const [changeLog, setChangeLog] = useState<Array<{ userId: number; userName: string; timestamp: string; oldCost?: number; newCost: number }>>([]);

	// Initialize users state when data loads
	React.useEffect(() => {
		if (data?.users) {
			setUsers(
				data.users.map((user) => ({
					...user,
					isRevealed: false,
					isEditing: false,
					editValue: user.internalHourlyCost?.toString() || "0.00",
				}))
			);
		}
	}, [data]);

	const handleRevealToggle = useCallback((userId: number) => {
		setUsers((prev) => prev.map((user) => (user.userId === userId ? { ...user, isRevealed: !user.isRevealed } : user)));
	}, []);

	const handleEditToggle = useCallback((userId: number) => {
		setUsers((prev) =>
			prev.map((user) => {
				if (user.userId === userId) {
					return {
						...user,
						isEditing: !user.isEditing,
						editValue: user.isEditing ? user.internalHourlyCost?.toString() || "0.00" : user.editValue,
					};
				}
				return user;
			})
		);
	}, []);

	const handleCostChange = useCallback((userId: number, value: string) => {
		setUsers((prev) => prev.map((user) => (user.userId === userId ? { ...user, editValue: value } : user)));
	}, []);

	const handleSave = useCallback(
		async (userId: number) => {
			const user = users.find((u) => u.userId === userId);
			if (!user) return;

			const newCost = parseFloat(user.editValue);
			if (isNaN(newCost) || newCost <= 0 || newCost > 9999.99) {
				toast.error("Invalid cost value. Must be between 0.01 and 9999.99");
				return;
			}

			try {
				await updateInternalCostMutation.mutateAsync({
					userId,
					payload: { internalHourlyCost: newCost },
				});

				setUsers((prev) =>
					prev.map((u) =>
						u.userId === userId
							? {
									...u,
									internalHourlyCost: newCost,
									isEditing: false,
									editValue: newCost.toString(),
							  }
							: u
					)
				);

				const logEntry = {
					userId,
					userName: user.name,
					timestamp: new Date().toISOString(),
					oldCost: user.internalHourlyCost,
					newCost,
				};
				setChangeLog((prev) => [logEntry, ...prev.slice(0, 9)]);

				toast.success(`Internal cost updated for ${user.name}`, {
					description: `New cost: $${newCost.toFixed(2)}`,
				});
			} catch (caughtError) {
				console.error("Failed to update internal cost:", caughtError);
				toast.error("Failed to update internal cost", {
					description: caughtError instanceof Error ? caughtError.message : "Unknown error occurred",
				});
			}
		},
		[users, updateInternalCostMutation]
	);

	const totalUsers = users.length;
	const usersWithCosts = users.filter((u) => u.internalHourlyCost && u.internalHourlyCost > 0).length;
	const averageCost = totalUsers > 0 ? users.reduce((sum, u) => sum + (u.internalHourlyCost || 0), 0) / totalUsers : 0;

	// Permission check
	if (!canManageInternalCosts) {
		return (
			<div className="container mx-auto p-6">
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>You don&apos;t have permission to manage internal costs. This feature requires the &apos;manage_internal_costs&apos; permission.</AlertDescription>
				</Alert>
			</div>
		);
	}

	// Loading state
	if (isLoading) {
		return (
			<div className="container mx-auto p-6 space-y-6">
				<div className="mb-6">
					<h1 className="text-3xl font-bold">Internal Cost Manager</h1>
					<p className="text-muted-foreground">Manage user internal hourly costs securely</p>
				</div>
				<UserListSkeleton />
			</div>
		);
	}

	// Error state
	if (error) {
		return (
			<div className="container mx-auto p-6">
				<div className="mb-6">
					<h1 className="text-3xl font-bold">Internal Cost Manager</h1>
					<p className="text-muted-foreground">Manage user internal hourly costs securely</p>
				</div>
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>Failed to load user data: {error.message}</AlertDescription>
				</Alert>
				<Button
					onClick={() => refetch()}
					className="mt-4"
				>
					Retry
				</Button>
			</div>
		);
	}

	if (!data?.users || users.length === 0) {
		return (
			<div className="container mx-auto p-6">
				<div className="mb-6">
					<h1 className="text-3xl font-bold">Internal Cost Manager</h1>
					<p className="text-muted-foreground">Manage user internal hourly costs securely</p>
				</div>
				<div className="flex items-center justify-center h-[400px] text-muted-foreground">
					<div className="text-center">
						<Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
						<p>No users found</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto p-6 space-y-6">
			{/* Header */}
			<div className="mb-6">
				<h1 className="text-3xl font-bold">Internal Cost Manager</h1>
				<p className="text-muted-foreground">Manage user internal hourly costs securely. All changes are logged for audit purposes.</p>
			</div>

			{/* Statistics Cards */}
			<div className="grid gap-4 md:grid-cols-3">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{totalUsers}</div>
						<p className="text-xs text-muted-foreground">{usersWithCosts} with costs assigned</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">Average Cost</CardTitle>
						<DollarSign className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">${averageCost.toFixed(2)}</div>
						<p className="text-xs text-muted-foreground">Per hour across all users</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">Recent Changes</CardTitle>
						<Clock className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{changeLog.length}</div>
						<p className="text-xs text-muted-foreground">Changes in this session</p>
					</CardContent>
				</Card>
			</div>

			{/* User List */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Users className="h-5 w-5" />
						User Cost Management
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					{users.map((user) => (
						<UserCostRow
							key={user.userId}
							user={user}
							onRevealToggle={handleRevealToggle}
							onEditToggle={handleEditToggle}
							onCostChange={handleCostChange}
							onSave={handleSave}
							isUpdating={updateInternalCostMutation.isPending}
						/>
					))}
				</CardContent>
			</Card>

			{/* Change Log */}
			{changeLog.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Clock className="h-5 w-5" />
							Recent Changes
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							{changeLog.map((change, index) => (
								<div
									key={index}
									className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
								>
									<div className="flex items-center gap-3">
										<CheckCircle2 className="h-4 w-4 text-green-600" />
										<div>
											<p className="text-sm font-medium">{change.userName}</p>
											<p className="text-xs text-muted-foreground">
												{change.oldCost ? `$${change.oldCost.toFixed(2)} → ` : ""}${change.newCost.toFixed(2)}
											</p>
										</div>
									</div>
									<div className="text-xs text-muted-foreground">{new Date(change.timestamp).toLocaleTimeString()}</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
};

export default InternalCostManager;
