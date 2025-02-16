import React, { useState } from "react";
import { router } from "@inertiajs/react";
import { Head } from "@inertiajs/react";
import { motion, AnimatePresence } from "framer-motion";
import {
    CheckCircleIcon,
    ExclamationTriangleIcon,
} from "@heroicons/react/24/solid";
import SignatureField from "@/Components/SignatureField";

export default function ProfessionalFormView({ form }) {
    const [values, setValues] = useState({});
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        const key = e.target.name;
        let value = e.target.value;

        // Handle different input types
        if (e.target.type === "file") {
            value = e.target.files[0];
        } else if (e.target.type === "checkbox") {
            const currentValues = values[key] || [];
            if (e.target.checked) {
                value = [...currentValues, e.target.value];
            } else {
                value = currentValues.filter((v) => v !== e.target.value);
            }
        }

        setValues((prevValues) => ({
            ...prevValues,
            [key]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setProcessing(true);

        // Create FormData for file uploads
        const formData = new FormData();
        Object.keys(values).forEach((key) => {
            const value = values[key];

            if (value instanceof File) {
                // Handle file uploads
                formData.append(key, value);
            } else if (Array.isArray(value)) {
                // Handle checkbox and signature array fields
                if (value.length > 0) {
                    value.forEach((val, index) => {
                        // For signature fields, stringify the object
                        if (typeof val === "object" && val.signature) {
                            formData.append(
                                `${key}[${index}]`,
                                JSON.stringify(val)
                            );
                        } else {
                            formData.append(`${key}[]`, val);
                        }
                    });
                }
            } else if (value && typeof value === "object" && value.signature) {
                // Wrap single signature in an array
                formData.append(`${key}[0]`, JSON.stringify(value));
            } else {
                // Handle other field types
                formData.append(key, value);
            }
        });

        router.post(route("forms.public.submit", form.slug), formData, {
            onSuccess: () => {
                setProcessing(false);
                setSubmitted(true);
                setValues({});
                setErrors({});
            },
            onError: (errors) => {
                setProcessing(false);
                setErrors(errors);
            },
        });
    };

    // Animations
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                delayChildren: 0.2,
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100,
            },
        },
    };

    if (submitted) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="min-h-screen bg-[#121212] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center"
            >
                <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="bg-[#1E1E1E] max-w-md w-full rounded-2xl shadow-2xl p-8 text-center"
                >
                    <CheckCircleIcon className="mx-auto h-16 w-16 text-[#c0ff80] mb-4" />
                    <h3 className="text-2xl font-bold text-[#c0ff80] mb-4">
                        Thank You!
                    </h3>
                    <p className="text-gray-400 mb-6">
                        Your response has been successfully submitted.
                    </p>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSubmitted(false)}
                        className="w-full py-3 bg-[#008080] text-white rounded-lg hover:bg-[#00a0a0] transition-colors duration-300"
                    >
                        Submit Another Response
                    </motion.button>
                </motion.div>
            </motion.div>
        );
    }

    return (
        <>
            <Head>
                <title>{form.title}</title>
            </Head>

            <motion.div
                initial="hidden"
                animate="visible"
                className="min-h-screen bg-[#121212] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center"
            >
                <motion.div
                    variants={containerVariants}
                    className="bg-[#1E1E1E] max-w-2xl w-full rounded-2xl shadow-2xl p-8 md:p-12"
                >
                    <motion.h1
                        variants={itemVariants}
                        className="text-3xl font-bold text-[#c0ff80] mb-6 text-center"
                    >
                        {form.title}
                    </motion.h1>

                    {form.description && (
                        <motion.p
                            variants={itemVariants}
                            className="text-gray-400 mb-8 text-center"
                        >
                            {form.description}
                        </motion.p>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <AnimatePresence>
                            {form.fields.map((field) => (
                                <motion.div
                                    key={field.id}
                                    variants={itemVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="hidden"
                                    className="mb-6"
                                >
                                    <motion.label
                                        variants={itemVariants}
                                        htmlFor={field.name}
                                        className="block text-sm font-medium text-[#c0ff80] mb-2"
                                    >
                                        {field.label}
                                        {field.is_required && (
                                            <span className="text-red-500 ml-1">
                                                *
                                            </span>
                                        )}
                                    </motion.label>

                                    {/* Render different input types with consistent styling */}
                                    {(() => {
                                        const baseInputClasses =
                                            "w-full bg-[#2C2C2C] border-2 border-transparent focus:border-[#008080] text-[#c0ff80] rounded-lg py-3 px-4 transition-all duration-300 ease-in-out";

                                        switch (field.type) {
                                            case "text":
                                                return (
                                                    <input
                                                        type="text"
                                                        name={field.name}
                                                        id={field.name}
                                                        value={
                                                            values[
                                                                field.name
                                                            ] || ""
                                                        }
                                                        onChange={handleChange}
                                                        placeholder={
                                                            field.placeholder
                                                        }
                                                        className={
                                                            baseInputClasses
                                                        }
                                                    />
                                                );
                                            case "textarea":
                                                return (
                                                    <textarea
                                                        name={field.name}
                                                        id={field.name}
                                                        value={
                                                            values[
                                                                field.name
                                                            ] || ""
                                                        }
                                                        onChange={handleChange}
                                                        placeholder={
                                                            field.placeholder
                                                        }
                                                        rows={4}
                                                        className={
                                                            baseInputClasses
                                                        }
                                                    />
                                                );
                                            case "email":
                                                return (
                                                    <input
                                                        type="email"
                                                        name={field.name}
                                                        id={field.name}
                                                        value={
                                                            values[
                                                                field.name
                                                            ] || ""
                                                        }
                                                        onChange={handleChange}
                                                        placeholder={
                                                            field.placeholder
                                                        }
                                                        className={
                                                            baseInputClasses
                                                        }
                                                    />
                                                );
                                            case "number":
                                                return (
                                                    <input
                                                        type="number"
                                                        name={field.name}
                                                        id={field.name}
                                                        value={
                                                            values[
                                                                field.name
                                                            ] || ""
                                                        }
                                                        onChange={handleChange}
                                                        placeholder={
                                                            field.placeholder
                                                        }
                                                        className={
                                                            baseInputClasses
                                                        }
                                                    />
                                                );
                                            case "date":
                                                return (
                                                    <input
                                                        type="date"
                                                        name={field.name}
                                                        id={field.name}
                                                        value={
                                                            values[
                                                                field.name
                                                            ] || ""
                                                        }
                                                        onChange={handleChange}
                                                        className={
                                                            baseInputClasses
                                                        }
                                                    />
                                                );
                                            case "select":
                                                return (
                                                    <select
                                                        name={field.name}
                                                        id={field.name}
                                                        value={
                                                            values[
                                                                field.name
                                                            ] || ""
                                                        }
                                                        onChange={handleChange}
                                                        className={
                                                            baseInputClasses
                                                        }
                                                    >
                                                        <option
                                                            value=""
                                                            className="bg-[#1E1E1E]"
                                                        >
                                                            Select an option
                                                        </option>
                                                        {field.options.map(
                                                            (option, index) => (
                                                                <option
                                                                    key={index}
                                                                    value={
                                                                        option.value
                                                                    }
                                                                    className="bg-[#1E1E1E]"
                                                                >
                                                                    {
                                                                        option.label
                                                                    }
                                                                </option>
                                                            )
                                                        )}
                                                    </select>
                                                );
                                            case "radio":
                                                return (
                                                    <div className="space-y-2">
                                                        {field.options.map(
                                                            (option, index) => (
                                                                <div
                                                                    key={index}
                                                                    className="flex items-center"
                                                                >
                                                                    <input
                                                                        type="radio"
                                                                        id={`${field.name}-${index}`}
                                                                        name={
                                                                            field.name
                                                                        }
                                                                        value={
                                                                            option.value
                                                                        }
                                                                        checked={
                                                                            values[
                                                                                field
                                                                                    .name
                                                                            ] ===
                                                                            option.value
                                                                        }
                                                                        onChange={
                                                                            handleChange
                                                                        }
                                                                        className="text-[#008080] focus:ring-[#008080] h-5 w-5"
                                                                    />
                                                                    <label
                                                                        htmlFor={`${field.name}-${index}`}
                                                                        className="ml-3 block text-sm text-[#c0ff80]"
                                                                    >
                                                                        {
                                                                            option.label
                                                                        }
                                                                    </label>
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                );
                                            case "checkbox":
                                                return (
                                                    <div className="space-y-2">
                                                        {field.options.map(
                                                            (option, index) => (
                                                                <div
                                                                    key={index}
                                                                    className="flex items-center"
                                                                >
                                                                    <input
                                                                        type="checkbox"
                                                                        id={`${field.name}-${index}`}
                                                                        name={
                                                                            field.name
                                                                        }
                                                                        value={
                                                                            option.value
                                                                        }
                                                                        checked={(
                                                                            values[
                                                                                field
                                                                                    .name
                                                                            ] ||
                                                                            []
                                                                        ).includes(
                                                                            option.value
                                                                        )}
                                                                        onChange={
                                                                            handleChange
                                                                        }
                                                                        className="text-[#008080] focus:ring-[#008080] h-5 w-5 rounded"
                                                                    />
                                                                    <label
                                                                        htmlFor={`${field.name}-${index}`}
                                                                        className="ml-3 block text-sm text-[#c0ff80]"
                                                                    >
                                                                        {
                                                                            option.label
                                                                        }
                                                                    </label>
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                );
                                            case "file":
                                                return (
                                                    <div className="relative">
                                                        <input
                                                            type="file"
                                                            name={field.name}
                                                            id={field.name}
                                                            onChange={
                                                                handleChange
                                                            }
                                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                        />
                                                        <div className="w-full bg-[#2C2C2C] border-2 border-dashed border-[#008080] rounded-lg py-4 px-4 text-center">
                                                            <p className="text-[#c0ff80]">
                                                                Drag and drop or
                                                                click to upload
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            case "signature":
                                                return (
                                                    <div className="relative">
                                                        {field.type ===
                                                            "signature" && (
                                                            <SignatureField
                                                                name={
                                                                    field.name
                                                                }
                                                                label={
                                                                    field.label
                                                                }
                                                                config={
                                                                    field.signature_config
                                                                }
                                                                onChange={
                                                                    handleChange
                                                                }
                                                            />
                                                        )}
                                                    </div>
                                                );
                                            default:
                                                return null;
                                        }
                                    })()}

                                    {/* Help Text */}
                                    {field.help_text && (
                                        <p className="mt-2 text-sm text-gray-400">
                                            {field.help_text}
                                        </p>
                                    )}

                                    {/* Error Message */}
                                    {errors[field.name] && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mt-2 flex items-center text-red-400 text-sm"
                                        >
                                            <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                                            {errors[field.name]}
                                        </motion.div>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        <motion.div
                            variants={itemVariants}
                            className="flex justify-end mt-8"
                        >
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                type="submit"
                                disabled={processing}
                                className="w-full md:w-auto bg-[#008080] text-white py-3 px-8 rounded-lg hover:bg-[#00a0a0] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? "Submitting..." : "Submit"}
                            </motion.button>
                        </motion.div>
                    </form>
                </motion.div>
            </motion.div>
        </>
    );
}
