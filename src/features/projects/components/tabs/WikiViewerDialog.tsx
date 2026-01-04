"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProjectWiki } from "../../types/projectWiki";
import { Lock, Eye, EyeOff, Pencil, Copy, Check } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface WikiViewerDialogProps {
	wiki: ProjectWiki | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onEdit?: () => void;
}

export function WikiViewerDialog({ wiki, open, onOpenChange, onEdit }: WikiViewerDialogProps) {
	const [showContent, setShowContent] = useState(false);
	const [copied, setCopied] = useState(false);

	if (!wiki) return null;

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(wiki.content);
			setCopied(true);
			toast.success("Content copied to clipboard");
			setTimeout(() => setCopied(false), 2000);
		} catch {
			toast.error("Failed to copy content");
		}
	};

	const displayContent = wiki.isEncrypted && !showContent ? "••••••••••••••••••••••••••••••••\n••••••••••••••••••••••••••••••••\n••••••••••••••••••••••••••••••••" : wiki.content;

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}
		>
			<DialogContent className="max-w-2xl max-h-[80vh]">
				<DialogHeader>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<DialogTitle>{wiki.title}</DialogTitle>
							{wiki.isEncrypted && (
								<Badge
									variant="outline"
									className="gap-1"
								>
									<Lock className="h-3 w-3" />
									Encrypted
								</Badge>
							)}
						</div>
					</div>
					<DialogDescription>Last updated: {format(new Date(wiki.updatedAt), "MMM d, yyyy HH:mm")}</DialogDescription>
				</DialogHeader>

				<ScrollArea className="max-h-[50vh]">
					<div className="relative">
						<pre className="p-4 bg-muted rounded-lg text-sm whitespace-pre-wrap font-mono">{displayContent}</pre>
					</div>
				</ScrollArea>

				<div className="flex items-center justify-between pt-4 border-t">
					<div className="flex gap-2">
						{wiki.isEncrypted && (
							<Button
								variant="outline"
								size="sm"
								onClick={() => setShowContent(!showContent)}
							>
								{showContent ? (
									<>
										<EyeOff className="h-4 w-4 mr-2" />
										Hide Content
									</>
								) : (
									<>
										<Eye className="h-4 w-4 mr-2" />
										Reveal Content
									</>
								)}
							</Button>
						)}
						<Button
							variant="outline"
							size="sm"
							onClick={handleCopy}
							disabled={wiki.isEncrypted && !showContent}
						>
							{copied ? (
								<>
									<Check className="h-4 w-4 mr-2" />
									Copied
								</>
							) : (
								<>
									<Copy className="h-4 w-4 mr-2" />
									Copy
								</>
							)}
						</Button>
					</div>
					{onEdit && (
						<Button onClick={onEdit}>
							<Pencil className="h-4 w-4 mr-2" />
							Edit
						</Button>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
