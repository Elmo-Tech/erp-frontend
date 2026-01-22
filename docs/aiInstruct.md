# 🚀 Laravel API Engineering & Standards

أنت مهندس برمجيات خبير. مهمتك هي بناء API عالي الأداء وقابل للصيانة باستخدام Laravel. يجب عليك الالتزام بهذه المعايير بدقة دون استثناء.

## 1. التقنيات الأساسية والبنية التحتية
- **Framework:** Laravel 12.x (PHP 8.4+)
- **Architecture:** RESTful API مع إصدارات (مثل `/api/v1/`)
- **Authentication:** Laravel Sanctum (Token-based)
- **الحزم الأساسية:**
    - `spatie/laravel-permission` (إدارة الأدوار والصلاحيات)
    - `spatie/laravel-query-builder` (الفلترة والترتيب المتقدم)
- **التوثيق:** Swagger/OpenAPI (كل endpoint يجب توثيقه)

## 2. هيكل المجلدات ومكان المنطق
اتبع هذه البنية لضمان فصل الاهتمامات:
- `app/Http/Controllers/Api/V1/`: Controllers مع الإصدارات
- `app/Http/Requests/`: Form Requests منظمة في مجلدات (مثل `requests/users/SomeRequest.php`)
- `app/Http/Resources/`: Resources منظمة في مجلدات (مثل `resources/users/UserResource.php`)
- `app/Services/`: منطق العمل (خدمة واحدة لكل وحدة) - تستقبل البيانات بصيغة camelCase
- `app/Services/UserRolePermission/`: خدمات الأدوار والصلاحيات
- `app/Filters/`: فلاتر مخصصة (يجب تنفيذ `Spatie\QueryBuilder\Filters\Filter`)
- `app/Enums/`: PHP Enums لجميع الحالات وأكواد HTTP
- `app/Traits/`: ApiResponse, CreatedUpdatedBy, و CreatedUpdatedByMigration

**قاعدة التنظيم:** كل Request أو Resource يجب أن يكون داخل مجلد خاص به حسب الوحدة (مثل users, orders, products)

## 3. معايير قاعدة البيانات والنماذج
- **التسمية:** أعمدة قاعدة البيانات يجب أن تكون `snake_case` (مثل `order_status`, `payment_method`) ولكن API requests/responses يجب أن تكون `camelCase` (مثل `orderStatus`, `paymentMethod`)
- **أعمدة المراجعة:** استخدم `CreatedUpdatedBy` traits لـ `created_by` و `updated_by` في قاعدة البيانات، ولكن في API responses استخدم `createdBy` و `updatedBy`
- **التحسين:** 
    - تفعيل `Model::preventLazyLoading()` في التطوير
    - استخدام `boolean` أو `tinyInteger` للحالات
    - تطبيق فهارس على المفاتيح الخارجية والأعمدة القابلة للبحث

### Casts و Enums
استخدم PHP Enums في الـ casts للحالات:
```php
protected function casts(): array
{
    return [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'status' => StatusEnum::class,
    ];
}
```

### Accessors للملفات والصور
استخدم Accessors لمعالجة الملفات والصور:
```php
protected function avatar(): Attribute
{
    return Attribute::make(
        get: fn ($value) => $value ? Storage::disk('public')->url($value) : "",
    );
}
```

**قواعد مهمة:**
- استخدم Enums في Form Requests للتحقق من صحة البيانات
- استخدم Enums في Model Casts لضمان نوع البيانات
- استخدم Accessors لتحويل مسارات الملفات إلى URLs كاملة

## 4. إرشادات طلبات واستجابات API
- **اتفاقية التسمية:**
    - **Database Fields:** دائماً `snake_case` (مثل `user_id`, `created_at`)
    - **JSON Inputs (Requests):** دائماً `camelCase` (مثل `userId`, `createdAt`)
    - **JSON Outputs (Resources):** دائماً `camelCase` (مثل `userId`, `createdAt`)
- **الهوية:** استخدم مفاتيح محددة مثل `userId` أو `orderId` بدلاً من `id` العام في Resources
- **Strict Typing في Resources:** التعامل مع null بإرجاع الأنواع الافتراضية:
    - String: `""` | Integer: `0` | Decimal/Float: `0.0` | Boolean: `false`
- **استجابة موحدة:** جميع الاستجابات يجب أن تستخدم فئة المساعد `ApiResponse`
- **إرجاع البيانات المطلوبة فقط:** Resources يجب أن ترجع فقط البيانات التي يحتاجها الـ Frontend، تجنب إرجاع بيانات حساسة أو غير ضرورية

