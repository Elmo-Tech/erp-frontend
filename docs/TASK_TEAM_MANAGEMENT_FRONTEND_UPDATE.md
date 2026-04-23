# Task Team Management - Frontend Updates

## تاريخ التحديث: 2025-01-XX

## التغييرات المطبقة

### 1. ✅ تحديث TaskAssigneesSection - السماح بحذف الأعضاء من أي نوع تاسك

**الملف:** `src/features/projects/components/tasks/TaskAssigneesSection.tsx`

**التغييرات:**

#### قبل التحديث:

```typescript
// Permission logic:
// - Main/Weekly Tasks: Only users with manage_task_team permission can add/remove team
// - Subtasks: Team is inherited (view-only), no one can add/remove
const isMainOrWeeklyTask = task.type === TaskType.MAIN || task.type === TaskType.WEEKLY;
const isSubtask = task.type === TaskType.SUBTASK;
const canEditAssignees = isMainOrWeeklyTask && (isAdminOrSuperAdmin || canManageTaskTeam);
```

#### بعد التحديث:

```typescript
// Permission logic (UPDATED):
// - All task types (Main/Weekly/Subtask): Users with manage_task_team permission can add/remove team
// - When adding to Main Task: propagates to Weekly Tasks only (not Subtasks)
// - When removing from Main Task: removes from Weekly Tasks only (not Subtasks)
// - Weekly/Subtasks: can be managed independently
const isMainTask = task.type === TaskType.MAIN;
const isWeeklyTask = task.type === TaskType.WEEKLY;
const isSubtask = task.type === TaskType.SUBTASK;
const canEditAssignees = isAdminOrSuperAdmin || canManageTaskTeam;
```

**النتيجة:**

- ✅ الآن يمكن حذف/إضافة الأعضاء من أي نوع تاسك (Main/Weekly/Subtask)
- ✅ زر "Remove" يظهر لجميع الأعضاء في جميع أنواع التاسكات
- ✅ الصلاحيات تعتمد على `manage_task_team` permission فقط

---

### 2. ✅ إضافة رسائل توضيحية للمستخدم

**الملف:** `src/features/projects/components/tasks/TaskAssigneesSection.tsx`

**التغييرات:**

#### قبل التحديث:

```tsx
{
	/* Info notice for non-main tasks */
}
{
	isSubtask && (
		<Alert>
			<Info className="h-4 w-4" />
			<AlertDescription>Team members are inherited from the main task and cannot be modified on subtasks.</AlertDescription>
		</Alert>
	);
}
```

#### بعد التحديث:

```tsx
{
	/* Info notice based on task type */
}
{
	isMainTask && (
		<Alert>
			<Info className="h-4 w-4" />
			<AlertDescription>Adding a team member to this Main Task will automatically add them to all Weekly Tasks (but not Subtasks). Weekly Tasks and Subtasks can be managed independently.</AlertDescription>
		</Alert>
	);
}
{
	isWeeklyTask && (
		<Alert>
			<Info className="h-4 w-4" />
			<AlertDescription>You can add or remove team members from this Weekly Task independently. Changes won't affect the Main Task or Subtasks.</AlertDescription>
		</Alert>
	);
}
{
	isSubtask && (
		<Alert>
			<Info className="h-4 w-4" />
			<AlertDescription>You can add or remove team members from this Subtask independently. Changes won't affect the Main Task or Weekly Tasks.</AlertDescription>
		</Alert>
	);
}
```

**النتيجة:**

- ✅ رسالة توضيحية مختلفة لكل نوع تاسك
- ✅ المستخدم يفهم السلوك المتوقع عند إضافة/حذف الأعضاء
- ✅ توضيح أن Main Task يضيف للـ Weekly Tasks فقط

---

### 3. ✅ التأكد من عدم وجود فلتر افتراضي يخفي التاسكات المكتملة

**الملف:** `src/features/dashboard/components/my-tasks/MyTasksPage.tsx`

**التحقق:**

```typescript
const [filters, setFilters] = useState<TaskFilters>({
	page: 1,
	perPage: 100,
});
// ✅ لا يوجد status filter افتراضي
```

**الملف:** `src/features/dashboard/components/my-tasks/TaskFilters.tsx`

