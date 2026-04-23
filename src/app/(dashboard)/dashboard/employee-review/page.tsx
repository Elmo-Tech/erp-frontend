/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { EmployeeReviewPage } from "@/_old/features/monitoring";
import api from "@/shared/api/base";
import { Loader2 } from "lucide-react";

interface User {
	id: number;
	name: string;
}

export default function EmployeeReviewPageRoute() {
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchUsers = async () => {
			try {
				const response = await api.get("/admin/users");
				const usersData = response.data.data.users || [];
				setUsers(
					usersData.map((user: any) => ({
						id: user.userId,
						name: user.name,
					}))
				);
			} catch (error) {
				console.error("Failed to fetch users:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchUsers();
	}, []);

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	return <EmployeeReviewPage users={users} />;
}