## 5. سير العمل التطويري (إلزامي)
1. **توثيق Swagger أولاً:** قبل تنفيذ أي منطق controller، اكتب `@OA` DocBlock
2. **مزامنة التسمية:** تأكد من أن أسماء `@OA\Property` تطابق مفاتيح `camelCase` في Resources/Requests بدقة
3. **معاملات قاعدة البيانات:** استخدم دائماً `DB::transaction()` داخل **Controller** للعمليات التي تتضمن خطوات أو خدمات متعددة
4. **Idempotency:** استخدم headers `Idempotency-Key` للعمليات الحساسة (مثل المدفوعات)
5. **الترجمة:** دعم header `Accept-Language` (ar/en) عبر `SetLocaleMiddleware`

## 6. مقاطع الكود الأساسية

### A. هيكل Resources المطلوب

#### Collection Resources (للفهرسة مع Pagination)
```php
<?php

namespace App\Http\Resources\V1\User;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class UserCollection extends ResourceCollection
{
    /**
     * Transform the resource collection into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'users' => AllUserResource::collection($this->collection),
            'pagination' => [
                'total' => $this->total(),
                'count' => $this->count(),
                'perPage' => $this->perPage(),
                'currentPage' => $this->currentPage(),
                'totalPages' => $this->lastPage(),
            ],
        ];
    }
}
```

#### AllUserResource (للاستخدام في القوائم)
يجب إنشاء `AllUserResource` يحتوي على البيانات الأساسية المطلوبة للعرض في القوائم فقط.

#### UserResource (للعرض التفصيلي)
يجب إنشاء `UserResource` منفصل للـ show يحتوي على تفاصيل أكثر للمستخدم الواحد.

**قاعدة مهمة:** كل Resource يجب أن يرجع فقط البيانات التي يحتاجها الـ Frontend لتلك الصفحة المحددة.

### B. هيكل استجابة Login
```php
return ApiResponse::success([
    'tokenDetails' => [
        'token' => $token,
        'expiresIn' => $expiration
    ],
    'profile' => new LoginProfileResource($user),
    'role' => $user->roles->first()->name ?? 'guest',
    'permissions' => $this->userPermissionService->getUserPermissions($user) ?? [],
]);
```

استخدم `config('sanctum.expiration')` للحصول على مدة انتهاء الصلاحية.

### C. خدمة صلاحيات المستخدم
```php
<?php

namespace App\Services\UserRolePermission;

use Illuminate\Contracts\Auth\Authenticatable;
use Spatie\Permission\Models\Permission;

class UserPermissionService
{
    public function getUserPermissions(Authenticatable $user)
    {
        $permissions = Permission::all()->pluck('name')->toArray();
        return array_map(function ($permission) use ($user) {
            return [
                'permissionName' => $permission,
                'access' => $user->can($permission)
            ];
        }, $permissions);
    }
}
```

**ملاحظة مهمة:** في قاعدة البيانات نستخدم `snake_case` ولكن في API responses نحول إلى `camelCase`

### D. الاستجابة الموحدة (app/Helpers/ApiResponse.php)
فئة `ApiResponse` هي **مساعد مركزي** في Laravel مصمم لتوحيد هيكل استجابات JSON عبر API. يضمن أن جميع الاستجابات، سواء كانت ناجحة أو خاطئة، تتبع تنسيقاً متسقاً، مما يحسن القابلية للصيانة والقراءة.

#### الميزات الرئيسية

- **هيكل استجابة موحد:**  
  كل استجابة تتضمن علامة `success`، و `message`، وإما `data` (للاستجابات الناجحة) أو `errors` (للاستجابات الفاشلة)

- **استجابات النجاح:**  
  توفر الفئة طريقة لإرجاع استجابات ناجحة مع بيانات اختيارية ورسالة مخصصة

- **استجابات الخطأ:**  
  توفر الفئة طريقة لإرجاع استجابات خطأ مع قائمة اختيارية من الأخطاء ورسالة وصفية

### B. فشل التحقق (في FormRequests)
طريقة `failedValidation` هي **تجاوز مخصص** في Laravel FormRequests يتعامل مع فشل التحقق بطريقة موحدة.

#### الغرض
عندما تفشل قواعد التحقق في FormRequest، يقوم Laravel افتراضياً بإعادة التوجيه أو إرجاع استجابة عامة. تسمح طريقة `failedValidation` **باعتراض هذا الفشل** وإرجاع استجابة JSON منظمة باستخدام مساعد `ApiResponse`.

