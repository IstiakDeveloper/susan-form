<?php

namespace App\Http\Controllers;

use App\Models\Form;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PublicFormController extends Controller
{
    public function show($slug)
    {
        $form = Form::where('slug', $slug)
            ->where('is_active', true)
            ->where(function($query) {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->with('fields')
            ->firstOrFail();

        return Inertia::render('Forms/Public/Show', [
            'form' => $form
        ]);
    }

    public function submit(Request $request, $slug)
    {
        $form = Form::where('slug', $slug)
            ->where('is_active', true)
            ->where(function($query) {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->with('fields')
            ->firstOrFail();

        // Build validation rules based on form fields
        $rules = [];
        foreach ($form->fields as $field) {
            $fieldRules = ['required_if:' . $field->name . '_filled,true'];

            if ($field->is_required) {
                $fieldRules = ['required'];
            }

            switch ($field->type) {
                case 'email':
                    $fieldRules[] = 'email';
                    break;
                case 'number':
                    $fieldRules[] = 'numeric';
                    break;
                case 'date':
                    $fieldRules[] = 'date';
                    break;
                case 'file':
                    $fieldRules[] = 'file';
                    $fieldRules[] = 'max:10240'; // 10MB max
                    break;
            }

            if (in_array($field->type, ['select', 'radio'])) {
                $options = collect($field->options)->pluck('value')->toArray();
                $fieldRules[] = 'in:' . implode(',', $options);
            }

            if ($field->type === 'checkbox') {
                $fieldRules[] = 'array';
                $options = collect($field->options)->pluck('value')->toArray();
                $fieldRules[] = 'in:' . implode(',', $options);
            }

            $rules[$field->name] = $fieldRules;
        }

        $validated = $request->validate($rules);

        // Handle file uploads
        foreach ($form->fields as $field) {
            if ($field->type === 'file' && isset($validated[$field->name])) {
                $path = $request->file($field->name)->store('form-uploads');
                $validated[$field->name] = $path;
            }
        }

        // Create submission
        $form->submissions()->create([
            'data' => $validated,
            'submitter_ip' => $request->ip(),
            'submitter_email' => $validated['email'] ?? null,
        ]);

        return back()->with('message', 'Form submitted successfully');
    }
}
