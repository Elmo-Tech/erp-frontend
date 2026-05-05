# 🔒 PBAC Security Audit Report

**ERP System — Permission-Based Access Control Migration**

**Date:** 2026-05-04  
**Auditor:** Elite Full-Stack Security Architect  
**Scope:** Complete backend (Laravel) + frontend (Next.js/React) codebase

---

## Executive Summary

The ERP system is **partially migrated** from legacy Role-Based Access Control (RBAC) to granular Permission-Based Access Control (PBAC). Critical infrastructure exists (Spatie package, `<Can>` component, permissions array in auth store), but **significant hardcoded role checks remain scattered across both backend and frontend**, creating security gaps and maintenance debt.

**Current State:** ~40% PBAC, ~60% legacy RBAC  
**Risk Level:** 🟡 **MEDIUM** — Mixed authorization model creates confusion and potential bypass vectors

---

## 1. Backend Status (Laravel)

### ✅ **Infrastructure: COMPLETE**

| Component             | Status        | Notes                                                              |
| --------------------- | ------------- | ------------------------------------------------------------------ |
| **Spatie Package**    | ✅ Installed  | `spatie/laravel-permission` v6.24 in `composer.json`               |
| **Permission Seeder** | ✅ Exists     | `RolesAndPermissionsSeeder.php` with 120+ granular permissions     |
| **User Model**        | ✅ Configured | Uses `HasRoles` trait, `UserResource` includes `permissions` array |
| **Middleware**        | ✅ Registered | `permission` and `role` middleware aliases in `bootstrap/app.php`  |

### 🟡 **Permission Coverage: PARTIAL**

#### **Modules Using Granular Permissions** ✅

1. **Settings Module** — `AdminRoleController`, `UserManagementController`, `AdminUserController`
    - All methods check `auth()->user()->can('manage_roles')`, `can('manage_users')`, etc.
    - ✅ **CLEAN** — No hardcoded role checks

2. **Lead Module** — Routes protected by permission middleware

    ```php
    Route::middleware('permission:view_leads')->group(...)
    Route::middleware('permission:manage_leads')->group(...)
    ```

    - ✅ **CLEAN**

3. **SOP Module** — Routes protected

    ```php
    Route::middleware('permission:manage_sops')->group(...)
    ```

    - ✅ **CLEAN**

4. **Dashboard Module** — `GetDashboardOverviewAction`
    ```php
    if ($user->can('view_financial_stats')) { ... }
    if ($user->can('view_project_timeline')) { ... }
    ```

    - ✅ **CLEAN**

#### **Modules With Hardcoded Role Checks** ❌

##### **1. Project Module** — CRITICAL VIOLATIONS

**File:** `app/Policies/ProjectPolicy.php`  
**Lines:** 29, 34, 61, 70, 75, 94, 103, 108

```php
// ❌ HARDCODED ROLE CHECKS
if ($user->hasRole('client')) { ... }
if ($user->hasAnyRole(['admin', 'super-admin'])) { ... }
return $user->hasAnyRole(['admin', 'super-admin']);
```

**Impact:** Policy bypasses granular permissions entirely. Should use:

```php
if ($user->can('view_projects')) { ... }
if ($user->can('manage_all_projects')) { ... }
```

---

**File:** `app/Modules/Project/Models/ProjectFile.php`  
**Lines:** 88, 99

```php
// ❌ HARDCODED ROLE CHECKS
if ($user->hasRole('super-admin') || $user->hasRole('admin')) {
    return true;
}
if ($user->hasRole('client') && $this->is_client_visible) {
    return true;
}
```

**Should be:**

```php
if ($user->can('manage_project_files')) { return true; }
if ($user->can('view_project_files') && $this->is_client_visible) { return true; }
```

---

**File:** `app/Modules/Project/Actions/ListProjectsAction.php`  
**Line:** 37

```php
// ❌ MIXED APPROACH (permission + role check)
if (! $user->can('view_all_projects') && ! $user->hasAnyRole(['admin', 'super-admin'])) {
    // Filter to assigned projects only
}
```

**Should be:**

```php
if (! $user->can('view_all_projects')) {
    // Filter to assigned projects only
}
```

---

**File:** `app/Modules/Project/Controllers/ProjectTaskController.php`  
**Lines:** 111, 178

