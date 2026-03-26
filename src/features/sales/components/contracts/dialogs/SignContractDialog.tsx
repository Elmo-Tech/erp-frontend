"use client";

import { useRef, useState } from "react";
import { FormDialog } from "@/components/shared";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FileText, Upload, X } from "lucide-react";

interface SignContractDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSign: (signedByClient: string, signedPdf?: File) => Promise<void>;
	isLoading: boolean;
	prefilledName?: string;
}

export function SignContractDialog({ open, onOpenChange, onSign, isLoading, prefilledName = "" }: SignContractDialogProps) {
	const [signedByClient, setSignedByClient] = useState(prefilledName);
	const [signedPdf, setSignedPdf] = useState<File | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			// Validate PDF
			if (file.type !== "application/pdf") {
				alert("Please upload a PDF file");
				return;
			}
			setSignedPdf(file);
		}
	};

	const handleRemoveFile = () => {
		setSignedPdf(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const handleSign = async () => {
		await onSign(signedByClient, signedPdf || undefined);
		// Reset form
		setSignedByClient(prefilledName);
		setSignedPdf(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const handleOpenChange = (isOpen: boolean) => {
		if (!isOpen) {
			setSignedByClient(prefilledName);
			setSignedPdf(null);
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
		}
		onOpenChange(isOpen);
	};

	return (
		<FormDialog
			open={open}
			onOpenChange={handleOpenChange}
			title="توقيع العقد"
			description="أدخل اسم ممثل العميل وقم برفع PDF الموقع إن وجد"
			submitLabel="توقيع العقد"
			isLoading={isLoading}
			isSubmitDisabled={!signedByClient.trim()}
			onSubmit={handleSign}
		>
			<div className="space-y-4">
				{/* Client Representative Name */}
				<div className="space-y-2">
					<Label htmlFor="signedBy">اسم ممثل العميل</Label>
					<Input
						id="signedBy"
						value={signedByClient}
						onChange={(e) => setSignedByClient(e.target.value)}
						placeholder="أدخل الاسم الكامل"
						dir="rtl"
					/>
				</div>

				{/* PDF File Upload */}
				<div className="space-y-2">
					<Label>ملف العقد الموقع (PDF)</Label>
					{signedPdf ? (
						<div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
							<div className="flex items-center gap-2 min-w-0">
								<FileText className="h-5 w-5 text-red-500 flex-shrink-0" />
								<span className="text-sm truncate">{signedPdf.name}</span>
							</div>
							<Button
								type="button"
								variant="ghost"
								size="icon"
								onClick={handleRemoveFile}
								className="flex-shrink-0"
							>
								<X className="h-4 w-4" />
							</Button>
						</div>
					) : (
						<div
							className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
							onClick={() => fileInputRef.current?.click()}
						>
							<input
								ref={fileInputRef}
								type="file"
								accept="application/pdf"
								onChange={handleFileChange}
								className="hidden"
							/>
							<Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
							<p className="text-sm text-muted-foreground">انقر لرفع ملف PDF</p>
							<p className="text-xs text-muted-foreground mt-1">ملف واحد بحد أقصى</p>
						</div>
					)}
				</div>
			</div>
		</FormDialog>
	);
}

export default SignContractDialog;
