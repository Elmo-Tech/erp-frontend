/**
 * Wiki Card Component
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Edit, Trash2, Lock, Calendar } from "lucide-react";
import { ProjectWiki } from "../../types/projectWiki";

interface WikiCardProps {
	wiki: ProjectWiki;
	isSelected: boolean;
	onSelect: () => void;
	onEdit: () => void;
	onDelete: () => void;
}

export function WikiCard({ wiki, isSelected, onSelect, onEdit, onDelete }: WikiCardProps) {
	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	return (
		<Card
			className={`cursor-pointer transition-colors hover:bg-muted/50 ${isSelected ? "ring-2 ring-primary" : ""}`}
			onClick={onSelect}
		>
			<CardHeader className="pb-3">
				<div className="flex items-start justify-between">
					<div className="space-y-1">
						<CardTitle className="text-base flex items-center gap-2">
							{wiki.title}
							{wiki.isEncrypted && (
								<Badge
									variant="secondary"
									className="text-xs"
								>
									<Lock className="h-3 w-3 mr-1" />
									Encrypted
								</Badge>
							)}
						</CardTitle>
						<div className="flex items-center gap-2 text-xs text-muted-foreground">
							<Calendar className="h-3 w-3" />
							<span>Updated {formatDate(wiki.updatedAt)}</span>
						</div>
					</div>

					<div className="flex items-center gap-1">
						<Button
							variant="ghost"
							size="sm"
							onClick={(e) => {
								e.stopPropagation();
								onEdit();
							}}
						>
							<Edit className="h-4 w-4" />
						</Button>

						<AlertDialog>
							<AlertDialogTrigger asChild>
								<Button
									variant="ghost"
									size="sm"
									onClick={(e) => e.stopPropagation()}
								>
									<Trash2 className="h-4 w-4" />
								</Button>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>Delete Wiki Entry</AlertDialogTitle>
									<AlertDialogDescription>
										Are you sure you want to delete &quot;{wiki.title}&quot;? This action cannot be undone.
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel>Cancel</AlertDialogCancel>
									<AlertDialogAction
										onClick={onDelete}
										className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
									>
										Delete
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					</div>
				</div>
			</CardHeader>

			<CardContent className="pt-0">
				<p className="text-sm text-muted-foreground line-clamp-2">{wiki.content.substring(0, 100)}...</p>
			</CardContent>
		</Card>
	);
}