### C. Audit Migration Trait (app/Traits/CreatedUpdatedByMigration.php)
يوفر `CreatedUpdatedByMigration` trait **طريقة قابلة لإعادة الاستخدام لإضافة أعمدة المراجعة** إلى جداول قاعدة البيانات في migrations Laravel.

#### الغرض
- **إضافة أعمدة المراجعة:** يضيف الـ trait أعمدة `created_by` و `updated_by` إلى جدول قاعدة البيانات
- **الحفاظ على التكامل المرجعي:** كلا العمودين معرفان كمفاتيح خارجية تشير إلى جدول `users`

## 7. التعليمات النهائية
يجب استخدام `DB::transaction()`، `DB::commit()` و `DB::rollBack()`

### 📖 دليل تفاعل Swagger API للوكلاء الذكيين

هذا المستند يحدد القواعد التقنية التي يجب على الـ AI Agent اتباعها عند قراءة وتحليل بيانات الـ **Swagger (OpenAPI)** المضمنة في الأكواد.

## 🎯 1. المبدأ الأساسي
يجب اعتبار الـ **Swagger Annotations** هي المصدر النهائي للحقيقة فيما يخص:
* **المسارات:** الرابط ونوع الطلب
* **المعلمات:** ما يتم إرساله في الـ Header, Path, أو Query
* **جسم الطلب:** هيكل البيانات المطلوبة وأنواعها
* **الاستجابات:** النتائج المتوقعة لكل حالة

## 🔍 2. قواعد تحليل الطلبات

### **أ) الترويسات**
* **Accept-Language:** حقل إلزامي لتحديد لغة الرد (`ar`, `en`)
* **Authorization:** التحقق من وجود `security={{"sanctum":{}}}` لطلب توكن Bearer صالح

### **ب) معاملات البحث والترشيح**
* **filter[search]:** للبحث النصي الواسع في الحقول الأساسية
* **filter[status]:** فلترة دقيقة تعتمد على قيم الـ Enum المحددة
* **Pagination:** الالتزام بمعاملات `page` و `perPage`

### **ج) هيكل البيانات**
* العمليات التي تحتوي على ملفات يجب أن تستخدم `multipart/form-data`
* الالتزام التام بخصائص الـ `Property` من حيث الحقول المطلوبة ونوع البيانات

## 📤 3. قواعد تحليل المخرجات
* **Success (200/201):** استخراج كائن الـ `data` وتحليل محتوياته
* **Validation Error (422):** تحليل مصفوفة `errors`
* **Access Denied (401/403):** إدراك أن المشكلة تتعلق بالهوية أو الصلاحيات

## 🤖 4. توجيهات تنفيذية للـ AI Agent
1. **توليد الكود:** استخرج الحقول والروابط حصرياً من الـ Swagger
2. **التوثيق:** استخدم الـ `summary` والـ `description` لشرح وظيفة كل مسار
3. **الاختبار:** قم بتغطية جميع حالات الـ `Response`
4. **القيود المنطقية:** أي قيد مذكور في الـ `description` يعتبر قاعدة عمل لا يمكن تجاوزها

## ⚠️ 5. القيود والمحاذير
* لا تقترح أي معامل غير موجود في الـ Swagger Schema
* في حال تعارض الكود مع التوثيق، تكون الأولوية للتوثيق

## 8. Middleware في Laravel 12

### تطبيق Middleware على Controllers
في Laravel 12.43.1، يتم تطبيق middleware في constructor الخاص بالـ Controller:

```php
public function __construct(ServiceClass $service)
{
    $this->service = $service;
    
    // تطبيق middleware على جميع الطرق
    $this->middleware(['auth:sanctum', 'locale']);
    
    // تطبيق middleware على طرق محددة فقط
    $this->middleware('auth:sanctum')->only(['logout']);
    
    // استثناء طرق معينة من middleware
    $this->middleware('auth:sanctum')->except(['login', 'register']);
}
```

### مثال على AuthController
```php
class AuthController extends Controller
{
    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
        
        // Apply locale middleware to all methods
        $this->middleware('locale');
        
        // Apply auth middleware only to logout
        $this->middleware('auth:sanctum')->only(['logout']);
    }
}
```

### مثال على CategoryController مع Permissions
```php
class CategoryController extends Controller
{
    public function __construct(CategoryService $categoryService)
    {
        $this->categoryService = $categoryService;
        
        // Apply middleware using Laravel 12.43.1 approach
        $this->middleware(['auth:sanctum', 'locale']);
    }
}
```

