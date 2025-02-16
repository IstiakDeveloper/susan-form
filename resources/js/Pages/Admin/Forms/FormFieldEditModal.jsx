import React, { useState, useRef } from "react";
import { useForm } from "@inertiajs/react";
import PropTypes from "prop-types";
import SignatureCanvas from "react-signature-canvas";
import {
    PencilIcon,
    TrashIcon,
    CheckIcon,
    XMarkIcon,
    PaintBrushIcon,
} from "@heroicons/react/24/outline";

const FormFieldEditModal = ({ field = null, formId, onClose }) => {
    // Field type options (now including signature)
    const fieldTypes = [
        "text",
        "textarea",
        "email",
        "number",
        "date",
        "select",
        "radio",
        "checkbox",
        "file",
        "signature",
    ];

    // Prepare initial form data
    const initialData = field
        ? {
              label: field.label || "",
              type: field.type || "text",
              is_required: field.is_required || false,
              placeholder: field.placeholder || "",
              help_text: field.help_text || "",
              options: field.options || [],
              signature_config: field.signature_config || {
                  show_date: false,
                  show_print_name: false,
              },
          }
        : {
              label: "",
              type: "text",
              is_required: false,
              placeholder: "",
              help_text: "",
              options: [],
              signature_config: {
                  show_date: false,
                  show_print_name: false,
              },
          };

    const { data, setData, errors, processing, submit } = useForm(initialData);

    // Signature configuration handling
    const handleSignatureConfigChange = (key, value) => {
        setData("signature_config", {
            ...data.signature_config,
            [key]: value,
        });
    };

    // Dynamic option management
    const handleOptionChange = (index, key, value) => {
        const updatedOptions = [...(data.options || [])];
        updatedOptions[index] = {
            ...updatedOptions[index],
            [key]: value,
        };
        setData("options", updatedOptions);
    };

    const addOption = () => {
        setData("options", [...(data.options || []), { label: "", value: "" }]);
    };

    const removeOption = (index) => {
        const updatedOptions = (data.options || []).filter(
            (_, i) => i !== index
        );
        setData("options", updatedOptions);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Determine if we're creating or updating
        if (field) {
            // Update existing field
            submit(
                "put",
                route("admin.forms.fields.update", {
                    form: formId,
                    field: field.id,
                }),
                {
                    preserveScroll: true,
                    onSuccess: () => onClose(),
                }
            );
        } else {
            // Create new field
            submit(
                "post",
                route("admin.forms.fields.store", {
                    form: formId,
                }),
                {
                    preserveScroll: true,
                    onSuccess: () => onClose(),
                }
            );
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-[600px] max-h-[90vh] overflow-y-auto p-6">
                <div className="flex justify-between items-center border-b pb-4 mb-4">
                    <h2 className="text-xl font-bold flex items-center">
                        <PencilIcon className="mr-2 w-5 h-5 text-blue-600" />
                        {field ? "Edit Form Field" : "Add New Form Field"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Label Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Label
                            <input
                                type="text"
                                value={data.label}
                                onChange={(e) =>
                                    setData("label", e.target.value)
                                }
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
                                required
                            />
                            {errors.label && (
                                <p className="text-red-500 text-xs mt-1">
                                    {errors.label}
                                </p>
                            )}
                        </label>
                    </div>

                    {/* Field Type Select */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Field Type
                            <select
                                value={data.type}
                                onChange={(e) => {
                                    // Reset options when changing type
                                    const newType = e.target.value;
                                    setData((prev) => ({
                                        ...prev,
                                        type: newType,
                                        options: [
                                            "select",
                                            "radio",
                                            "checkbox",
                                        ].includes(newType)
                                            ? []
                                            : undefined,
                                    }));
                                }}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
                                required
                            >
                                {fieldTypes.map((type) => (
                                    <option key={type} value={type}>
                                        {type.charAt(0).toUpperCase() +
                                            type.slice(1)}
                                    </option>
                                ))}
                            </select>
                            {errors.type && (
                                <p className="text-red-500 text-xs mt-1">
                                    {errors.type}
                                </p>
                            )}
                        </label>
                    </div>

                    {/* Required Checkbox */}
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            checked={data.is_required}
                            onChange={(e) =>
                                setData("is_required", e.target.checked)
                            }
                            className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <label className="ml-2 block text-sm text-gray-900">
                            Is this field required?
                        </label>
                    </div>

                    {/* Placeholder */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Placeholder
                            <input
                                type="text"
                                value={data.placeholder}
                                onChange={(e) =>
                                    setData("placeholder", e.target.value)
                                }
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
                            />
                        </label>
                    </div>

                    {/* Help Text */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Help Text
                            <textarea
                                value={data.help_text}
                                onChange={(e) =>
                                    setData("help_text", e.target.value)
                                }
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
                                rows={3}
                            />
                        </label>
                    </div>

                    {/* Dynamic Options for Select, Radio, Checkbox */}
                    {["select", "radio", "checkbox"].includes(data.type) && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Options
                            </label>
                            {(data.options || []).map((option, index) => (
                                <div
                                    key={index}
                                    className="flex space-x-2 mb-2"
                                >
                                    <input
                                        type="text"
                                        placeholder="Label"
                                        value={option.label}
                                        onChange={(e) =>
                                            handleOptionChange(
                                                index,
                                                "label",
                                                e.target.value
                                            )
                                        }
                                        className="flex-1 rounded-md border-gray-300 shadow-sm"
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder="Value"
                                        value={option.value}
                                        onChange={(e) =>
                                            handleOptionChange(
                                                index,
                                                "value",
                                                e.target.value
                                            )
                                        }
                                        className="flex-1 rounded-md border-gray-300 shadow-sm"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeOption(index)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}

                            {data.type === "signature" && (
                                <div className="bg-gray-50 p-4 rounded-md">
                                    <h3 className="text-md font-semibold text-gray-700 mb-3 flex items-center">
                                        <PaintBrushIcon className="mr-2 w-5 h-5 text-blue-600" />
                                        Signature Field Configuration
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id="show-date"
                                                checked={
                                                    data.signature_config
                                                        .show_date
                                                }
                                                onChange={(e) =>
                                                    handleSignatureConfigChange(
                                                        "show_date",
                                                        e.target.checked
                                                    )
                                                }
                                                className="rounded text-blue-600 focus:ring-blue-500 mr-2"
                                            />
                                            <label
                                                htmlFor="show-date"
                                                className="text-sm text-gray-700"
                                            >
                                                Show Date with Signature
                                            </label>
                                        </div>
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id="show-print-name"
                                                checked={
                                                    data.signature_config
                                                        .show_print_name
                                                }
                                                onChange={(e) =>
                                                    handleSignatureConfigChange(
                                                        "show_print_name",
                                                        e.target.checked
                                                    )
                                                }
                                                className="rounded text-blue-600 focus:ring-blue-500 mr-2"
                                            />
                                            <label
                                                htmlFor="show-print-name"
                                                className="text-sm text-gray-700"
                                            >
                                                Allow Printed Name Input
                                            </label>
                                        </div>
                                        <div className="text-sm text-gray-500 italic">
                                            These options will be applied when
                                            rendering the signature field.
                                        </div>
                                    </div>
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={addOption}
                                className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                            >
                                <CheckIcon className="mr-1 w-4 h-4" /> Add
                                Option
                            </button>
                        </div>
                    )}

                    {/* Submit Buttons */}
                    <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 flex items-center"
                        >
                            <XMarkIcon className="mr-2 w-5 h-5" /> Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center disabled:opacity-50"
                        >
                            {processing
                                ? "Saving..."
                                : field
                                ? "Update Field"
                                : "Add Field"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// PropTypes for type checking and documentation
FormFieldEditModal.propTypes = {
    field: PropTypes.shape({
      id: PropTypes.number,
      label: PropTypes.string,
      type: PropTypes.string,
      is_required: PropTypes.bool,
      placeholder: PropTypes.string,
      help_text: PropTypes.string,
      options: PropTypes.arrayOf(PropTypes.shape({
        label: PropTypes.string,
        value: PropTypes.string
      })),
      signature_config: PropTypes.shape({
        show_date: PropTypes.bool,
        show_print_name: PropTypes.bool
      })
    }),
    formId: PropTypes.number.isRequired,
    onClose: PropTypes.func.isRequired
  };

  export default FormFieldEditModal;
