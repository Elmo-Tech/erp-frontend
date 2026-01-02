"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useCreateUser, useUpdateUser } from "../hooks/useUsers";
import { useRoles } from "../hooks/useRoles";
import { User } from "../types";
import { createUserSchema, updateUserSchema, CreateUserFormData, UpdateUserFormData } from "../schemas/userSchema";
import { toast } from "sonner";
import { X } from "lucide-react";

interface UserFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	user?: User | null;
}

export function UserFormDialog({ open, onOpenChange, user }: UserFormDialogProps) {
	const isEditing = !!user;
	const createUser = useCreateUser();
	const updateUser = useUpdateUser();
	const { data: rolesData } = useRoles();

	const form = useForm<CreateUserFormData | UpdateUserFormData>({
		resolver: zodResolver(isEditing ? updateUserSchema : createUserSchema),
		defaultValues: {
			name: "",
			email: "",
			password: "",
			password_confirmation: "",
			skills: [],
			roles: [],
			isActive: true,
		},
	});

	useEffect(() => {
		if (user) {
			form.reset({
				name: user.name,
				email: user.email,
				password: "",
				password_confirmation: "",
				skills: user.skills,
				roles: user.roles,
				isActive: user.isActive,
			});
		} else {
			form.reset({
				name: "",
				email: "",
				password: "",
				password_confirmation: "",
				skills: [],
				roles: [],
				isActive: true,
			});
		}
	}, [user, form]);

	const onSubmit = async (data: CreateUserFormData | UpdateUserFormData) => {
		try {
			if (isEditing && user) {
				// Remove empty password fields for update
				const updateData = { ...data };
				if (!updateData.password) {
					delete updateData.password;
					delete updateData.password_confirmation;
				}
				await updateUser.mutateAsync({ id: user.userId, payload: updateData });
				toast.success("User updated successfully");
			} else {
				await createUser.mutateAsync(data as CreateUserFormData);
				toast.success("User created successfully");
			}
			onOpenChange(false);
		} catch {
			toast.error(isEditing ? "Failed to update user" : "Failed to create user");
		}
	};

	const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			e.preventDefault();
			const input = e.currentTarget;
			const skill = input.value.trim();
			if (skill) {
				const currentSkills = form.getValues("skills") || [];
				if (!currentSkills.includes(skill)) {
					form.setValue("skills", [...currentSkills, skill]);
				}
				input.value = "";
			}
		}
	};

	const handleRemoveSkill = (skillToRemove: string) => {
		const currentSkills = form.getValues("skills") || [];
		form.setValue(
			"skills",
			currentSkills.filter((s) => s !== skillToRemove)
		);
	};

	const handleRoleToggle = (roleName: string, checked: boolean) => {
		const currentRoles = form.getValues("roles") || [];
		if (checked) {
			form.setValue("roles", [...currentRoles, roleName]);
		} else {
			form.setValue(
				"roles",
				currentRoles.filter((r) => r !== roleName)
			);
		}
	};

	const isLoading = createUser.isPending || updateUser.isPending;

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}
		>
			<DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>{isEditing ? "Edit User" : "Add New User"}</DialogTitle>
				</DialogHeader>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-4"
					>
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Name</FormLabel>
									<FormControl>
										<Input
											placeholder="John Doe"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input
											type="email"
											placeholder="john@example.com"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{isEditing ? "New Password (leave empty to keep current)" : "Password"}</FormLabel>
									<FormControl>
										<Input
											type="password"
											placeholder="••••••••"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="password_confirmation"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Confirm Password</FormLabel>
									<FormControl>
										<Input
											type="password"
											placeholder="••••••••"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Skills */}
						<FormField
							control={form.control}
							name="skills"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Skills</FormLabel>
									<FormControl>
										<div className="space-y-2">
											<Input
												placeholder="Type a skill and press Enter"
												onKeyDown={handleAddSkill}
											/>
											<div className="flex flex-wrap gap-1">
												{field.value?.map((skill) => (
													<Badge
														key={skill}
														variant="secondary"
														className="gap-1"
													>
														{skill}
														<button
															type="button"
															onClick={() => handleRemoveSkill(skill)}
															className="hover:text-destructive"
														>
															<X className="h-3 w-3" />
														</button>
													</Badge>
												))}
											</div>
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Roles */}
						<FormField
							control={form.control}
							name="roles"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Roles</FormLabel>
									<FormControl>
										<div className="space-y-2 border rounded-md p-3">
											{rolesData?.roles.map((role) => (
												<div
													key={role.id}
													className="flex items-center gap-2"
												>
													<Checkbox
														id={`role-${role.id}`}
														checked={field.value?.includes(role.name)}
														onCheckedChange={(checked) => handleRoleToggle(role.name, checked as boolean)}
													/>
													<label
														htmlFor={`role-${role.id}`}
														className="text-sm cursor-pointer"
													>
														{role.name}
													</label>
												</div>
											))}
											{!rolesData?.roles.length && <p className="text-sm text-muted-foreground">No roles available</p>}
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Active Status */}
						<FormField
							control={form.control}
							name="isActive"
							render={({ field }) => (
								<FormItem className="flex items-center justify-between rounded-lg border p-3">
									<div className="space-y-0.5">
										<FormLabel>Active Status</FormLabel>
										<p className="text-sm text-muted-foreground">Inactive users cannot log in</p>
									</div>
									<FormControl>
										<Switch
											checked={field.value}
											onCheckedChange={field.onChange}
										/>
									</FormControl>
								</FormItem>
							)}
						/>

						<div className="flex justify-end gap-2 pt-4">
							<Button
								type="button"
								variant="outline"
								onClick={() => onOpenChange(false)}
								disabled={isLoading}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={isLoading}
							>
								{isLoading ? "Saving..." : isEditing ? "Update User" : "Create User"}
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