```php
// ❌ HARDCODED ROLE CHECKS
$isGlobalAdmin = $user->hasAnyRole(['admin', 'super-admin'])
    || $user->can('manage_all_projects');
```

**Should be:**

```php
$canManageAllProjects = $user->can('manage_all_projects');
```

---

**File:** `app/Modules/Project/Controllers/ProjectTaskDeliverableController.php`  
**Lines:** 25, 34, 39-41

```php
// ❌ PROJECT-LEVEL ROLE CHECKS (not global roles, but still hardcoded)
$restrictedRoles = [ProjectRole::DEVELOPER->value, ProjectRole::QA->value];
if (! $member || in_array($member->role, $restrictedRoles, true)) {
    return ApiResponse::forbidden('Only manager or tech_lead can add deliverables.');
}
```

**Note:** This is checking **project membership roles** (manager, tech_lead, developer, QA), not global system roles. This is acceptable for project-scoped authorization, but should be documented as a separate concern from global PBAC.

---

##### **2. Client Module** — MINOR VIOLATION

**File:** `app/Modules/Client/Routes/api.php`  
**Line:** 30

```php
// ❌ HARDCODED ROLE MIDDLEWARE
Route::prefix('client')
    ->middleware(['auth:sanctum', 'locale', 'role:client'])
    ->group(function () { ... });
```

**Should be:**

```php
->middleware(['auth:sanctum', 'locale', 'permission:access_client_portal'])
```

---

**File:** `app/Scopes/ClientScope.php`  
**Line:** 25

```php
// ❌ HARDCODED ROLE CHECK
if (! $user->hasRole('client')) {
    return;
}
```

**Should be:**

```php
if (! $user->can('access_client_portal')) {
    return;
}
```

---

### 🔴 **Missing Permissions in Seeder**

The following permissions are **used in code** but **NOT seeded** in `RolesAndPermissionsSeeder.php`:

1. **`manage_all_projects`** — Used in:
    - `ProjectPolicy.php:80`
    - `ProjectTaskController.php:112, 179`
    - `ProjectTaskDeliverableController.php:35`
    - Migration exists: `2026_01_06_000003_add_view_all_projects_permission.php`

2. **`create_client_portal_access`** — Used in `ClientPortalAccessController.php:27`
3. **`revoke_client_portal_access`** — Used in `ClientPortalAccessController.php:28`
4. **`reset_client_portal_password`** — Used in `ClientPortalAccessController.php:29`
5. **`access_client_portal`** — Needed to replace `role:client` middleware

**These exist in:** `LeadClientPermissionsSeeder.php` but are **NOT called** by `DatabaseSeeder.php`

---

### 🟡 **Route Protection: INCONSISTENT**

| Module           | Route Protection                              | Status                                |
| ---------------- | --------------------------------------------- | ------------------------------------- |
| **Lead**         | ✅ `middleware('permission:view_leads')`      | GOOD                                  |
| **SOP**          | ✅ `middleware('permission:manage_sops')`     | GOOD                                  |
| **Client**       | ❌ `middleware('role:client')`                | BAD — hardcoded role                  |
| **Project**      | ⚠️ No middleware, relies on policies          | RISKY — policies have hardcoded roles |
| **Settings**     | ⚠️ `auth:sanctum` only, checks in controllers | ACCEPTABLE — checks are granular      |
| **Dashboard**    | ⚠️ `auth:sanctum` only, checks in actions     | ACCEPTABLE — checks are granular      |
| **Meetings**     | ⚠️ `auth:sanctum` only                        | MISSING — no permission checks        |
| **Notification** | ⚠️ `auth:sanctum` only                        | MISSING — no permission checks        |

---

## 2. Frontend Status (Next.js/React)

### ✅ **Infrastructure: COMPLETE**

| Component                    | Status        | Notes                                                         |
| ---------------------------- | ------------- | ------------------------------------------------------------- |
| **`<Can>` Component**        | ✅ Exists     | `src/shared/ui/Can.tsx` — declarative permission gate         |
| **`usePermissionGate` Hook** | ✅ Exists     | Imperative variant of `<Can>`                                 |
| **Auth Store**               | ✅ Configured | `useAuthStore` includes `permissions[]` and `hasPermission()` |
| **Permission Constants**     | ✅ Exists     | `src/entities/user/model/permissions.ts` — 120+ constants     |
| **Permission Hooks**         | ✅ Exists     | `useClientPermissions()`, `useProjectPermissions()`, etc.     |

