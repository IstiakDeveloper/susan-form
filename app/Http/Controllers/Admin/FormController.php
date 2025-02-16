<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Form;
use App\Models\FormField;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class FormController extends Controller
{
    public function index()
    {
        $forms = Form::with('creator')
            ->withCount('submissions')
            ->latest()
            ->paginate(10);

        return Inertia::render('Admin/Forms/Index', [
            'forms' => $forms
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
