<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Form;
use App\Models\FormField;
use App\Models\FormSubmission;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class FormController extends Controller
{
    public function index(Request $request)
    {
        // Base query with eager loading and counts
        $query = Form::with([
            'creator' => function ($query) {
                $query->select('id', 'name', 'email');
            }
        ])
            ->withCount('submissions')
            ->withCount(['submissions as recent_submissions_count' => function ($query) {
                $query->where('created_at', '>=', now()->subDays(30));
            }]);

        // Search Filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhereHas('creator', function ($subQuery) use ($search) {
                        $subQuery->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        // Status Filtering
        if ($request->filled('status')) {
            switch ($request->status) {
                case 'active':
                    $query->where('is_active', true)
                        ->where(function ($q) {
                            $q->whereNull('expires_at')
                                ->orWhere('expires_at', '>', now());
                        });
                    break;
                case 'inactive':
                    $query->where(function ($q) {
                        $q->where('is_active', false)
                            ->orWhere('expires_at', '<=', now());
                    });
                    break;
                case 'expiring_soon':
                    $query->where('expires_at', '<=', now()->addDays(7))
                        ->where('expires_at', '>', now());
                    break;
            }
        }

        // Date Range Filtering
        if ($request->filled('date_from') && $request->filled('date_to')) {
            $query->whereBetween('created_at', [
                Carbon::parse($request->date_from)->startOfDay(),
                Carbon::parse($request->date_to)->endOfDay()
            ]);
        }

        // Submissions Count Filtering
        if ($request->filled('submissions_min') || $request->filled('submissions_max')) {
            $query->having('submissions_count', '>=', $request->submissions_min ?? 0)
                ->when($request->filled('submissions_max'), function ($q) use ($request) {
                    $q->having('submissions_count', '<=', $request->submissions_max);
                });
        }

        // Sorting
        $sortField = $request->get('sort', 'created_at');
        $sortDirection = $request->get('direction', 'desc');

        // Allowed sort fields with their corresponding database columns
        $sortFields = [
            'title' => 'title',
            'created_at' => 'created_at',
            'submissions_count' => 'submissions_count',
            'is_active' => 'is_active'
        ];

        // Apply sorting if field is allowed
        if (isset($sortFields[$sortField])) {
            $query->orderBy($sortFields[$sortField], $sortDirection);
        }

        // Pagination
        $perPage = $request->get('per_page', 10);

        // Fetch forms with pagination
        $forms = $query->paginate($perPage)->withQueryString();

        // Prepare Analytics
        $analytics = [
            'total_forms' => Form::count(),
            'active_forms' => Form::where('is_active', true)
                ->where(function ($q) {
                    $q->whereNull('expires_at')
                        ->orWhere('expires_at', '>', now());
                })->count(),
            'total_submissions' => FormSubmission::count(),
            'recent_submissions' => FormSubmission::with('form')
                ->latest()
                ->take(5)
                ->get(),
            'form_activity' => Form::select(
                'id',
                'title',
                DB::raw('(SELECT COUNT(*) FROM form_submissions WHERE form_submissions.form_id = forms.id) as submission_count')
            )
                ->orderByDesc('submission_count')
                ->take(5)
                ->get(),
            'submissions_by_status' => FormSubmission::select('status', DB::raw('COUNT(*) as count'))
                ->groupBy('status')
                ->get()
        ];

        // Return Inertia response
        return Inertia::render('Admin/Forms/Index', [
            'forms' => $forms,
            'analytics' => $analytics,
            'filters' => [
                'search' => $request->search,
                'status' => $request->status,
                'date_from' => $request->date_from,
                'date_to' => $request->date_to,
                'submissions_min' => $request->submissions_min,
                'submissions_max' => $request->submissions_max,
                'sort' => $sortField,
                'direction' => $sortDirection,
                'per_page' => $perPage
            ]
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Forms/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'expires_at' => 'nullable|date',
        ]);

        $validated['created_by'] = auth()->id();
        $validated['slug'] = Str::slug($validated['title']) . '-' . Str::random(6);

        $form = Form::create($validated);

        return redirect()->route('admin.forms.edit', $form)
            ->with('message', 'Form created successfully');
    }

    public function show(Form $form)
    {
        return Inertia::render('Admin/Forms/Show', [
            'form' => $form->load('fields'),
            'shareableLink' => route('forms.public.show', $form->slug)
        ]);
    }

    public function edit(Form $form)
    {
        // Eager load fields with proper ordering
        $formFields = $form->fields()->orderBy('order')->get();

        return Inertia::render('Admin/Forms/Edit', [
            'form' => $form,
            'formFields' => $formFields
        ]);
    }

    public function update(Request $request, Form $form)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'expires_at' => 'nullable|date',
        ]);

        $form->update($validated);

        return back()->with('message', 'Form updated successfully');
    }

    public function destroy(Form $form)
    {
        $form->delete();

        return redirect()->route('admin.forms.index')
            ->with('message', 'Form deleted successfully');
    }

    public function reorder(Request $request, Form $form)
    {
        \Log::info('Reorder request received', [
            'form_id' => $form->id,
            'fields' => $request->input('fields')
        ]);

        $validated = $request->validate([
            'fields' => 'required|array',
            'fields.*.id' => [
                'required',
                Rule::exists('form_fields', 'id')->where(function ($query) use ($form) {
                    return $query->where('form_id', $form->id);
                })
            ],
            'fields.*.order' => 'required|integer|min:0',
        ]);

        try {
            DB::transaction(function () use ($validated, $form) {
                foreach ($validated['fields'] as $fieldData) {
                    $field = FormField::findOrFail($fieldData['id']);

                    // Ensure field belongs to the form
                    if ($field->form_id !== $form->id) {
                        throw new \Exception('Field does not belong to this form');
                    }

                    $field->update(['order' => $fieldData['order']]);
                }
            });

            return response()->json([
                'message' => 'Fields reordered successfully',
                'fields' => $form->fields()->orderBy('order')->get()
            ]);
        } catch (\Exception $e) {
            \Log::error('Reorder failed', ['error' => $e->getMessage()]);

            return response()->json([
                'message' => 'Failed to reorder fields',
                'error' => $e->getMessage()
            ], 422);
        }
    }
}
