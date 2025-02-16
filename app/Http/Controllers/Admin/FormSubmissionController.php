<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Form;
use App\Models\FormSubmission;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Response;

class FormSubmissionController extends Controller
{
    public function index(Form $form)
    {
        $submissions = $form->submissions()
            ->latest()
            ->paginate(10);

        return Inertia::render('Admin/Forms/Submissions/Index', [
            'form' => $form->only('id', 'title'),
            'submissions' => $submissions
        ]);
    }

    public function show(Form $form, FormSubmission $submission)
    {
        // Ensure the submission belongs to the form
        if ($submission->form_id !== $form->id) {
            abort(403, 'Unauthorized access');
        }

        return Inertia::render('Admin/Forms/Submissions/Show', [
            'form' => $form->load('fields'),
            'submission' => $submission
        ]);
    }

    public function update(Request $request, Form $form, FormSubmission $submission)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,reviewed,spam'
        ]);

        $submission->update($validated);

        return back()->with('message', 'Submission status updated successfully');
    }

    public function destroy(Form $form, FormSubmission $submission)
    {
        $submission->delete();

        return back()->with('message', 'Submission deleted successfully');
    }

    public function export(Form $form)
    {
        $submissions = $form->submissions()->with('form.fields')->get();

        // Create CSV headers
        $headers = collect(['Submission Date', 'Status']);
        $form->fields->each(function ($field) use ($headers) {
            $headers->push($field->label);
        });

        // Create CSV content
        $csv = $headers->join(',') . "\n";

        foreach ($submissions as $submission) {
            $row = collect([
                $submission->created_at->format('Y-m-d H:i:s'),
                $submission->status
            ]);

            // Add field values
            foreach ($form->fields as $field) {
                $row->push($submission->data[$field->name] ?? 'N/A');
            }

            $csv .= $row->join(',') . "\n";
        }

        return Response::stream(
            function () use ($csv) {
                echo $csv;
            },
            200,
            [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => 'attachment; filename="' . $form->slug . '-submissions.csv"',
            ]
        );
    }
}
