"use client";

import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Skeleton } from "@/shared/ui/skeleton";
import { AlertCircle, Eye, EyeOff, Lock, Unlock, Clock } from "lucide-react";
import { ProjectWiki } from "../types/projectWiki";

interface WikiViewerProps {
	wiki: ProjectWiki;
	onEdit?: (wiki: ProjectWiki) => void;
	onDelete?: (wiki: ProjectWiki) => void;
	className?: string;
}

/**
 * WikiViewer component for displaying wiki content with secure credential reveal
 * Requirements: 12.1, 12.2, 12.3, 12.4, 12.5
 */
export const WikiViewer: React.FC<WikiViewerProps> = ({ wiki, onEdit, onDelete, className = "" }) => {
	const [isRevealed, setIsRevealed] = useState(false);
	const [remainingTime, setRemainingTime] = useState(0);
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

	const clearRevealTimers = () => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
		}

		if (intervalRef.current) {
			clearInterval(intervalRef.current);
			intervalRef.current = null;
		}
	};

	// Auto-hide decrypted content after 30 seconds
	useEffect(() => {
		if (!isRevealed || !wiki.isEncrypted) {
			return undefined;
		}

		clearRevealTimers();

		intervalRef.current = setInterval(() => {
			setRemainingTime((prev) => {
				if (prev <= 1) {
					clearRevealTimers();
					setIsRevealed(false);
					return 0;
				}
				return prev - 1;
			});
		}, 1000);

		timeoutRef.current = setTimeout(() => {
			clearRevealTimers();
			setIsRevealed(false);
			setRemainingTime(0);
		}, 30000);

		return () => {
			clearRevealTimers();
		};
	}, [isRevealed, wiki.isEncrypted]);

	useEffect(() => {
		return () => {
			clearRevealTimers();
		};
	}, []);

	// Handle reveal/hide toggle
	const handleToggleReveal = () => {
		if (isRevealed) {
			// Hide content immediately
			clearRevealTimers();
			setIsRevealed(false);
			setRemainingTime(0);
		} else {
			// Reveal content
			setRemainingTime(30);
			setIsRevealed(true);
		}
	};

	// Format date
	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	// Determine if content should be shown
	const shouldShowContent = !wiki.isEncrypted || isRevealed;

	return (
		<Card className={className}>
			<CardHeader>
				<div className="flex items-start justify-between">
					<div className="space-y-2">
						<CardTitle className="flex items-center gap-2">
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
						<div className="flex items-center gap-4 text-sm text-muted-foreground">
							<span>Updated {formatDate(wiki.updatedAt)}</span>
							{wiki.isEncrypted && isRevealed && remainingTime > 0 && (
								<div className="flex items-center gap-1 text-amber-600">
									<Clock className="h-3 w-3" />
									<span>Auto-hide in {remainingTime}s</span>
								</div>
							)}
						</div>
					</div>

					<div className="flex items-center gap-2">
						{wiki.isEncrypted && (
							<Button
								variant={isRevealed ? "destructive" : "secondary"}
								size="sm"
								onClick={handleToggleReveal}
							>
								{isRevealed ? (
									<>
										<EyeOff className="h-4 w-4 mr-2" />
										Hide Secret
									</>
								) : (
									<>
										<Eye className="h-4 w-4 mr-2" />
										Reveal Secret
									</>
								)}
							</Button>
						)}

						{onEdit && (
							<Button
								variant="outline"
								size="sm"
								onClick={() => onEdit(wiki)}
							>
								Edit
							</Button>
						)}

						{onDelete && (
							<Button
								variant="destructive"
								size="sm"
								onClick={() => onDelete(wiki)}
							>
								Delete
							</Button>
						)}
					</div>
				</div>
			</CardHeader>

			<CardContent>
				{shouldShowContent ? (
					<div className="prose prose-sm max-w-none dark:prose-invert">
						<ReactMarkdown
							components={{
								// Custom styling for markdown elements
								h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 text-foreground">{children}</h1>,
								h2: ({ children }) => <h2 className="text-xl font-semibold mb-3 text-foreground">{children}</h2>,
								h3: ({ children }) => <h3 className="text-lg font-medium mb-2 text-foreground">{children}</h3>,
								p: ({ children }) => <p className="mb-3 text-foreground leading-relaxed">{children}</p>,
								ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
								ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>,
								li: ({ children }) => <li className="text-foreground">{children}</li>,
								code: ({ children, className }) => {
									const isInline = !className;
									if (isInline) {
										return <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>;
									}
									return <code className="block bg-muted p-4 rounded-lg text-sm font-mono overflow-x-auto">{children}</code>;
								},
								pre: ({ children }) => <pre className="bg-muted p-4 rounded-lg overflow-x-auto mb-3">{children}</pre>,
								blockquote: ({ children }) => <blockquote className="border-l-4 border-muted-foreground pl-4 italic mb-3">{children}</blockquote>,
								a: ({ children, href }) => (
									<a
										href={href}
										className="text-primary hover:underline"
										target="_blank"
										rel="noopener noreferrer"
									>
										{children}
									</a>
								),
								table: ({ children }) => (
									<div className="overflow-x-auto mb-3">
										<table className="min-w-full border border-border">{children}</table>
									</div>
								),
								th: ({ children }) => <th className="border border-border px-3 py-2 bg-muted font-medium text-left">{children}</th>,
								td: ({ children }) => <td className="border border-border px-3 py-2">{children}</td>,
							}}
						>
							{wiki.content}
						</ReactMarkdown>
					</div>
				) : (
					<div className="flex items-center justify-center h-32 border-2 border-dashed border-muted rounded-lg">
						<div className="text-center space-y-2">
							<Lock className="h-8 w-8 text-muted-foreground mx-auto" />
							<p className="text-sm text-muted-foreground">This content is encrypted</p>
							<Button
								variant="outline"
								size="sm"
								onClick={handleToggleReveal}
							>
								<Unlock className="h-4 w-4 mr-2" />
								Reveal Content
							</Button>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
};
