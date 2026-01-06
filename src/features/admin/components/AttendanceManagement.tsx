"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Clock, Edit, Plus, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useAttendanceList } from "../hooks/useAttendance";
import { usePermissions } from "../hooks/usePermissions";
import { AttendanceFilters, Attendance } from "../types/attendance";
import { AttendanceFormDialog } from "./AttendanceFormDialog";
import { useUsers } from "../hooks/useUsers";

function formatTime(dateString: string | null): string {
	if (!dateString) return "-";
	return format(new Date(dateString), "hh:mm a", { locale: ar });
}

function formatMinutes(minutes: number): string {
	if (minutes === 0) return "-";
	const hours = Math.floor(minutes / 60);
	const mins = minutes % 60;
	if (hours > 0) return `${hours}س ${mins}د`;
	return `${mins}د`;
}

export function AttendanceManagement() {
	const [filters, setFilters] = useState<AttendanceFilters>({});
	const [page, setPage] = useState(1);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editingAttendance, setEditingAttendance] = useState<Attendance | null>(null);

	const { data, isLoading } = useAttendanceList(filters, page);
	const { data: usersData } = useUsers();
	const { canManageAttendance, canViewAllAttendance } = usePermissions();

	const handleFilterChange = (key: keyof AttendanceFilters, value: string) => {
		setFilters((prev) => ({
			...prev,
			[key]: value || undefined,
		}));
		setPage(1);
	};

	const handleEdit = (attendance: Attendance) => {
		setEditingAttendance(attendance);
		setDialogOpen(true);
	};

	const handleAdd = () => {
		setEditingAttendance(null);
		setDialogOpen(true);
	};

	const handleDialogClose = () => {
		setDialogOpen(false);
		setEditingAttendance(null);
	};

	if (!canViewAllAttendance) {
		return (
			<Card>
				<CardContent className="py-8 text-center text-muted-foreground">ليس لديك صلاحية لعرض سجلات الحضور</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between">
				<CardTitle className="flex items-center gap-2">
					<Clock className="h-5 w-5" />
					إدارة الحضور والانصراف
				</CardTitle>
				{canManageAttendance && (
					<Button
						onClick={handleAdd}
						size="sm"
					>
						<Plus className="h-4 w-4 ml-2" />
						إضافة سجل
					</Button>
				)}
			</CardHeader>
			<CardContent>
				{/* Filters */}
				<div className="flex flex-wrap gap-4 mb-6">
					<div className="flex-1 min-w-[200px]">
						<Select
							value={filters.userId?.toString() || "all"}
							onValueChange={(v) => handleFilterChange("userId", v === "all" ? "" : v)}
						>
							<SelectTrigger>
								<User className="h-4 w-4 ml-2" />
								<SelectValue placeholder="اختر موظف" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">جميع الموظفين</SelectItem>
								{usersData?.users?.map((user) => (
									<SelectItem
										key={user.userId}
										value={user.userId.toString()}
									>
										{user.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="flex-1 min-w-[150px]">
						<Input
							type="date"
							value={filters.startDate || ""}
							onChange={(e) => handleFilterChange("startDate", e.target.value)}
							placeholder="من تاريخ"
						/>
					</div>
					<div className="flex-1 min-w-[150px]">
						<Input
							type="date"
							value={filters.endDate || ""}
							onChange={(e) => handleFilterChange("endDate", e.target.value)}
							placeholder="إلى تاريخ"
						/>
					</div>
				</div>

				{/* Table */}
				<div className="rounded-md border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>الموظف</TableHead>
								<TableHead>التاريخ</TableHead>
								<TableHead>وقت الدخول</TableHead>
								<TableHead>وقت الخروج</TableHead>
								<TableHead>التأخير</TableHead>
								<TableHead>وقت العمل</TableHead>
								<TableHead>الخصم</TableHead>
								<TableHead>الحالة</TableHead>
								{canManageAttendance && <TableHead className="w-[80px]">إجراءات</TableHead>}
							</TableRow>
						</TableHeader>
						<TableBody>
							{isLoading ? (
								Array.from({ length: 5 }).map((_, i) => (
									<TableRow key={i}>
										{Array.from({ length: canManageAttendance ? 9 : 8 }).map((_, j) => (
											<TableCell key={j}>
												<Skeleton className="h-4 w-full" />
											</TableCell>
										))}
									</TableRow>
								))
							) : data?.attendances?.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={canManageAttendance ? 9 : 8}
										className="text-center py-8 text-muted-foreground"
									>
										لا توجد سجلات حضور
									</TableCell>
								</TableRow>
							) : (
								data?.attendances?.map((attendance) => (
									<TableRow key={attendance.attendanceId}>
										<TableCell>
											<div className="flex items-center gap-2">
												<Avatar className="h-8 w-8">
													<AvatarImage src={attendance.user?.avatar} />
													<AvatarFallback>{attendance.user?.name?.charAt(0) || "?"}</AvatarFallback>
												</Avatar>
												<span className="font-medium">{attendance.user?.name}</span>
											</div>
										</TableCell>
										<TableCell>{format(new Date(attendance.date), "yyyy/MM/dd")}</TableCell>
										<TableCell>{formatTime(attendance.clockIn)}</TableCell>
										<TableCell>{formatTime(attendance.clockOut)}</TableCell>
										<TableCell>{attendance.lateMinutes > 0 ? <Badge variant="destructive">{formatMinutes(attendance.lateMinutes)}</Badge> : <Badge variant="secondary">في الوقت</Badge>}</TableCell>
										<TableCell>{formatMinutes(attendance.workedMinutes)}</TableCell>
										<TableCell>
											{attendance.deductionMinutes > 0 ? <Badge variant="destructive">{formatMinutes(attendance.deductionMinutes)}</Badge> : attendance.usedGraceDay ? <Badge variant="outline">يوم سماح</Badge> : "-"}
										</TableCell>
										<TableCell>{attendance.isClockedIn ? <Badge className="bg-green-500">متواجد</Badge> : <Badge variant="secondary">انصرف</Badge>}</TableCell>
										{canManageAttendance && (
											<TableCell>
												<Button
													variant="ghost"
													size="icon"
													onClick={() => handleEdit(attendance)}
												>
													<Edit className="h-4 w-4" />
												</Button>
											</TableCell>
										)}
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</div>

				{/* Pagination */}
				{data?.pagination && data.pagination.totalPages > 1 && (
					<div className="flex items-center justify-between mt-4">
						<p className="text-sm text-muted-foreground">
							عرض {data.pagination.count} من {data.pagination.total} سجل
						</p>
						<div className="flex gap-2">
							<Button
								variant="outline"
								size="sm"
								disabled={page === 1}
								onClick={() => setPage((p) => p - 1)}
							>
								السابق
							</Button>
							<Button
								variant="outline"
								size="sm"
								disabled={page >= data.pagination.totalPages}
								onClick={() => setPage((p) => p + 1)}
							>
								التالي
							</Button>
						</div>
					</div>
				)}
			</CardContent>

			{canManageAttendance && (
				<AttendanceFormDialog
					open={dialogOpen}
					onClose={handleDialogClose}
					attendance={editingAttendance}
				/>
			)}
		</Card>
	);
}
