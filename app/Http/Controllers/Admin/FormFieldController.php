<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Form;
use App\Models\FormField;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class FormFieldController extends Controller
{

    public function store(Request $request, Form $form)
    {
        $validated = $request->validate([
            'label' => 'required|string|max:255',
            'type' => 'required|in:text,textarea,email,number,date,select,radio,checkbox,file,signature',
            'is_required' => 'boolean',
            'options' => 'nullable|array',
            'signature_config' => 'nullable|array',
            'placeholder' => 'nullable|string',
            'help_text' => 'nullable|string',
        ]);

        // Generate field name from label
        $validated['name'] = Str::slug($validated['label']);

        // Set order to be last
        $validated['order'] = $form->fields()->count();

        // Handle signature configuration
        if ($validated['type'] === 'signature') {
            $validated['options'] = $request->input('signature_config', [
                'show_date' => false,
                'show_print_name' => false
            ]);
        }

        $form->fields()->create($validated);

        return back()->with('message', 'Field added successfully');
    }

    public function update(Request $request, Form $form, FormField $field)
    {
        $validated = $request->validate([
            'label' => 'required|string|max:255',
            'type' => 'required|in:text,textarea,email,number,date,select,radio,checkbox,file,signature',
            'is_required' => 'boolean',
            'options' => 'nullable|array',
            'signature_config' => 'nullable|array',
            'placeholder' => 'nullable|string',
            'help_text' => 'nullable|string',
        ]);

        // Generate field name from label
        $validated['name'] = Str::slug($validated['label']);

        // Handle signature configuration
        if ($validated['type'] === 'signature') {
            $validated['options'] = $request->input('signature_config', [
                'show_date' => false,
                'show_print_name' => false
            ]);
        }

        $field->update($validated);

        return back()->with('message', 'Field updated successfully');
    }

    public function destroy(Form $form, FormField $field)
    {
        $field->delete();

        // Reorder remaining fields
        $form->fields()->where('order', '>', $field->order)
            ->decrement('order');

        return back()->with('message', 'Field deleted successfully');
    }

    public function reorder(Request $request, Form $form)
    {
        $request->validate([
            'fields' => 'required|array',
            'fields.*.id' => 'required|exists:form_fields,id',
            'fields.*.order' => 'required|integer',
        ]);

        foreach ($request->fields as $field) {
            FormField::where('id', $field['id'])
                ->update(['order' => $field['order']]);
        }

        return back()->with('message', 'Fields reordered successfully');
    }
}
