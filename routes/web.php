<?php

use App\Http\Controllers\Admin\FormController;
use App\Http\Controllers\Admin\FormFieldController;
use App\Http\Controllers\Admin\FormSubmissionController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PublicFormController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Welcome page
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// Dashboard
Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

// Profile Routes
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Admin Routes
Route::middleware(['auth'])->prefix('admin')->name('admin.')->group(function () {
    // Admin Dashboard
    Route::get('/dashboard', function () {
        return Inertia::render('Admin/Dashboard');
    })->name('dashboard');

    // Forms Management
    Route::controller(FormController::class)->group(function () {
        Route::get('/forms', 'index')->name('forms.index');
        Route::get('/forms/create', 'create')->name('forms.create');
        Route::post('/forms', 'store')->name('forms.store');
        Route::get('/forms/{form}', 'show')->name('forms.show');
        Route::get('/forms/{form}/edit', 'edit')->name('forms.edit');
        Route::put('/forms/{form}', 'update')->name('forms.update');
        Route::delete('/forms/{form}', 'destroy')->name('forms.destroy');
    });

    // Form Fields
    Route::controller(FormFieldController::class)->group(function () {
        Route::post('/forms/{form}/fields', 'store')->name('forms.fields.store');
        Route::put('/forms/{form}/fields/{field}', 'update')->name('forms.fields.update');
        Route::delete('/forms/{form}/fields/{field}', 'destroy')->name('forms.fields.destroy');


        Route::post('/forms/{form}/fields/reorder', 'reorder')->name('forms.fields.reorder');

    });

    // Form Submissions
    Route::controller(FormSubmissionController::class)->group(function () {
        Route::get('/forms/{form}/submissions', 'index')->name('forms.submissions.index');
        Route::get('/forms/{form}/submissions/{submission}', 'show')->name('forms.submissions.show');
        Route::put('/forms/{form}/submissions/{submission}', 'update')->name('forms.submissions.update');
        Route::delete('/forms/{form}/submissions/{submission}', 'destroy')->name('forms.submissions.destroy');
        Route::post('/forms/{form}/submissions/export', 'export')->name('forms.submissions.export');
    });
});

// Public Form Routes
Route::controller(PublicFormController::class)->group(function () {
    Route::get('/f/{slug}', 'show')->name('forms.public.show');
    Route::post('/f/{slug}/submit', 'submit')->name('forms.public.submit');
});

// Auth Routes
require __DIR__.'/auth.php';