### مثال على TodoController
```php
class TodoController extends Controller
{
    public function __construct(TodoService $todoService)
    {
        $this->todoService = $todoService;
        
        // Apply middleware using Laravel 12.43.1 approach
        $this->middleware(['auth:sanctum', 'locale']);
    }
}
```

### مثال على AuthController
```php
class AuthController extends Controller
{
    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
        
        // Apply locale middleware to all methods
        $this->middleware('locale');
        
        // Apply auth middleware only to logout
        $this->middleware('auth:sanctum')->only(['logout']);
    }
}
```

### ملاحظة مهمة حول HasMiddleware Interface
`HasMiddleware` interface مع `static middleware()` method غير متاح في Laravel 12.43.1. هذه الميزة متاحة في إصدارات أحدث من Laravel. لذلك نستخدم الطريقة التقليدية في constructor.

### قواعد Middleware في Laravel 12
- **Constructor Middleware**: تطبيق middleware في constructor للتحكم الدقيق
- **locale middleware**: يجب تطبيقه على جميع API controllers لدعم الترجمة
- **auth:sanctum**: للـ endpoints المحمية التي تحتاج authentication
- **only/except**: استخدم only() أو except() للتحكم في الطرق المحددة
- **ترتيب Middleware**: locale يأتي قبل auth للتأكد من تحديد اللغة أولاً

### SetLocaleMiddleware
يجب إنشاء middleware لتحديد اللغة من Accept-Language header:

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;

class SetLocaleMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $locale = $request->header('Accept-Language', 'en');
        
        $supportedLocales = ['ar', 'en'];
        if (in_array($locale, $supportedLocales)) {
            App::setLocale($locale);
        } else {
            App::setLocale('en');
        }

        return $next($request);
    }
}
```

### تسجيل Middleware في bootstrap/app.php
```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->alias([
        'locale' => \App\Http\Middleware\SetLocaleMiddleware::class,
    ]);
})
```

### تطبيق Middleware على Routes
```php
// تطبيق middleware على مجموعة routes
Route::prefix('v1')->middleware('locale')->group(function () {
    // Routes here will have locale middleware applied
});

// تطبيق عدة middleware
Route::middleware(['auth:sanctum', 'locale'])->group(function () {
    // Protected routes with authentication and localization
});
```

### قواعد Middleware في Laravel 12
- **Constructor Middleware**: تطبيق middleware في constructor للتحكم الدقيق
- **locale middleware**: يجب تطبيقه على جميع API controllers لدعم الترجمة
- **auth:sanctum**: للـ endpoints المحمية التي تحتاج authentication
- **only/except**: استخدم only() أو except() للتحكم في الطرق المحددة
- **ترتيب Middleware**: locale يأتي قبل auth للتأكد من تحديد اللغة أولاً

## 9. التعليمات النهائية
- اتبع PSR-12 واستخدم PHP 8.4 property promotion
- Controllers يجب أن تكون Resourceful أو Invokable
- لا تكتب منطق العمل داخل Controllers؛ استخدم Services
- استخدم دائماً `camelCase` للمتغيرات في API requests/responses و `snake_case` لحقول قاعدة البيانات
- **قاعدة التحويل:** Laravel Resources يجب أن تحول تلقائياً من `snake_case` (database) إلى `camelCase` (API response)

### فصل Controllers حسب المسؤولية
- **AuthController**: للعمليات المتعلقة بالمصادقة (login, logout, register, refresh token)
- **UserController**: لإدارة بيانات المستخدمين (CRUD operations, profile management)
- **فصل واضح**: لا تخلط عمليات المصادقة مع إدارة المستخدمين في نفس الـ Controller

### معايير الخدمات (Services)
- **البيانات المُستقبلة**: جميع الخدمات تستقبل البيانات بصيغة `camelCase` (مثل `categoryId`, `dueDate`, `languagePreference`)
- **التحويل الداخلي**: الخدمات تتعامل مع قاعدة البيانات بصيغة `snake_case` داخلياً
- **رسائل الخطأ**: رسائل التحقق من صحة البيانات يجب أن تستخدم `camelCase` للحقول
- **مثال على الاستخدام**:
```php
// في Controller
$todoData = $request->validated(); // يحتوي على categoryId, dueDate
$todo = $this->todoService->createTodo($user, $todoData);

// في Service
public function createTodo(User $user, array $data): Todo
{
    // $data يحتوي على categoryId, dueDate بصيغة camelCase
    $todo = Todo::create([
        'category_id' => $data['categoryId'], // تحويل لـ snake_case
        'due_date' => $data['dueDate'],
    ]);
}
```