### 🟡 **Permission Usage: PARTIAL**

#### **Components Using Granular Permissions** ✅

1. **RolesPage** — `src/views/roles/RolesPage.tsx`

    ```tsx
    const { canManageRoles, canViewRoles } = useEmployeePermissions();
    <Can permission="manage_roles">...</Can>;
    ```

    - ✅ **CLEAN**

2. **MainDashboardWidget** — `src/widgets/dashboard-management/ui/MainDashboardWidget.tsx`

    ```tsx
    const canViewFinancialStats = hasPermission("view_financial_stats");
    const canViewProjectTimeline = hasPermission("view_project_timeline");
    ```

    - ✅ **CLEAN**

3. **ProjectDetailsComposite** — `src/widgets/project-management/ui/ProjectDetailsComposite.tsx`

    ```tsx
    const { canEditProjects, canViewProjectBudget } = useProjectPermissions();
    const { canManageTasks, canViewTasks } = useTaskPermissions();
    ```

    - ✅ **CLEAN**

4. **ClientProfileLayout** — `src/views/client-profile/ClientProfileLayout.tsx`

    ```tsx
    const { canManageClients, canEditClients } = useClientPermissions();
    ```

    - ✅ **CLEAN**

5. **AppSidebar** — `src/widgets/layout/ui/AppSidebar.tsx`

    ```tsx
    if (item.permission && !hasPermission(item.permission)) return false;
    ```

    - ✅ **CLEAN**

6. **ProtectedDashboardRoute** — `src/widgets/layout/ui/ProtectedDashboardRoute.tsx`
    ```tsx
    if (requiredPermission && !hasPermission(requiredPermission)) {
    	router.push("/unauthorized");
    }
    ```

    - ✅ **CLEAN**

#### **Components With Hardcoded Role Checks** ❌

##### **1. TaskExecutionSheet** — CRITICAL VIOLATION

**File:** `src/features/projects/ui/TaskExecutionSheet.tsx`  
**Lines:** 270, 273, 276-277, 281, 284, 295, 459, 474

```tsx
// ❌ HARDCODED ROLE CHECKS
const globalRole = useAuthStore((s) => s.role);
const isGlobalAdmin = globalRole === "super-admin" || globalRole === "admin" || globalRole === "founder";

const projectRole = isGlobalAdmin
	? "manager" // founders/admins get full access
	: (membersQuery.data?.find((m) => m.userId === currentUserId)?.role ?? null);

if (isGlobalAdmin || projectRole === "manager" || projectRole === "tech_lead") {
	// Allow status change
}
if (projectRole === "developer") {
	// Restrict to "Submit for Review"
}

const canAddDeliverables = isGlobalAdmin || projectRole === "manager" || projectRole === "tech_lead";
```

**Impact:** Entire task execution flow bypasses permission system. Should use:

```tsx
const { canManageTasks, canEditTasks, canCompleteTask, canAddDeliverables } = useTaskPermissions();
```

**Note:** The `projectRole` (manager, tech_lead, developer, QA) is a **project membership role**, not a global system role. This is acceptable for project-scoped UI logic, but the `isGlobalAdmin` check should be replaced with permissions.

---

##### **2. Login/Redirect Logic** — MINOR VIOLATIONS

**Files:**

- `src/app/unauthorized/page.tsx:12`
- `src/app/page.tsx:16`
- `src/app/login/page.tsx:20`
- `src/features/auth/model/use-login.ts:34`

```tsx
// ❌ HARDCODED ROLE CHECK
if (role === "client") return "/client";
```

**Should be:**

```tsx
if (hasPermission("access_client_portal")) return "/client";
```

---

##### **3. AppSidebar** — MINOR VIOLATION

**File:** `src/widgets/layout/ui/AppSidebar.tsx`  
**Line:** 117

```tsx
// ❌ FALLBACK TO ROLE CHECK
if (item.roles && role && !item.roles.includes(role)) return false;
```

**Impact:** Sidebar items can still use `roles: ['founder', 'admin']` array instead of `permission: 'manage_users'`. This is a **legacy escape hatch** that should be removed.

---

##### **4. ProtectedDashboardRoute** — MINOR VIOLATION

**File:** `src/widgets/layout/ui/ProtectedDashboardRoute.tsx`  
**Lines:** 10, 39

