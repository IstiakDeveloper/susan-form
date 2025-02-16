<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Form;
use App\Models\FormSubmission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Display the admin dashboard with key metrics and recent data
     */
    public function index()
    {
        // Total Forms
        $totalForms = Form::count();

        // Total Submissions
        $totalSubmissions = FormSubmission::count();

        // Submissions by Status
        $submissionsByStatus = FormSubmission::select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->get();

        // Recent Forms (Last 30 days)
        $recentForms = Form::where('created_at', '>=', now()->subDays(30))
            ->withCount('submissions')
            ->latest()
            ->take(5)
            ->get();

        // Recent Submissions
        $recentSubmissions = FormSubmission::with('form')
            ->latest()
            ->take(10)
            ->get();

        // Submissions Trend (Last 7 days)
        $submissionsTrend = FormSubmission::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('COUNT(*) as count')
        )
        ->where('created_at', '>=', now()->subDays(7))
        ->groupBy('date')
        ->orderBy('date')
        ->get();

        // Form Activity
        $formActivity = Form::select(
            'id',
            'title',
            DB::raw('(SELECT COUNT(*) FROM form_submissions WHERE form_submissions.form_id = forms.id) as submission_count')
        )
        ->orderByDesc('submission_count')
        ->take(5)
        ->get();

        return Inertia::render('Admin/Dashboard', [
            'metrics' => [
                'totalForms' => $totalForms,
                'totalSubmissions' => $totalSubmissions,
                'submissionsByStatus' => $submissionsByStatus,
            ],
            'recentForms' => $recentForms,
            'recentSubmissions' => $recentSubmissions,
            'submissionsTrend' => $submissionsTrend,
            'formActivity' => $formActivity,
        ]);
    }

    /**
     * Get detailed analytics for forms
     */
    public function analytics(Request $request)
    {
        // Filter options
        $timeframe = $request->input('timeframe', 'last_30_days');
        $formId = $request->input('form_id');

        // Date range calculation
        $dateRange = match($timeframe) {
            'last_7_days' => now()->subDays(7),
            'last_30_days' => now()->subDays(30),
            'last_90_days' => now()->subDays(90),
            default => now()->subDays(30)
        };

        // Submissions by Form
        $submissionsByForm = FormSubmission::select(
            'form_id',
            DB::raw('COUNT(*) as submission_count')
        )
        ->where('created_at', '>=', $dateRange)
        ->groupBy('form_id')
        ->with('form:id,title')
        ->get();

        // Detailed Form Submission Analysis
        $formSubmissionAnalytics = Form::withCount([
            'submissions' => function($query) use ($dateRange) {
                $query->where('created_at', '>=', $dateRange);
            }
        ])
        ->when($formId, function($query) use ($formId) {
            return $query->where('id', $formId);
        })
        ->get();

        // Submission Status Distribution
        $statusDistribution = FormSubmission::select(
            'status',
            DB::raw('COUNT(*) as count')
        )
        ->where('created_at', '>=', $dateRange)
        ->groupBy('status')
        ->get();

        return Inertia::render('Admin/Analytics', [
            'submissionsByForm' => $submissionsByForm,
            'formSubmissionAnalytics' => $formSubmissionAnalytics,
            'statusDistribution' => $statusDistribution,
            'filters' => [
                'timeframe' => $timeframe,
                'formId' => $formId
            ]
        ]);
    }

    /**
     * Export form submissions
     */
    public function export(Request $request)
    {
        $formId = $request->input('form_id');
        $format = $request->input('format', 'csv');

        $submissions = FormSubmission::when($formId, function($query) use ($formId) {
            return $query->where('form_id', $formId);
        })->get();

        // Implement export logic based on format
        switch($format) {
            case 'csv':
                return $this->exportToCSV($submissions);
            case 'xlsx':
                return $this->exportToExcel($submissions);
            case 'pdf':
                return $this->exportToPDF($submissions);
            default:
                return back()->with('error', 'Invalid export format');
        }
    }

    /**
     * Get form submission insights
     */
    public function insights(Request $request)
    {
        $formId = $request->input('form_id');

        // Unique Submissions
        $uniqueSubmissions = FormSubmission::when($formId, function($query) use ($formId) {
            return $query->where('form_id', $formId);
        })
        ->distinct('submitter_email')
        ->count('submitter_email');

        // Submission Frequency
        $submissionFrequency = FormSubmission::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('COUNT(*) as count')
        )
        ->when($formId, function($query) use ($formId) {
            return $query->where('form_id', $formId);
        })
        ->groupBy('date')
        ->orderBy('date')
        ->get();

        // IP Distribution
        $ipDistribution = FormSubmission::select(
            'submitter_ip',
            DB::raw('COUNT(*) as submission_count')
        )
        ->when($formId, function($query) use ($formId) {
            return $query->where('form_id', $formId);
        })
        ->groupBy('submitter_ip')
        ->orderByDesc('submission_count')
        ->take(10)
        ->get();

        return Inertia::render('Admin/Insights', [
            'uniqueSubmissions' => $uniqueSubmissions,
            'submissionFrequency' => $submissionFrequency,
            'ipDistribution' => $ipDistribution,
        ]);
    }

    /**
     * CSV Export Helper Method
     */
    private function exportToCSV($submissions)
    {
        $filename = 'form_submissions_' . now()->format('Y-m-d_H-i-s') . '.csv';

        $handle = fopen($filename, 'w+');
        fputcsv($handle, ['ID', 'Form', 'Submitted At', 'IP', 'Email', 'Status']);

        foreach ($submissions as $submission) {
            fputcsv($handle, [
                $submission->id,
                $submission->form->title,
                $submission->created_at,
                $submission->submitter_ip,
                $submission->submitter_email,
                $submission->status
            ]);
        }

        fclose($handle);

        return response()->download($filename)->deleteFileAfterSend(true);
    }

    /**
     * Additional export methods can be implemented similarly
     */
    private function exportToExcel($submissions) { /* Excel export logic */ }
    private function exportToPDF($submissions) { /* PDF export logic */ }
}
