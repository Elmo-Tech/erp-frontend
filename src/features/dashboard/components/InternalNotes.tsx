/**
 * InternalNotes Component
 * Conditionally renders internal reviewer notes with edit capability
 *
 * Requirements: 10.4, 10.5, 11.1, 11.2, 11.3, 11.4
 */

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit3, Save, X, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface InternalNotesProps {
	notes?: string;
	onUpdate: (notes: string) => void;
	isUpdating?: boolean;
	className?: string;
}

/**
 * InternalNotes component for displaying and editing internal reviewer notes
 * Requirements:
 * - 10.4: Conditionally render based on internalReviewerNotes presence in API response
 * - 10.5: Provide edit capability
 * - 11.1, 11.2, 11.3, 11.4: Permission-based visibility and editing
 */
export const InternalNotes: React.FC<InternalNotesProps> = ({ notes = "", onUpdate, isUpdating = false, className }) => {
	const [isEditing, setIsEditing] = useState(false);
	const [editValue, setEditValue] = useState(notes);

	// Handle save
	const handleSave = () => {
		onUpdate(editValue);
		setIsEditing(false);
	};

	// Handle cancel
	const handleCancel = () => {
		setEditValue(notes);
		setIsEditing(false);
	};

	// Handle edit mode
	const handleEdit = () => {
		setEditValue(notes);
		setIsEditing(true);
	};

	return (
		<Card className={cn("border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20", className)}>
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between">
					<CardTitle className="text-sm font-medium flex items-center gap-2">
						<Lock className="h-4 w-4 text-amber-600" />
						Internal Reviewer Notes
					</CardTitle>
					{!isEditing && (
						<Button
							variant="ghost"
							size="sm"
							onClick={handleEdit}
							disabled={isUpdating}
							className="h-8 px-2"
						>
							<Edit3 className="h-3 w-3" />
						</Button>
					)}
				</div>
			</CardHeader>
			<CardContent className="pt-0">
				{isEditing ? (
					<div className="space-y-3">
						<Textarea
							value={editValue}
							onChange={(e) => setEditValue(e.target.value)}
							placeholder="Add internal notes for reviewers..."
							className="min-h-24 resize-none"
							disabled={isUpdating}
						/>
						<div className="flex items-center gap-2">
							<Button
								size="sm"
								onClick={handleSave}
								disabled={isUpdating}
								className="h-8"
							>
								{isUpdating ? (
									<>
										<div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent mr-1" />
										Saving...
									</>
								) : (
									<>
										<Save className="h-3 w-3 mr-1" />
										Save
									</>
								)}
							</Button>
							<Button
								variant="ghost"
								size="sm"
								onClick={handleCancel}
								disabled={isUpdating}
								className="h-8"
							>
								<X className="h-3 w-3 mr-1" />
								Cancel
							</Button>
						</div>
					</div>
				) : (
					<div className="space-y-2">
						{notes ? (
							<p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{notes}</p>
						) : (
							<p className="text-sm text-muted-foreground italic">No internal notes added yet. Click edit to add notes for reviewers.</p>
						)}
					</div>
				)}
			</CardContent>
		</Card>
	);
};

export default InternalNotes;