```tsx
// ❌ SUPPORTS LEGACY allowedRoles PROP
allowedRoles?: string[];

if (allowedRoles && role && !allowedRoles.includes(role)) {
    router.push("/unauthorized");
}
```

**Impact:** Routes can still use `allowedRoles={['founder', 'admin']}` instead of `requiredPermission="manage_users"`. This is a **legacy escape hatch** that should be removed.

---

### 🟢 **No Hardcoded Role Checks Found In:**

- `src/views/projects/` (except `TaskExecutionSheet`)
- `src/views/clients/`
- `src/views/leads/`
- `src/views/dashboard/`
- `src/features/clients/`
- `src/features/leads/`
- `src/features/meetings/`
- `src/widgets/client-management/`
- `src/widgets/leads-management/`

---

## 3. Missing Infrastructure

### ❌ **Backend**

1. **Missing Permissions in Main Seeder:**
    - `manage_all_projects`
    - `create_client_portal_access`
    - `revoke_client_portal_access`
    - `reset_client_portal_password`
    - `access_client_portal`

2. **Seeder Not Called:**
    - `LeadClientPermissionsSeeder.php` exists but not in `DatabaseSeeder.php`

3. **No Permission Middleware on:**
    - Project routes (`app/Modules/Project/Routes/api.php`)
    - Meeting routes (`app/Modules/Meetings/Routes/api.php`)
    - Notification routes (`app/Modules/Notification/Routes/api.php`)
    - Dashboard routes (`app/Modules/Dashboard/Routes/api.php`)

### ✅ **Frontend**

No missing infrastructure — all components exist and are functional.

---

## 4. Migration Action Plan

### 🎯 **Phase 1: Backend Foundation (Priority: CRITICAL)**

#### **Step 1.1: Update RolesAndPermissionsSeeder**

- [ ] Add missing permissions to `RolesAndPermissionsSeeder.php`:
    ```php
    'manage_all_projects',
    'access_client_portal',
    'create_client_portal_access',
    'revoke_client_portal_access',
    'reset_client_portal_password',
    ```
- [ ] Assign to appropriate roles (founder, pmo, admin)
- [ ] Run seeder: `php artisan db:seed --class=RolesAndPermissionsSeeder`

#### **Step 1.2: Refactor ProjectPolicy**

- [ ] Replace all `hasRole('client')` with `can('access_client_portal')`
- [ ] Replace all `hasAnyRole(['admin', 'super-admin'])` with `can('manage_all_projects')`
- [ ] Remove role checks from `view()`, `update()`, `delete()`, `approveUI()` methods

**File:** `app/Policies/ProjectPolicy.php`

#### **Step 1.3: Refactor Project Module**

- [ ] **ProjectFile.php** — Replace `hasRole('super-admin')` with `can('manage_project_files')`
- [ ] **ListProjectsAction.php** — Remove `hasAnyRole(['admin', 'super-admin'])` check
- [ ] **ProjectTaskController.php** — Replace `hasAnyRole(['admin', 'super-admin'])` with `can('manage_all_projects')`
- [ ] **ProjectTaskDeliverableController.php** — Replace `hasAnyRole(['admin', 'super-admin'])` with `can('manage_all_projects')`

#### **Step 1.4: Refactor Client Module**

- [ ] **Client Routes** — Replace `middleware('role:client')` with `middleware('permission:access_client_portal')`
- [ ] **ClientScope.php** — Replace `hasRole('client')` with `can('access_client_portal')`
- [ ] **ClientPortalAccessController.php** — Verify permission middleware is working

#### **Step 1.5: Add Route Middleware**

- [ ] **Project Routes** — Add `middleware('permission:view_projects')` to read routes
- [ ] **Project Routes** — Add `middleware('permission:manage_projects')` to write routes
- [ ] **Meeting Routes** — Add `middleware('permission:schedule_meetings')`
- [ ] **Notification Routes** — Add `middleware('permission:view_notifications')` (if permission exists)

---

### 🎯 **Phase 2: Frontend Refactoring (Priority: HIGH)**

#### **Step 2.1: Refactor TaskExecutionSheet**

- [ ] Remove `const globalRole = useAuthStore((s) => s.role);`
- [ ] Remove `const isGlobalAdmin = globalRole === "super-admin" || ...`
- [ ] Add permission hooks:
    ```tsx
    const { canManageTasks, canEditTasks, canCompleteTask, canAddDeliverables } = useTaskPermissions();
    ```
