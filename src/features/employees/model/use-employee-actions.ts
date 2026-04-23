"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { employeeApi } from "@/entities/employee/api/employee.api";
import { employeeKeys } from "@/entities/employee/model/query-keys";
import type { CreateEmployeePayload, CreateProjectMemberPayload, Employee, ProjectMember, UpdateEmployeePayload, UpdateProjectMemberPayload } from "@/entities/employee/model/types";
import { projectKeys } from "@/entities/project/model/query-keys";

export function useCreateEmployee() {
	const queryClient = useQueryClient();

	return useMutation<Employee, Error, CreateEmployeePayload>({
		mutationFn: employeeApi.createEmployee,
		onSuccess: (employee) => {
			queryClient.setQueryData(employeeKeys.detail(employee.userId), employee);
			queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
		},
	});
}

export function useUpdateEmployee() {
	const queryClient = useQueryClient();

	return useMutation<Employee, Error, { id: number; payload: UpdateEmployeePayload }>({
		mutationFn: ({ id, payload }) => employeeApi.updateEmployee(id, payload),
		onSuccess: (employee) => {
			queryClient.setQueryData(employeeKeys.detail(employee.userId), employee);
			queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
		},
	});
}

export function useActivateEmployee() {
	const queryClient = useQueryClient();

	return useMutation<Employee, Error, number>({
		mutationFn: employeeApi.activateEmployee,
		onSuccess: (employee) => {
			queryClient.setQueryData(employeeKeys.detail(employee.userId), employee);
			queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
		},
	});
}

export function useDeactivateEmployee() {
	const queryClient = useQueryClient();

	return useMutation<Employee, Error, number>({
		mutationFn: employeeApi.deactivateEmployee,
		onSuccess: (employee) => {
			queryClient.setQueryData(employeeKeys.detail(employee.userId), employee);
			queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
		},
	});
}

export function useAddProjectMember() {
	const queryClient = useQueryClient();

	return useMutation<ProjectMember, Error, { projectId: number; payload: CreateProjectMemberPayload }>({
		mutationFn: ({ projectId, payload }) => employeeApi.addProjectMember(projectId, payload),
		onSuccess: (_, { projectId }) => {
			queryClient.invalidateQueries({ queryKey: employeeKeys.projectMembers(projectId) });
			queryClient.invalidateQueries({ queryKey: projectKeys.members(projectId) });
			queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
		},
	});
}

export function useUpdateProjectMember() {
	const queryClient = useQueryClient();

	return useMutation<ProjectMember, Error, { projectId: number; memberId: number; payload: UpdateProjectMemberPayload }>({
		mutationFn: ({ projectId, memberId, payload }) => employeeApi.updateProjectMember(projectId, memberId, payload),
		onSuccess: (_, { projectId }) => {
			queryClient.invalidateQueries({ queryKey: employeeKeys.projectMembers(projectId) });
			queryClient.invalidateQueries({ queryKey: projectKeys.members(projectId) });
			queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
		},
	});
}

export function useRemoveProjectMember() {
	const queryClient = useQueryClient();

	return useMutation<void, Error, { projectId: number; memberId: number }>({
		mutationFn: ({ projectId, memberId }) => employeeApi.removeProjectMember(projectId, memberId),
		onSuccess: (_, { projectId }) => {
			queryClient.invalidateQueries({ queryKey: employeeKeys.projectMembers(projectId) });
			queryClient.invalidateQueries({ queryKey: projectKeys.members(projectId) });
			queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
		},
	});
}
