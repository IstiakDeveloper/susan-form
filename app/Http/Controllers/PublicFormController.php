<?php

namespace App\Http\Controllers;

use App\Models\Form;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Str;

class PublicFormController extends Controller
{
    public function show($slug)
    {
        $form = Form::where('slug', $slug)
            ->where('is_active', true)
            ->where(function ($query) {
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
            ->with('fields')
            ->firstOrFail();

        // Validation rules
        $rules = [];
        foreach ($form->fields as $field) {
            $fieldRules = [];

            if ($field->is_required) {
                $fieldRules[] = 'required';
            }

            if ($field->type === 'signature') {
                $fieldRules[] = 'array';
                $fieldRules[] = function ($attribute, $value, $fail) {
                    if (!is_array($value) || empty($value)) {
                        $fail('Signature is required and must be an array.');
                    }

                    foreach ($value as $signature) {
                        if (is_string($signature)) {
                            $signature = json_decode($signature, true);
                        }

                        if (!is_array($signature) || !isset($signature['signature']) || !$signature['signature']) {
                            $fail('Each signature must contain a valid signature image.');
                        }
                    }
                };
            }

            $rules[$field->name] = $fieldRules;
        }

        $validated = $request->validate($rules);

        // Handle signature fields
        foreach ($form->fields as $field) {
            if ($field->type === 'signature' && isset($validated[$field->name])) {
                $processedSignatures = [];

                foreach ($validated[$field->name] as $signatureEntry) {
                    if (is_string($signatureEntry)) {
                        $signatureData = json_decode($signatureEntry, true);
                    } else {
                        $signatureData = $signatureEntry;
                    }

                    // Remove data URI prefix
                    $base64Image = preg_replace('/^data:image\/\w+;base64,/', '', $signatureData['signature']);

                    // Decode base64
                    $imageData = base64_decode($base64Image);

                    // Generate filename
                    $filename = uniqid() . '.png';
                    $fullPath = public_path('storage/signatures/' . $filename);

                    // Ensure directory exists
                    if (!file_exists(public_path('storage/signatures'))) {
                        mkdir(public_path('storage/signatures'), 0755, true);
                    }

                    // Write file directly
                    file_put_contents($fullPath, $imageData);

                    // Add to processed signatures
                    $processedSignatures[] = [
                        'signature' => 'storage/signatures/' . $filename,
                        'printed_name' => $signatureData['printed_name'] ?? null,
                        'date' => $signatureData['date'] ?? now()->toDateString()
                    ];
                }

                // Replace original data with processed signatures
                $validated[$field->name] = $processedSignatures;
            }
        }

        // Create submission
        $submission = $form->submissions()->create([
            'data' => $validated,
            'submitter_ip' => $request->ip(),
        ]);

        return back()->with('message', 'Form submitted successfully');
    }
}