- [ ] Replace all `isGlobalAdmin` checks with `canManageTasks`
- [ ] Replace `projectRole === "developer"` checks with `!canCompleteTask`
- [ ] Keep `projectRole` for project-scoped UI logic (status dropdown options)

**File:** `src/features/projects/ui/TaskExecutionSheet.tsx`

#### **Step 2.2: Refactor Login/Redirect Logic**

- [ ] Replace `role === "client"` with `hasPermission("access_client_portal")`

**Files:**

- `src/app/unauthorized/page.tsx`
- `src/app/page.tsx`
- `src/app/login/page.tsx`
- `src/features/auth/model/use-login.ts`

#### **Step 2.3: Remove Legacy Escape Hatches**

- [ ] **AppSidebar** — Remove `item.roles` support, enforce `item.permission` only
- [ ] **ProtectedDashboardRoute** — Remove `allowedRoles` prop, enforce `requiredPermission` only
- [ ] **DashboardLayout** — Remove `allowedRoles` prop passthrough

**Files:**

- `src/widgets/layout/ui/AppSidebar.tsx`
- `src/widgets/layout/ui/ProtectedDashboardRoute.tsx`
- `src/widgets/layout/ui/DashboardLayout.tsx`

---

### 🎯 **Phase 3: Testing & Validation (Priority: MEDIUM)**

#### **Step 3.1: Backend Testing**

- [ ] Test all Project endpoints with different permission sets
- [ ] Test Client portal access with `access_client_portal` permission
- [ ] Test role CRUD with `manage_roles` permission
- [ ] Test user CRUD with `manage_users` permission
- [ ] Verify policies are called correctly (no role bypasses)

#### **Step 3.2: Frontend Testing**

- [ ] Test TaskExecutionSheet with different permission sets
- [ ] Test dashboard widgets with different permission sets
- [ ] Test sidebar visibility with different permission sets
- [ ] Test route protection with different permission sets
- [ ] Verify no `role === "..."` checks remain in console logs

#### **Step 3.3: Integration Testing**

- [ ] Create test users with granular permissions (no roles)
- [ ] Verify UI matches backend authorization
- [ ] Test permission changes (add/remove) reflect immediately after re-login
- [ ] Test super-admin bypass still works via `hasPermission()` in auth store

---

### 🎯 **Phase 4: Documentation & Cleanup (Priority: LOW)**

#### **Step 4.1: Update Documentation**

- [ ] Document all 120+ permissions in a central README
- [ ] Document permission naming conventions (`view_*`, `manage_*`, `create_*`, etc.)
- [ ] Document project membership roles vs. global permissions
- [ ] Create permission matrix (role → permissions mapping)

#### **Step 4.2: Code Cleanup**

- [ ] Remove unused `role` field from auth store (keep for backward compatibility initially)
- [ ] Remove `allowedRoles` from route components
- [ ] Remove `roles` from sidebar nav items
- [ ] Add ESLint rule to prevent `role === "..."` patterns
- [ ] Add PHPStan rule to prevent `hasRole()` calls

#### **Step 4.3: Seeder Consolidation**

- [ ] Merge `LeadClientPermissionsSeeder` into `RolesAndPermissionsSeeder`
- [ ] Merge `MissingPermissionsSeeder` into `RolesAndPermissionsSeeder`
- [ ] Merge `NewPermissionsSeeder` into `RolesAndPermissionsSeeder`
- [ ] Keep only one source of truth for permissions

---

## 5. Risk Assessment

### 🔴 **Critical Risks**

1. **ProjectPolicy Bypass** — Hardcoded `hasAnyRole(['admin', 'super-admin'])` bypasses all granular permissions
    - **Impact:** Admins can access/modify projects even if `manage_projects` permission is revoked
    - **Mitigation:** Refactor policy immediately (Phase 1.2)

2. **TaskExecutionSheet Role Logic** — Entire task workflow bypasses permission system
    - **Impact:** UI shows/hides actions based on roles, not permissions
    - **Mitigation:** Refactor component immediately (Phase 2.1)

### 🟡 **Medium Risks**

