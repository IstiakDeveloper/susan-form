import React, { useState } from "react";
import { Head, usePage, useForm } from "@inertiajs/react";
import {
    PencilIcon,
    TrashIcon,
    PlusIcon,
    Bars3Icon,
} from "@heroicons/react/24/outline";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    arrayMove,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
    SortableContext,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import FormFieldEditModal from "./FormFieldEditModal";
import AdminLayout from "@/Layouts/AdminLayout";

// Sortable Item Component
function SortableItem({ field, onEdit, onDelete, form }) {
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id: field.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex justify-between items-center bg-gray-100 p-4 rounded-md"
        >
            <div className="flex items-center space-x-3">
                <div
                    {...attributes}
                    {...listeners}
                    className="cursor-move text-gray-500 hover:text-gray-700"
                >
                    <Bars3Icon className="w-5 h-5" />
                </div>
                <div>
                    <p className="font-medium text-gray-800">{field.label}</p>
                    <p className="text-sm text-gray-600">
                        Type: {field.type}
                        {field.is_required && (
                            <span className="ml-2 text-red-500">
                                (Required)
                            </span>
                        )}
                    </p>
                </div>
            </div>
            <div className="flex space-x-2">
                <button
                    onClick={() => onEdit(field)}
                    className="text-blue-600 hover:text-blue-800"
                >
                    <PencilIcon className="w-5 h-5" />
                </button>
                <button
                    onClick={() => onDelete(form.id, field.id)}
                    className="text-red-600 hover:text-red-800"
                >
                    <TrashIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}

export default function Edit({ form }) {
    const [selectedField, setSelectedField] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [fields, setFields] = useState(usePage().props.formFields || []);

    const { post, delete: destroy } = useForm();

    // Sensors for different input types
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleEditField = (field) => {
        setSelectedField(field);
        setIsEditModalOpen(true);
    };

    const handleDeleteField = (formId, fieldId) => {
        if (confirm("Are you sure you want to delete this field?")) {
            destroy(
                route("admin.forms.fields.destroy", {
                    form: formId,
                    field: fieldId,
                })
            );
        }
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setSelectedField(null);
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (!active || !over || active.id === over.id) return;

        const oldIndex = fields.findIndex((item) => item.id === active.id);
        const newIndex = fields.findIndex((item) => item.id === over.id);

        const reorderedFields = arrayMove(fields, oldIndex, newIndex);

        // Send reorder request with FormData to ensure proper transmission
        const formData = new FormData();
        reorderedFields.forEach((field, index) => {
            formData.append(`fields[${index}][id]`, field.id);
            formData.append(`fields[${index}][order]`, index);
        });

        axios
            .post(
                route("admin.forms.fields.reorder", { form: form.id }),
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            )
            .then((response) => {
                // Update local state on successful reorder
                setFields(reorderedFields);
            })
            .catch((error) => {
                console.error(
                    "Reorder failed",
                    error.response ? error.response.data : error
                );
                // Optionally show error message to user
            });
    };

    return (
        <AdminLayout>
        <div className="container mx-auto px-4 py-6">
            <Head title={`Edit Form: ${form.name}`} />

            <div className="bg-white shadow-md rounded-lg p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">
                        Edit Form: {form.name}
                    </h1>
                </div>

                {/* Form Fields Section */}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-700">
                            Form Fields
                        </h2>
                        <button
                            onClick={() => {
                                setSelectedField(null);
                                setIsEditModalOpen(true);
                            }}
                            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            <PlusIcon className="w-5 h-5 mr-2" />
                            Add Field
                        </button>
                    </div>

                    {/* Drag and Drop Context */}
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={fields.map((field) => field.id)}
                            strategy={rectSortingStrategy}
                        >
                            <div className="space-y-3">
                                {fields.length === 0 ? (
                                    <p className="text-gray-500 text-center py-4">
                                        No fields have been added yet.
                                    </p>
                                ) : (
                                    fields.map((field) => (
                                        <SortableItem
                                            key={field.id}
                                            field={field}
                                            onEdit={handleEditField}
                                            onDelete={handleDeleteField}
                                            form={form}
                                        />
                                    ))
                                )}
                            </div>
                        </SortableContext>
                    </DndContext>
                </div>
            </div>

            {/* Form Field Edit Modal */}
            {isEditModalOpen && (
                <FormFieldEditModal
                    field={selectedField}
                    formId={form.id}
                    onClose={closeEditModal}
                />
            )}
        </div>
        </AdminLayout>
    );
}