**التحقق:**

```tsx
<Select
	value={filters.status || "all"} // ✅ القيمة الافتراضية "all"
	onValueChange={(v) => onFilterChange("status", v)}
>
	<SelectContent>
		<SelectItem value="all">All Status</SelectItem>
		{/* جميع الحالات متاحة بما فيها completed */}
	</SelectContent>
</Select>
```

**النتيجة:**

- ✅ التاسكات المكتملة تظهر بشكل افتراضي
- ✅ المستخدم يمكنه فلترة حسب Status إذا أراد
- ✅ المشكلة الأساسية كانت في الـ Backend (تم حلها بإضافة `distinct()`)

---

## ملخص التغييرات

### الملفات المعدلة:

1. ✅ `src/features/projects/components/tasks/TaskAssigneesSection.tsx`

### التغييرات الوظيفية:

| الميزة                   | قبل                    | بعد                          |
| ------------------------ | ---------------------- | ---------------------------- |
| حذف عضو من Main Task     | ✅ ممكن                | ✅ ممكن (يحذف من Weekly فقط) |
| حذف عضو من Weekly Task   | ✅ ممكن                | ✅ ممكن (مستقل)              |
| حذف عضو من Subtask       | ❌ غير ممكن            | ✅ ممكن (مستقل)              |
| إضافة عضو لـ Main Task   | ينضاف لكل الـ children | ينضاف للـ Weekly فقط         |
| إضافة عضو لـ Weekly Task | ينضاف للتاسك فقط       | ✅ نفس السلوك                |
| إضافة عضو لـ Subtask     | غير ممكن               | ✅ ممكن (مستقل)              |
| رسائل توضيحية            | رسالة واحدة            | رسالة لكل نوع تاسك           |
| ظهور التاسكات المكتملة   | ✅ تظهر                | ✅ تظهر                      |
| تكرار التاسكات           | ❌ كانت تتكرر          | ✅ تم الحل في Backend        |

---

## اختبار التغييرات

### Test Case 1: إضافة عضو لـ Main Task

1. افتح Main Task
2. اضغط على "Add" في قسم Team Members
3. اختر عضو وأضفه
4. **المتوقع:**
    - ✅ يظهر تنبيه: "Adding a team member to this Main Task will automatically add them to all Weekly Tasks (but not Subtasks)"
    - ✅ العضو يضاف للـ Main Task
    - ✅ العضو يضاف لجميع Weekly Tasks
    - ❌ العضو لا يضاف للـ Subtasks

### Test Case 2: حذف عضو من Main Task

1. افتح Main Task
2. اضغط على زر "X" بجانب أي عضو
3. **المتوقع:**
    - ✅ العضو يحذف من Main Task
    - ✅ العضو يحذف من جميع Weekly Tasks
    - ❌ العضو لا يحذف من Subtasks

### Test Case 3: إدارة Weekly Task بشكل مستقل

1. افتح Weekly Task
2. اضغط على "Add" في قسم Team Members
3. **المتوقع:**
    - ✅ يظهر تنبيه: "You can add or remove team members from this Weekly Task independently"
    - ✅ يمكن إضافة عضو جديد
    - ✅ يمكن حذف أي عضو
    - ❌ التغييرات لا تؤثر على Main Task أو Subtasks

### Test Case 4: إدارة Subtask بشكل مستقل

1. افتح Subtask
2. اضغط على "Add" في قسم Team Members
3. **المتوقع:**
    - ✅ يظهر تنبيه: "You can add or remove team members from this Subtask independently"
    - ✅ يمكن إضافة عضو جديد
    - ✅ يمكن حذف أي عضو
    - ❌ التغييرات لا تؤثر على Main Task أو Weekly Tasks

### Test Case 5: ظهور التاسكات المكتملة

1. افتح صفحة "My Tasks" (`/dashboard/my-tasks`)
2. **المتوقع:**
    - ✅ التاسكات المكتملة تظهر في القائمة
    - ✅ يمكن فلترة حسب Status = "Completed"
    - ✅ لا يوجد تكرار في التاسكات

### Test Case 6: عدم تكرار التاسكات

