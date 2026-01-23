"use client";

import { useState } from "react";
import { FormDialog } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Trash2 } from "lucide-react";
import { UserWithPoints } from "../../../types/userPoints";
import { useUserPointsHistory, useDeletePointTransaction } from "../../../hooks/useUserPoints";
import { formatDateTimeDisplay } from "@/lib/dateUtils";

interface UserPointsHistoryDialogProps {
	open: boolean;
	onClose: () => void;
	user: UserWithPoints | null;
}

export function UserPointsHistoryDialog({ open, onClose, user }: UserPointsHistoryDialogProps) {
	const [currentPage, setCurrentPage] = useState(1);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [transactionToDelete, setTransactionToDelete] = useState<{ id: number; reason: string } | null>(null);

	const { data, isLoading } = useUserPointsHistory(user?.userId || 0, currentPage, 10);
	const deleteTransaction = useDeletePointTransaction();

	const handleDeleteClick = (transactionId: number, reason: string) => {
		setTransactionToDelete({ id: transactionId, reason });
		setDeleteDialogOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (!transactionToDelete) return;

		// Create transaction ID in the format expected by backend
		const formattedId = `up_${transactionToDelete.id}`;

		try {
			await deleteTransaction.mutateAsync(formattedId);
			setDeleteDialogOpen(false);
			setTransactionToDelete(null);
		} catch {
			// Error handling is done in the hook
		}
	};

	const handleCancelDelete = () => {
		setDeleteDialogOpen(false);
		setTransactionToDelete(null);
	};

	if (!user) return null;

	return (
		<>
			<FormDialog
				open={open}
				onOpenChange={(o) => !o && onClose()}
				title={`Points History - ${user.name}`}
				showFooter={false}
				size="xxl"
			>
				<div className="space-y-4">
					{/* Current Points Summary */}
					<div className="p-4 bg-muted rounded-lg">
						<div className="text-sm text-muted-foreground">Current Points</div>
						<div className="text-2xl font-bold">{user.totalPoints} pts</div>
					</div>

					{/* History List */}
					<div className="h-[400px] overflow-y-auto">
						{isLoading ? (
							<div className="flex items-center justify-center py-8">
								<div className="text-sm text-muted-foreground">Loading history...</div>
							</div>
						) : data?.pointsHistory.length === 0 ? (
							<div className="flex items-center justify-center py-8">
								<div className="text-sm text-muted-foreground">No points history found</div>
							</div>
						) : (
							<div className="space-y-3">
								{data?.pointsHistory.map((point) => (
									<div
										key={point.userPointId}
										className="flex items-start gap-3 p-3 border rounded-lg"
									>
										<div className="shrink-0 mt-1">{point.pointsChange > 0 ? <TrendingUp className="h-4 w-4 text-green-600" /> : <TrendingDown className="h-4 w-4 text-red-600" />}</div>

										<div className="flex-1 min-w-0">
											<div className="flex items-center gap-2 mb-1">
												<Badge
													variant={point.pointsChange > 0 ? "default" : "destructive"}
													className="text-xs"
												>
													{point.pointsChange > 0 ? "+" : ""}
													{point.pointsChange} pts
												</Badge>
												<Badge
													variant="outline"
													className="text-xs"
												>
													{point.type}
												</Badge>
											</div>

											<div className="text-sm font-medium mb-1">{point.reason}</div>

											<div className="text-xs text-muted-foreground">
												{point.pointsBefore} → {point.pointsAfter} pts
											</div>

											<div className="text-xs text-muted-foreground mt-1">
												By {point.createdBy} • {formatDateTimeDisplay(point.createdAt)}
											</div>
										</div>

										{/* Delete Button - Only show for manual transactions */}
										{point.type === "manual" && (
											<div className="shrink-0">
												<Button
													variant="ghost"
													size="sm"
													onClick={() => handleDeleteClick(point.userPointId, point.reason)}
													disabled={deleteTransaction.isPending}
													className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</div>
										)}
									</div>
								))}
							</div>
						)}
					</div>

					{/* Pagination */}
					{data && data.pagination.totalPages > 1 && (
						<div className="flex items-center justify-between">
							<div className="text-sm text-muted-foreground">
								Page {data.pagination.currentPage} of {data.pagination.totalPages}
							</div>
							<div className="flex gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => setCurrentPage(currentPage - 1)}
									disabled={currentPage === 1}
								>
									<ChevronLeft className="h-4 w-4" />
								</Button>
								<Button
									variant="outline"
									size="sm"
									onClick={() => setCurrentPage(currentPage + 1)}
									disabled={currentPage === data.pagination.totalPages}
								>
									<ChevronRight className="h-4 w-4" />
								</Button>
							</div>
						</div>
					)}
				</div>
			</FormDialog>

			{/* Delete Confirmation Dialog */}
			<AlertDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Point Transaction</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete this point transaction?
							<br />
							<span className="font-medium text-foreground mt-2 block">&quot;{transactionToDelete?.reason}&quot;</span>
							<br />
							This action cannot be undone and will recalculate the user&apos;s total points.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={handleCancelDelete}>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleConfirmDelete}
							disabled={deleteTransaction.isPending}
							className="bg-red-600 hover:bg-red-700"
						>
							{deleteTransaction.isPending ? "Deleting..." : "Delete"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
