"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, UserPlus, Shield, Activity, Clock, Award, TrendingUp, UserCheck, UserX } from "lucide-react";
import { UsersTable, CreateUserForm, UpdateUserForm } from "./users";
import { RolesMatrix } from "./RolesMatrix";
import { UserPerformanceList } from "./UserPerformanceList";
import { useUsers } from "../hooks/useUsers";
import { useRoles } from "../hooks/useRoles";
import { User } from "../types";
import { formatNumber } from "@/lib/formatters";
import { usePermissions } from "../hooks/usePermissions";

export function UsersDashboard() {
	const [activeTab, setActiveTab] = useState("overview");
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
	const [selectedUser, setSelectedUser] = useState<User | null>(null);

	const { data: usersData } = useUsers();
	const { data: rolesData } = useRoles();
	const { canCreateUsers, canEditUsers, canManageRoles } = usePermissions();

	// Calculate statistics
	const users = usersData?.users || [];
	const roles = rolesData?.roles || [];

	const totalUsers = users.length;
	const activeUsers = users.filter((u) => u.isActive).length;
	const inactiveUsers = totalUsers - activeUsers;
	const adminUsers = users.filter((u) => u.roles?.some((r) => r === "admin")).length;
	const employeeUsers = users.filter((u) => u.roles?.some((r) => r === "employee")).length;
	const clientUsers = users.filter((u) => u.roles?.some((r) => r === "client")).length;

	const handleAdd = () => {
		setCreateDialogOpen(true);
	};

	const handleEdit = (user: User) => {
		setSelectedUser(user);
		setUpdateDialogOpen(true);
	};

	const handleUpdateClose = () => {
		setUpdateDialogOpen(false);
		setSelectedUser(null);
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">Users Management</h1>
					<p className="text-muted-foreground">Manage system users, roles, and permissions</p>
				</div>
				{canCreateUsers && (
					<Button onClick={handleAdd}>
						<UserPlus className="mr-2 h-4 w-4" />
						Add User
					</Button>
				)}
			</div>

			<Tabs
				value={activeTab}
				onValueChange={setActiveTab}
			>
				<TabsList className="grid w-full grid-cols-4">
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<TabsTrigger value="users">Users</TabsTrigger>
					{canManageRoles && <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>}
					<TabsTrigger value="performance">Performance</TabsTrigger>
				</TabsList>

				{/* Overview Tab */}
				<TabsContent
					value="overview"
					className="space-y-6"
				>
					{/* Key Metrics */}
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Total Users</CardTitle>
								<Users className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{formatNumber(totalUsers)}</div>
								<p className="text-xs text-muted-foreground">
									<span className="text-green-600">{activeUsers} active</span>
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Active Users</CardTitle>
								<UserCheck className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold text-green-600">{formatNumber(activeUsers)}</div>
								<p className="text-xs text-muted-foreground">{totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(1) : 0}% of total</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Inactive Users</CardTitle>
								<UserX className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold text-red-600">{formatNumber(inactiveUsers)}</div>
								<p className="text-xs text-muted-foreground">Need attention</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Total Roles</CardTitle>
								<Shield className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{formatNumber(roles.length)}</div>
								<p className="text-xs text-muted-foreground">Permission groups</p>
							</CardContent>
						</Card>
					</div>

					{/* User Distribution by Role */}
					<Card>
						<CardHeader>
							<CardTitle>User Distribution by Role</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid gap-4 md:grid-cols-3">
								<div className="text-center p-4 border rounded-lg">
									<div className="text-3xl font-bold text-blue-600">{adminUsers}</div>
									<Badge className="bg-blue-100 text-blue-800">Administrators</Badge>
									<p className="text-xs text-muted-foreground mt-1">Full system access</p>
								</div>
								<div className="text-center p-4 border rounded-lg">
									<div className="text-3xl font-bold text-green-600">{employeeUsers}</div>
									<Badge className="bg-green-100 text-green-800">Employees</Badge>
									<p className="text-xs text-muted-foreground mt-1">Internal team members</p>
								</div>
								<div className="text-center p-4 border rounded-lg">
									<div className="text-3xl font-bold text-purple-600">{clientUsers}</div>
									<Badge className="bg-purple-100 text-purple-800">Clients</Badge>
									<p className="text-xs text-muted-foreground mt-1">External clients</p>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Recent Users */}
					<Card>
						<CardHeader>
							<CardTitle>Recent Users</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{users.slice(0, 5).map((user) => (
									<div
										key={user.userId}
										className="flex items-center gap-4 p-3 border rounded-lg"
									>
										<div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
											<Users className="h-5 w-5 text-gray-600" />
										</div>
										<div className="flex-1">
											<div className="font-medium">{user.name}</div>
											<div className="text-sm text-muted-foreground">{user.email}</div>
										</div>
										<div className="flex items-center gap-2">
											<Badge variant={user.isActive ? "default" : "secondary"}>{user.isActive ? "Active" : "Inactive"}</Badge>
											{user.roles?.map((role) => (
												<Badge
													key={role}
													variant="outline"
												>
													{role}
												</Badge>
											))}
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Users Tab */}
				<TabsContent
					value="users"
					className="space-y-6"
				>
					<div>
						<h2 className="text-2xl font-bold">All Users</h2>
						<p className="text-muted-foreground">Manage user accounts and their details</p>
					</div>

					<Card>
						<CardContent className="pt-6">
							<UsersTable
								onAdd={canCreateUsers ? handleAdd : undefined}
								onEdit={canEditUsers ? handleEdit : undefined}
							/>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Roles Tab */}
				{canManageRoles && (
					<TabsContent
						value="roles"
						className="space-y-6"
					>
						<div>
							<h2 className="text-2xl font-bold">Roles & Permissions</h2>
							<p className="text-muted-foreground">Configure user roles and their permissions</p>
						</div>
						<RolesMatrix />
					</TabsContent>
				)}

				{/* Performance Tab */}
				<TabsContent
					value="performance"
					className="space-y-6"
				>
					<div>
						<h2 className="text-2xl font-bold">User Performance</h2>
						<p className="text-muted-foreground">Track user activity and performance metrics</p>
					</div>

					<div className="grid gap-4 md:grid-cols-4">
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Avg Login Frequency</CardTitle>
								<Activity className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">4.2</div>
								<p className="text-xs text-muted-foreground">times per week</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Avg Session Time</CardTitle>
								<Clock className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">2.5h</div>
								<p className="text-xs text-muted-foreground">per session</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Top Performer</CardTitle>
								<Award className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">95%</div>
								<p className="text-xs text-muted-foreground">productivity score</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
								<TrendingUp className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold text-green-600">+12%</div>
								<p className="text-xs text-muted-foreground">this month</p>
							</CardContent>
						</Card>
					</div>

					<UserPerformanceList />
				</TabsContent>
			</Tabs>

			{/* Dialogs */}
			{canCreateUsers && (
				<CreateUserForm
					open={createDialogOpen}
					onOpenChange={setCreateDialogOpen}
				/>
			)}

			{canEditUsers && selectedUser && (
				<UpdateUserForm
					open={updateDialogOpen}
					onOpenChange={handleUpdateClose}
					user={selectedUser}
				/>
			)}
		</div>
	);
}