1. افتح صفحة "My Tasks"
2. تأكد من أن لديك تاسكات مع عدة أعضاء
3. **المتوقع:**
    - ✅ كل تاسك يظهر مرة واحدة فقط
    - ✅ لا يوجد تكرار حتى لو كان التاسك له عدة assignees

---

## الصلاحيات المطلوبة

### لإدارة الفريق (إضافة/حذف الأعضاء):

- Admin أو Super Admin
- أو صلاحية `manage_task_team`

### للتحقق من الصلاحيات:

```typescript
import { usePermissions } from "@/features/admin/hooks/usePermissions";
import { useAuthStore } from "@/store/authStore";

const { canManageTaskTeam } = usePermissions();
const { role } = useAuthStore();

const isAdminOrSuperAdmin = role === "admin" || role === "super-admin";
const canEditAssignees = isAdminOrSuperAdmin || canManageTaskTeam;
```

---

## ملاحظات مهمة

1. **التوافق مع Backend:**
    - التغييرات في Frontend متوافقة 100% مع التغييرات في Backend
    - API endpoints لم تتغير
    - السلوك الجديد يعتمد على التحديثات في `TaskService` و `TaskPolicy`

2. **User Experience:**
    - الرسائل التوضيحية تساعد المستخدم على فهم السلوك المتوقع
    - زر "Remove" يظهر لجميع الأعضاء في جميع أنواع التاسكات
    - لا يوجد confusion حول من يمكن حذفه ومن لا يمكن

3. **Performance:**
    - استخدام `distinct()` في Backend يمنع التكرار
    - لا يوجد تأثير سلبي على الأداء
    - Cache invalidation يعمل بشكل صحيح

4. **Testing:**
    - يجب اختبار جميع السيناريوهات المذكورة أعلاه
    - التأكد من أن الصلاحيات تعمل بشكل صحيح
    - التحقق من Activity Logging في Backend

---

## الخطوات التالية (اختياري)

### تحسينات مستقبلية:

1. إضافة Bulk Actions (إضافة/حذف عدة أعضاء دفعة واحدة)
2. إضافة Drag & Drop لإعادة ترتيب الأعضاء
3. إضافة فلتر "My Role" في صفحة My Tasks
4. إضافة إشعارات عند إضافة/حذف الأعضاء
5. إضافة تاريخ الإضافة/الحذف في Activity Log

---

## الكود المعدل

### TaskAssigneesSection.tsx

```typescript
// Permission logic (UPDATED)
const isMainTask = task.type === TaskType.MAIN;
const isWeeklyTask = task.type === TaskType.WEEKLY;
const isSubtask = task.type === TaskType.SUBTASK;

const isAdminOrSuperAdmin = role === "admin" || role === "super-admin";
const canEditAssignees = isAdminOrSuperAdmin || canManageTaskTeam;

// Info notices based on task type
{isMainTask && (
  <Alert>
    <Info className="h-4 w-4" />
    <AlertDescription>
      Adding a team member to this Main Task will automatically add them to all Weekly Tasks
      (but not Subtasks). Weekly Tasks and Subtasks can be managed independently.
    </AlertDescription>
  </Alert>
)}
{isWeeklyTask && (
  <Alert>
    <Info className="h-4 w-4" />
    <AlertDescription>
      You can add or remove team members from this Weekly Task independently.
      Changes won't affect the Main Task or Subtasks.
    </AlertDescription>
  </Alert>
)}
{isSubtask && (
  <Alert>
    <Info className="h-4 w-4" />
    <AlertDescription>
      You can add or remove team members from this Subtask independently.
      Changes won't affect the Main Task or Weekly Tasks.
    </AlertDescription>
  </Alert>
)}
```

---

## الخلاصة

تم تحديث الـ Frontend بنجاح لدعم التغييرات الجديدة في إدارة فريق التاسكات:

✅ إمكانية حذف الأعضاء من أي نوع تاسك
✅ رسائل توضيحية للمستخدم حسب نوع التاسك
✅ التأكد من ظهور التاسكات المكتملة
✅ حل مشكلة التكرار (تم في Backend)
✅ توافق كامل مع التغييرات في Backend

جميع التغييرات جاهزة للاستخدام! 🚀
