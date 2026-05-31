
import React, { useState } from 'react';
import { useData } from '../hooks/useData';
import { useAuth } from '../hooks/useAuth';
import {
    Plus,
    Trash2,
    X,
    Truck,
    RefreshCw,
    Printer,
    Scan,
    Search,
    CheckCircle,
    Package
} from 'lucide-react';
import BarcodeScanner from './BarcodeScanner';

interface PurchaseItem {
    product_id: number;
    quantity: number;
    cost: number;
    name: string;
}

interface PurchaseModalProps {
    onClose: () => void;
}

const PurchaseModal: React.FC<PurchaseModalProps> = ({ onClose }) => {
    const { products, recordPurchase } = useData();
    const { user } = useAuth();

    const [items, setItems] = useState<PurchaseItem[]>([]);
    const [view, setView] = useState<'form' | 'receipt'>('form');
    const [completedPurchase, setCompletedPurchase] = useState<{ items: PurchaseItem[], total: number, receiptId: string, date: Date } | null>(null);
    const [showScanner, setShowScanner] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const addItemToCart = (product: typeof products[0]) => {
        const existingItem = items.find(item => item.product_id === product.id);
        if (existingItem) {
            setItems(items.map(item =>
                item.product_id === product.id ? { ...item, quantity: item.quantity + 1 } : item
            ));
        } else {
            setItems([...items, {
                product_id: product.id,
                quantity: 1,
                cost: product.cost,
                name: product.name
            }]);
        }
    };

    const handleBarcodeScan = (barcode: string) => {
        const product = products.find(p => p.sku === barcode);
        if (product) {
            addItemToCart(product);
            setShowScanner(false);
        } else {
            alert(`Product not found`);
        }
    };

    const handleItemChange = (productId: number, field: 'quantity' | 'cost', value: number) => {
        setItems(items.map(item => item.product_id === productId ? { ...item, [field]: value } : item));
    };

    const handleRemoveItem = (productId: number) => {
        setItems(items.filter(item => item.product_id !== productId));
    };

    const total = items.reduce((sum, item) => sum + (item.quantity * item.cost), 0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (items.length === 0) return;

        const purchaseItems = items.map(({ product_id, quantity, cost }) => ({ product_id, quantity, cost }));
        recordPurchase(purchaseItems);

        setCompletedPurchase({
            items: [...items],
            total,
            receiptId: `GRN-${Date.now().toString().slice(-6)}`,
            date: new Date()
        });
        setView('receipt');
    };

    const handleNewPurchase = () => {
        setItems([]);
        setCompletedPurchase(null);
        setSearchQuery('');
        setView('form');
    };

    const handlePrint = () => {
        const receiptElement = document.getElementById('grn-receipt');
        const printContainer = document.getElementById('print-container');

        if (receiptElement && printContainer) {
            // Copy receipt content to print container
            printContainer.innerHTML = receiptElement.outerHTML;

            // Add print class to body
            document.body.classList.add('printing-receipt');

            // Print
            window.print();

            // Cleanup after print
            setTimeout(() => {
                document.body.classList.remove('printing-receipt');
                printContainer.innerHTML = '';
            }, 500);
        }
    };

    // Receipt View - Compact GRN
    if (view === 'receipt' && completedPurchase) {
        return (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-xs overflow-hidden">
                    {/* Success Header - Screen Only */}
                    <div className="bg-blue-500 text-white p-3 text-center print:hidden">
                        <div className="flex items-center justify-center gap-2">
                            <Truck className="w-5 h-5" />
                            <h2 className="text-base font-bold">Stock Received!</h2>
                        </div>
                    </div>

                    {/* Compact GRN Receipt - This is what prints */}
                    <div id="grn-receipt" className="bg-white text-gray-900 p-4 text-xs">
                        {/* Receipt Header */}
                        <div className="text-center border-b border-dashed border-gray-300 pb-2 mb-2">
                            <h1 className="text-sm font-bold">JUBEL HAVILAH ENTERPRISE</h1>
                            <p className="text-[10px] text-gray-500">Kasoa, Nyanyano Road, Fijai</p>
                            <p className="text-[10px] text-gray-500">Tel: +233-302-944-074</p>
                            <div className="mt-1 inline-block px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[9px] font-semibold uppercase">
                                GRN
                            </div>
                        </div>

                        {/* Transaction Info */}
                        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px] mb-2 pb-2 border-b border-gray-200">
                            <div className="text-gray-500">GRN No:</div>
                            <div className="font-mono font-medium text-right">{completedPurchase.receiptId}</div>
                            <div className="text-gray-500">Date:</div>
                            <div className="text-right">{completedPurchase.date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                            <div className="text-gray-500">Time:</div>
                            <div className="text-right">{completedPurchase.date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</div>
                            <div className="text-gray-500">Received By:</div>
                            <div className="text-right font-medium">{user?.name || 'Staff'}</div>
                        </div>

                        {/* Items */}
                        <div className="mb-2">
                            <table className="w-full text-[10px]">
                                <thead>
                                    <tr className="text-gray-500 border-b border-gray-200">
                                        <th className="text-left pb-1 font-medium">Item</th>
                                        <th className="text-center pb-1 font-medium w-8">Qty</th>
                                        <th className="text-right pb-1 font-medium w-14">Amt</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {completedPurchase.items.map((item) => (
                                        <tr key={item.product_id}>
                                            <td className="py-1 pr-1">
                                                <span className="block truncate max-w-[120px]">{item.name}</span>
                                            </td>
                                            <td className="py-1 text-center text-gray-600">{item.quantity}</td>
                                            <td className="py-1 text-right font-medium">{(item.quantity * item.cost).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Total */}
                        <div className="border-t-2 border-gray-900 pt-1 mb-2">
                            <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                                <span>Total Units</span>
                                <span>{completedPurchase.items.reduce((sum, i) => sum + i.quantity, 0)}</span>
                            </div>
                            <div className="flex justify-between text-sm font-bold">
                                <span>TOTAL COST</span>
                                <span>GHS {completedPurchase.total.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="text-center border-t border-dashed border-gray-300 pt-2">
                            <p className="text-[10px] font-medium text-gray-600">Stock levels updated</p>
                        </div>
                    </div>

                    {/* Action Buttons - Screen Only */}
                    <div className="p-3 bg-slate-50 dark:bg-slate-700/50 flex gap-2 print:hidden border-t border-slate-200 dark:border-slate-700">
                        <button onClick={onClose} className="flex-1 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-500 transition-colors">
                            Close
                        </button>
                        <button onClick={handlePrint} className="flex-1 px-3 py-2 text-xs font-medium text-slate-700 dark:text-white bg-slate-200 dark:bg-slate-600 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors flex items-center justify-center gap-1">
                            <Printer size={14} /> Print
                        </button>
                        <button onClick={handleNewPurchase} className="flex-1 px-3 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center justify-center gap-1">
                            <RefreshCw size={14} /> New
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Form View
    return (
        <>
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                                <Truck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Receive Stock</h2>
                                <p className="text-xs text-slate-500">Record incoming inventory</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                            <X className="w-4 h-4 text-slate-400" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="flex-grow flex flex-col md:flex-row overflow-hidden">
                        {/* Left: Product Selection */}
                        <div className="w-full md:w-1/2 p-4 border-r border-slate-100 dark:border-slate-700 overflow-y-auto bg-slate-50/50 dark:bg-slate-800/50">
                            <div className="flex gap-2 mb-4">
                                <div className="relative flex-grow">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search products..."
                                        className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowScanner(true)}
                                    className="p-2 bg-slate-900 dark:bg-slate-700 text-white rounded-lg hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors"
                                >
                                    <Scan size={16} />
                                </button>
                            </div>

                            <div className="space-y-2">
                                {filteredProducts.map(product => (
                                    <button
                                        key={product.id}
                                        type="button"
                                        onClick={() => addItemToCart(product)}
                                        className="w-full flex items-center justify-between p-3 bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 hover:border-blue-500 hover:shadow-sm transition-all text-left group"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-8 h-8 bg-slate-100 dark:bg-slate-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <Package className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-blue-500" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{product.name}</p>
                                                <p className="text-xs text-slate-500">Cost: GHS {product.cost.toFixed(2)}</p>
                                            </div>
                                        </div>
                                        <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-600 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30">
                                            <Plus size={12} className="text-slate-500 group-hover:text-blue-600" />
                                        </div>
                                    </button>
                                ))}
                                {filteredProducts.length === 0 && (
                                    <div className="text-center py-8">
                                        <Package className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                                        <p className="text-sm text-slate-500">No products found</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right: Items */}
                        <div className="w-full md:w-1/2 flex flex-col bg-white dark:bg-slate-800">
                            <div className="p-3 bg-slate-50 dark:bg-slate-700/30 border-b border-slate-100 dark:border-slate-700">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-900 dark:text-white">Incoming Items</span>
                                    <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">{items.length} items</span>
                                </div>
                            </div>

                            <div className="flex-grow overflow-y-auto p-3 space-y-2">
                                {items.length > 0 ? items.map(item => (
                                    <div key={item.product_id} className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{item.name}</p>
                                            <button type="button" onClick={() => handleRemoveItem(item.product_id)} className="p-1 text-slate-400 hover:text-red-500 rounded">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                            <div>
                                                <label className="text-[10px] text-slate-400 uppercase">Qty</label>
                                                <input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(e) => handleItemChange(item.product_id, 'quantity', Math.max(1, Number(e.target.value)))}
                                                    min="1"
                                                    className="w-full px-2 py-1 text-sm rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-600 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-slate-400 uppercase">Cost (GHS)</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={item.cost}
                                                    onChange={(e) => handleItemChange(item.product_id, 'cost', Math.max(0, Number(e.target.value)))}
                                                    min="0"
                                                    className="w-full px-2 py-1 text-sm rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-600 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div className="text-right">
                                                <label className="text-[10px] text-slate-400 uppercase">Total</label>
                                                <p className="text-sm font-semibold text-slate-900 dark:text-white py-1">GHS {(item.quantity * item.cost).toFixed(2)}</p>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="h-full flex flex-col items-center justify-center text-center py-8">
                                        <Truck className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
                                        <p className="text-sm text-slate-500">No items added</p>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Cost</span>
                                    <span className="text-2xl font-bold text-slate-900 dark:text-white">GHS {total.toFixed(2)}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={items.length === 0}
                                        className="flex-[2] px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle size={14} />
                                        Complete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {showScanner && (
                <BarcodeScanner onScan={handleBarcodeScan} onClose={() => setShowScanner(false)} />
            )}
        </>
    );
};

export default PurchaseModal;
