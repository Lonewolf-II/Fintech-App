import React, { useState } from 'react';
import { useAppDispatch } from '../../../app/hooks';
import { uploadBulkCustomers, fetchCustomers } from '../customerSlice';
import { customerApi } from '../../../api/customerApi';
import { Button } from '../../../components/common/Button';
import { Upload, X, CheckCircle, AlertCircle, Download, FileText } from 'lucide-react';
import type { BulkUploadResult } from '../../../types/business.types';

interface BulkUploadModalProps {
    onClose: () => void;
}

export const BulkUploadModal: React.FC<BulkUploadModalProps> = ({ onClose }) => {
    const dispatch = useAppDispatch();
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState<BulkUploadResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [downloading, setDownloading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];

            // Validate file type
            if (!selectedFile.name.endsWith('.csv')) {
                setError('Please select a CSV file');
                return;
            }

            setFile(selectedFile);
            setError(null);
            setResult(null);
        }
    };

    const handleDownloadTemplate = async () => {
        setDownloading(true);
        try {
            const blob = await customerApi.downloadBulkUploadTemplate();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'bulk_customer_upload_template.csv';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            setError('Failed to download template');
        } finally {
            setDownloading(false);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a file first');
            return;
        }

        setUploading(true);
        setError(null);

        try {
            const resultAction = await dispatch(uploadBulkCustomers(file));

            if (uploadBulkCustomers.fulfilled.match(resultAction)) {
                setResult(resultAction.payload as BulkUploadResult);
                dispatch(fetchCustomers()); // Refresh list
            } else {
                if (resultAction.payload) {
                    setError(resultAction.payload as string);
                } else {
                    setError('Upload failed');
                }
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setUploading(false);
        }
    };

    const downloadErrorReport = () => {
        if (!result || !result.failedRecords || result.failedRecords.length === 0) return;

        const csvContent = [
            ['Row', 'Customer Name', 'Email', 'Phone', 'Errors'].join(','),
            ...result.failedRecords.map(record => [
                record.row,
                record.data['Customer Name'] || '',
                record.data.Email || '',
                record.data['Mobile Number'] || '',
                record.errors.join('; ')
            ].map(field => `"${field}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'bulk_upload_errors.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-4">
            {!result ? (
                <>
                    {/* Template Download Section */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div className="flex-1">
                                <h4 className="text-sm font-medium text-blue-900 mb-1">
                                    Download Template First
                                </h4>
                                <p className="text-xs text-blue-700 mb-3">
                                    Use our CSV template to ensure your data is formatted correctly.
                                    Required columns: Customer Name, Mobile Number, Email, Date of Birth, Bank Name
                                </p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleDownloadTemplate}
                                    isLoading={downloading}
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Download CSV Template
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* File Upload Section */}
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-primary-500 transition-colors">
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            className="hidden"
                            id="csv-upload"
                        />
                        <label htmlFor="csv-upload" className="cursor-pointer block">
                            <Upload className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                            <p className="text-sm text-slate-600 font-medium">Click to upload CSV</p>
                            <p className="text-xs text-slate-400 mt-1">
                                Maximum file size: 5MB
                            </p>
                        </label>
                        {file && (
                            <div className="mt-4 p-3 bg-slate-50 rounded flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-slate-600" />
                                    <span className="truncate max-w-[200px] font-medium">{file.name}</span>
                                    <span className="text-xs text-slate-500">
                                        ({(file.size / 1024).toFixed(1)} KB)
                                    </span>
                                </div>
                                <button
                                    onClick={() => setFile(null)}
                                    className="text-slate-400 hover:text-red-500 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center">
                            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-2 pt-2">
                        <Button variant="outline" onClick={onClose} disabled={uploading}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpload} isLoading={uploading} disabled={!file}>
                            {uploading ? 'Uploading...' : 'Upload'}
                        </Button>
                    </div>
                </>
            ) : (
                /* Results Display */
                <div className="py-6">
                    <div className="text-center mb-6">
                        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Upload Complete</h3>
                        <p className="text-slate-600">{result.message}</p>
                    </div>

                    {/* Statistics */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-green-50 p-4 rounded-lg text-center">
                            <div className="text-2xl font-bold text-green-700">{result.successCount}</div>
                            <div className="text-sm text-green-600">Successfully Created</div>
                        </div>
                        <div className="bg-red-50 p-4 rounded-lg text-center">
                            <div className="text-2xl font-bold text-red-700">{result.failureCount}</div>
                            <div className="text-sm text-red-600">Failed</div>
                        </div>
                    </div>

                    {/* Failed Records Details */}
                    {result.failedRecords && result.failedRecords.length > 0 && (
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-medium text-slate-900">Failed Records</h4>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={downloadErrorReport}
                                >
                                    <Download className="w-3 h-3 mr-1" />
                                    Download Error Report
                                </Button>
                            </div>
                            <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-lg">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 sticky top-0">
                                        <tr>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-slate-600">Row</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-slate-600">Name</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-slate-600">Errors</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {result.failedRecords.slice(0, 10).map((record, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50">
                                                <td className="px-3 py-2 text-slate-600">{record.row}</td>
                                                <td className="px-3 py-2 text-slate-900">
                                                    {record.data['Customer Name'] || 'N/A'}
                                                </td>
                                                <td className="px-3 py-2">
                                                    <div className="flex flex-wrap gap-1">
                                                        {record.errors.map((err, i) => (
                                                            <span
                                                                key={i}
                                                                className="inline-block px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded"
                                                            >
                                                                {err}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {result.failedRecords.length > 10 && (
                                    <div className="p-2 text-center text-xs text-slate-500 bg-slate-50">
                                        Showing 10 of {result.failedRecords.length} failed records
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Close Button */}
                    <div className="flex justify-center">
                        <Button onClick={onClose}>Close</Button>
                    </div>
                </div>
            )}
        </div>
    );
};
