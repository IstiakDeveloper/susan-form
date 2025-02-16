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
            'type' => 'required|in:text,textarea,email,number,date,select,radio,checkbox,file',
            'is_required' => 'boolean',
            'options' => 'nullable|array',
            'options.*.label' => 'required_with:options|string',
            'options.*.value' => 'required_with:options|string',
            'placeholder' => 'nullable|string',
            'help_text' => 'nullable|string',
        ]);

        // Generate field name from label
        $validated['name'] = Str::slug($validated['label']);

        // Set order to be last
        $validated['order'] = $form->fields()->count();

        $form->fields()->create($validated);

        return back()->with('message', 'Field added successfully');
    }

    public function update(Request $request, Form $form, FormField $field)
    {
        $validated = $request->validate([
            'label' => 'required|string|max:255',
            'type' => 'required|in:text,textarea,email,number,date,select,radio,checkbox,file',
            'is_required' => 'boolean',
            'options' => 'nullable|array',
            'options.*.label' => 'required_with:options|string',
            'options.*.value' => 'required_with:options|string',
            'placeholder' => 'nullable|string',
            'help_text' => 'nullable|string',
            'order' => 'required|integer',
        ]);

        // Update field name if label changed
        $validated['name'] = Str::slug($validated['label']);

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
