import Link from "next/link";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Next.js 13+ Not Found Page
 *
 * This page is shown when a route doesn't exist.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/not-found
 */
export default function NotFound() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
			<Card className="w-full max-w-md">
				<CardHeader>
					<div className="flex items-center gap-2">
						<FileQuestion className="h-6 w-6 text-muted-foreground" />
						<CardTitle>Page Not Found</CardTitle>
					</div>
					<CardDescription>The page you&apos;re looking for doesn&apos;t exist or has been moved.</CardDescription>
				</CardHeader>

				<CardContent>
					<div className="rounded-lg bg-muted p-4">
						<p className="text-sm text-muted-foreground">This could happen if:</p>
						<ul className="mt-2 list-inside list-disc space-y-1 text-sm text-muted-foreground">
							<li>The URL was typed incorrectly</li>
							<li>The page has been removed or renamed</li>
							<li>You don&apos;t have permission to access this page</li>
						</ul>
					</div>
				</CardContent>

				<CardFooter className="flex gap-2">
					<Button
						asChild
						variant="default"
						className="flex-1"
					>
						<Link href="/dashboard">
							<Home className="mr-2 h-4 w-4" />
							Go to Dashboard
						</Link>
					</Button>
					<Button
						asChild
						variant="outline"
						className="flex-1"
					>
						<Link href="javascript:history.back()">
							<ArrowLeft className="mr-2 h-4 w-4" />
							Go Back
						</Link>
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}
