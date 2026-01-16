import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { calculateProfit, clearCalculation } from './profitSlice';
import { Button } from '../../components/common/Button';
import { Calculator, AlertCircle, ArrowRight } from 'lucide-react';

interface ProfitCalculatorProps {
    onSuccess: () => void;
}

export const ProfitCalculator: React.FC<ProfitCalculatorProps> = ({ onSuccess }) => {
    const dispatch = useAppDispatch();
    const { calculationResult, isLoading, error } = useAppSelector((state) => state.profit);

    // State for form
    const [formData, setFormData] = useState({
        investmentId: '',
        saleQuantity: '',
        salePrice: '',
        saleDate: new Date().toISOString().split('T')[0]
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCalculate = async (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(clearCalculation());
        await dispatch(calculateProfit({
            investmentId: Number(formData.investmentId),
            saleQuantity: Number(formData.saleQuantity),
            salePrice: Number(formData.salePrice),
            saleDate: formData.saleDate
        }));
    };

    const handleConfirm = () => {
        // Logic to confirm/save would go here if we separated calculate vs save
        // For now, calculation also saves in backend as per API design, so we just close
        onSuccess();
    };

    return (
        <div className="space-y-6">
            {!calculationResult ? (
                <form onSubmit={handleCalculate} className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg flex items-start gap-3">
                        <Calculator className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                            <h4 className="text-sm font-medium text-blue-900">Profit Distribution Calculator</h4>
                            <p className="text-xs text-blue-700 mt-1">
                                This will automatically calculate the 60-40 split, deduct fees, return principal,
                                and distribute profits to the investor's special account.
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center">
                            <AlertCircle className="w-4 h-4 mr-2" />
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Investment ID</label>
                        <input
                            type="number"
                            name="investmentId"
                            value={formData.investmentId}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                            placeholder="Enter Investment ID (Holding ID)"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Sale Quantity</label>
                            <input
                                type="number"
                                name="saleQuantity"
                                value={formData.saleQuantity}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Sale Price (Per Share)</label>
                            <input
                                type="number"
                                name="salePrice"
                                value={formData.salePrice}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Sale Date</label>
                        <input
                            type="date"
                            name="saleDate"
                            value={formData.saleDate}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                            required
                        />
                    </div>

                    <Button type="submit" className="w-full" isLoading={isLoading}>
                        Calculate & Distribute
                    </Button>
                </form>
            ) : (
                /* Results View */
                <div className="space-y-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                        <h3 className="text-lg font-bold text-green-800">Distribution Successful</h3>
                        <p className="text-sm text-green-600">Funds have been transferred to the investor's special account.</p>
                    </div>

                    <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Total Sale Amount:</span>
                            <span className="font-medium">NPR {calculationResult.saleAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm text-slate-500">
                            <span>Principal Returned:</span>
                            <span>NPR {calculationResult.principalReturned.toLocaleString()}</span>
                        </div>
                        <div className="border-t border-slate-200 my-2 pt-2">
                            <div className="flex justify-between text-sm font-medium">
                                <span>Total Net Profit:</span>
                                <span className="text-green-600">NPR {calculationResult.totalProfit.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-2">
                            <div className="bg-white p-2 rounded border border-slate-200">
                                <div className="text-xs text-slate-500">Investor Share (60%)</div>
                                <div className="font-semibold text-blue-600">NPR {calculationResult.investorShare.toLocaleString()}</div>
                            </div>
                            <div className="bg-white p-2 rounded border border-slate-200">
                                <div className="text-xs text-slate-500">Office Share (40%)</div>
                                <div className="font-semibold text-purple-600">NPR {calculationResult.adminShare.toLocaleString()}</div>
                            </div>
                        </div>

                        {calculationResult.feesDeducted > 0 && (
                            <div className="flex justify-between text-xs text-red-500 mt-2">
                                <span>Fees Deducted (from Office Share):</span>
                                <span>- NPR {calculationResult.feesDeducted.toLocaleString()}</span>
                            </div>
                        )}
                        {calculationResult.customerShare > 0 && (
                            <div className="flex justify-between text-xs text-orange-500">
                                <span>Customer Bonus:</span>
                                <span>- NPR {calculationResult.customerShare.toLocaleString()}</span>
                            </div>
                        )}
                    </div>

                    <Button onClick={onSuccess} className="w-full">
                        Done
                    </Button>
                </div>
            )}
        </div>
    );
};
