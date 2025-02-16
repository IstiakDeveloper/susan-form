import React, { useState, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";

const SignatureField = ({
    name,
    label,
    config = { show_date: false, show_print_name: false },
    onChange,
    value,
}) => {
    const [signatureData, setSignatureData] = useState(
        value || {
            signature: null,
            printed_name: "",
            date: new Date().toISOString().split("T")[0],
        }
    );

    const handleSignatureEnd = () => {
        const signatureImage = signatureRef.current.toDataURL("image/png");
        const updatedData = {
            ...signatureData,
            signature: signatureImage,
        };
        setSignatureData(updatedData);
        onChange &&
            onChange({
                target: {
                    name,
                    value: updatedData,
                },
            });
    };

    const signatureRef = useRef(null);

    const handleClear = () => {
        signatureRef.current.clear();
        const updatedData = {
            ...signatureData,
            signature: null,
        };
        setSignatureData(updatedData);
        onChange &&
            onChange({
                target: {
                    name,
                    value: updatedData,
                },
            });
    };

    const handlePrintedNameChange = (e) => {
        const updatedData = {
            ...signatureData,
            printed_name: e.target.value,
        };
        setSignatureData(updatedData);
        onChange &&
            onChange({
                target: {
                    name,
                    value: updatedData,
                },
            });
    };

    const handleDateChange = (e) => {
        const updatedData = {
            ...signatureData,
            date: e.target.value,
        };
        setSignatureData(updatedData);
        onChange &&
            onChange({
                target: {
                    name,
                    value: updatedData,
                },
            });
    };

    return (
        <div className="signature-field space-y-4">
            <label className="block text-sm font-medium text-gray-700">
                {label}
            </label>

            <div className="border-2 border-gray-300 rounded-lg p-4">
                <SignatureCanvas
                    ref={signatureRef}
                    penColor="black"
                    canvasProps={{
                        className:
                            "signature-canvas w-full h-48 border-b-2 border-gray-200 mb-4",
                        style: { borderBottom: "2px solid #e5e7eb" },
                    }}
                    onEnd={handleSignatureEnd}
                />

                <div className="flex justify-between items-center">
                    <button
                        type="button"
                        onClick={handleClear}
                        className="text-sm text-red-600 hover:text-red-800"
                    >
                        Clear Signature
                    </button>
                    {signatureData.signature && (
                        <span className="text-sm text-green-600">
                            Signature Captured
                        </span>
                    )}
                </div>
            </div>

            {config.show_print_name && (
                <div className="mt-4">
                    <label
                        htmlFor={`${name}-printed-name`}
                        className="block text-sm font-medium text-gray-700"
                    >
                        Printed Name
                    </label>
                    <input
                        type="text"
                        id={`${name}-printed-name`}
                        value={signatureData.printed_name}
                        onChange={handlePrintedNameChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
                    />
                </div>
            )}

            {config.show_date && (
                <div className="mt-4">
                    <label
                        htmlFor={`${name}-date`}
                        className="block text-sm font-medium text-gray-700"
                    >
                        Date
                    </label>
                    <input
                        type="date"
                        id={`${name}-date`}
                        value={signatureData.date}
                        onChange={handleDateChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
                    />
                </div>
            )}
        </div>
    );
};

export default SignatureField;
