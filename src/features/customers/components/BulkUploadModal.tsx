import React, { useState } from 'react';
import { useAppDispatch } from '../../../app/hooks';
import { uploadBulkCustomers, fetchCustomers } from '../customerSlice';
import { Button } from '../../../components/common/Button';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';

interface BulkUploadModalProps {
    onClose: () => void;
}

export const BulkUploadModal: React.FC<BulkUploadModalProps> = ({ onClose }) => {
    const dispatch = useAppDispatch();
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState<any | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError(null);
            setResult(null);
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
                setResult(resultAction.payload);
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

    return (
        <div className="space-y-4">
            {!result ? (
                <>
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
                                Columns: name, dateOfBirth, contact, email, accountType
                            </p>
                        </label>
                        {file && (
                            <div className="mt-4 p-2 bg-slate-50 rounded flex items-center justify-between text-sm">
                                <span className="truncate max-w-[200px]">{file.name}</span>
                                <button onClick={() => setFile(null)} className="text-slate-400 hover:text-red-500">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center">
                            <AlertCircle className="w-4 h-4 mr-2" />
                            {error}
                        </div>
                    )}
                    <div className="flex justify-end space-x-2 pt-2">
                        <Button variant="outline" onClick={onClose} disabled={uploading}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpload} isLoading={uploading} disabled={!file}>
                            Upload
                        </Button>
                    </div>
                </>
            ) : (
                <div className="text-center py-6">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Upload Complete</h3>
                    <p className="text-slate-600 mb-4">{result.message}</p>
                    <div className="flex justify-center gap-4 text-sm mb-6">
                        <div className="bg-green-50 px-3 py-1 rounded text-green-700 font-medium">
                            Created: {result.created}
                        </div>
                        {result.errors && result.errors.length > 0 && (
                            <div className="bg-red-50 px-3 py-1 rounded text-red-700 font-medium">
                                Errors: {result.errors.length}
                            </div>
                        )}
                    </div>
                    <Button onClick={onClose}>Close</Button>
                </div>
            )}
        </div>
    );
};