3. **Missing Route Middleware** — Project/Meeting/Notification routes have no permission checks
    - **Impact:** Authorization relies solely on controller/policy checks (can be bypassed)
    - **Mitigation:** Add route middleware (Phase 1.5)

4. **Client Role Hardcoding** — `role:client` middleware and `hasRole('client')` checks
    - **Impact:** Cannot grant client-like permissions to non-client users
    - **Mitigation:** Replace with `access_client_portal` permission (Phase 1.4)

### 🟢 **Low Risks**

5. **Legacy Escape Hatches** — `allowedRoles` prop still supported in routes/sidebar
    - **Impact:** Developers might use old pattern instead of permissions
    - **Mitigation:** Remove props and update docs (Phase 2.3)

6. **Seeder Fragmentation** — Permissions scattered across multiple seeders
    - **Impact:** Hard to audit full permission list
    - **Mitigation:** Consolidate seeders (Phase 4.3)

---

## 6. Compliance Checklist

### ✅ **Completed**

- [x] Spatie package installed and configured
- [x] Permission seeder exists with 120+ granular permissions
- [x] User model includes `permissions` array in API responses
- [x] Frontend `<Can>` component exists and is functional
- [x] Frontend auth store includes `hasPermission()` method
- [x] Permission hooks exist for all modules
- [x] Settings module fully migrated to PBAC
- [x] Lead module fully migrated to PBAC
- [x] SOP module fully migrated to PBAC
- [x] Dashboard module fully migrated to PBAC

### ❌ **Incomplete**

- [ ] Project module still uses hardcoded role checks (Policy, Controllers, Models)
- [ ] Client module still uses `role:client` middleware
- [ ] TaskExecutionSheet still uses hardcoded role logic
- [ ] Login/redirect logic still checks `role === "client"`
- [ ] Route middleware missing on Project/Meeting/Notification modules
- [ ] Missing permissions not seeded (`manage_all_projects`, portal permissions)
- [ ] Legacy escape hatches (`allowedRoles`, `item.roles`) still exist

---

## 7. Estimated Effort

| Phase                 | Tasks    | Estimated Time  | Priority |
| --------------------- | -------- | --------------- | -------- |
| **Phase 1: Backend**  | 5 steps  | 4-6 hours       | CRITICAL |
| **Phase 2: Frontend** | 3 steps  | 3-4 hours       | HIGH     |
| **Phase 3: Testing**  | 3 steps  | 4-6 hours       | MEDIUM   |
| **Phase 4: Docs**     | 3 steps  | 2-3 hours       | LOW      |
| **TOTAL**             | 14 steps | **13-19 hours** | —        |

---

## 8. Recommendations

### **Immediate Actions (This Sprint)**

1. ✅ **Add missing permissions to seeder** (30 min)
2. ✅ **Refactor ProjectPolicy** (1 hour)
3. ✅ **Refactor TaskExecutionSheet** (2 hours)
4. ✅ **Replace `role:client` middleware** (1 hour)

### **Short-Term Actions (Next Sprint)**

5. ✅ **Add route middleware to Project/Meeting modules** (2 hours)
6. ✅ **Refactor Project module controllers** (2 hours)
7. ✅ **Remove legacy escape hatches** (1 hour)
8. ✅ **Write integration tests** (4 hours)

### **Long-Term Actions (Future Sprints)**

9. ✅ **Consolidate seeders** (1 hour)
10. ✅ **Write permission documentation** (2 hours)
11. ✅ **Add linting rules** (1 hour)

---

## 9. Conclusion

The ERP system has a **solid PBAC foundation** but is **not yet fully migrated**. The most critical violations are in the **Project module** (backend policy + frontend TaskExecutionSheet), which handle the core business logic. These must be refactored immediately to achieve true granular access control.

**Next Steps:**

1. Run Phase 1 (Backend Foundation) — 4-6 hours
2. Run Phase 2 (Frontend Refactoring) — 3-4 hours
3. Test thoroughly with different permission sets
4. Deploy to staging and validate with real users

**Success Criteria:**

- ✅ Zero `hasRole()` calls in backend (except protected role checks in AdminRoleController)
- ✅ Zero `role === "..."` checks in frontend (except project membership roles)
- ✅ All routes protected by permission middleware
- ✅ All UI actions gated by `<Can>` or permission hooks
- ✅ All permissions seeded and assigned to roles

---

**Report Generated:** 2026-05-04  
**Audit Complete** ✅
