
import React, { useState } from 'react';
import { useData } from '../hooks/useData';
import { useAuth } from '../hooks/useAuth';
import {
    Plus,
    Trash2,
    X,
    ShoppingCart,
    RefreshCw,
    Printer,
    Scan,
    Search,
    CheckCircle,
    Package
} from 'lucide-react';
import BarcodeScanner from './BarcodeScanner';

interface SaleItem {
    product_id: number;
    quantity: number;
    name: string;
    price: number;
    stock: number;
}

interface SaleModalProps {
    onClose: () => void;
}

const SaleModal: React.FC<SaleModalProps> = ({ onClose }) => {
    const { products, recordSale } = useData();
    const { user } = useAuth();

    const [items, setItems] = useState<SaleItem[]>([]);
    const [view, setView] = useState<'form' | 'receipt'>('form');
    const [completedSale, setCompletedSale] = useState<{ items: SaleItem[]; total: number; receiptId: string; date: Date } | null>(null);
    const [showScanner, setShowScanner] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const availableProducts = products.filter(p => p.quantity > 0);
    const filteredProducts = availableProducts.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const addItemToCart = (product: typeof products[0]) => {
        const existingItem = items.find(item => item.product_id === product.id);
        if (existingItem) {
            if (existingItem.quantity < product.quantity) {
                setItems(items.map(item =>
                    item.product_id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                ));
            }
        } else {
            setItems([...items, {
                product_id: product.id,
                quantity: 1,
                name: product.name,
                price: product.price,
                stock: product.quantity
            }]);
        }
    };

    const handleBarcodeScan = (barcode: string) => {
        const product = products.find(p => p.sku === barcode && p.quantity > 0);
        if (product) {
            addItemToCart(product);
            setShowScanner(false);
        } else {
            alert(`Product not found or out of stock`);
        }
    };

    const handleQuantityChange = (productId: number, quantity: number) => {
        setItems(items.map(item => item.product_id === productId ? { ...item, quantity } : item));
    };

    const handleRemoveItem = (productId: number) => {
        setItems(items.filter(item => item.product_id !== productId));
    };

    const total = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (items.length === 0) return;

        const saleItems = items.map(({ product_id, quantity, price }) => ({ product_id, quantity, price_per_unit: price }));
        recordSale(saleItems);

        setCompletedSale({
            items: [...items],
            total,
            receiptId: `SALE-${Date.now().toString().slice(-6)}`,
            date: new Date()
        });
        setView('receipt');
    };

    const handleNewSale = () => {
        setItems([]);
        setCompletedSale(null);
        setSearchQuery('');
        setView('form');
    };

    const handlePrint = () => {
        const receiptElement = document.getElementById('sale-receipt');
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

    // Receipt View - Compact Design
    if (view === 'receipt' && completedSale) {
        return (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-xs overflow-hidden">
                    {/* Success Header - Screen Only */}
                    <div className="bg-emerald-500 text-white p-3 text-center print:hidden">
                        <div className="flex items-center justify-center gap-2">
                            <CheckCircle className="w-5 h-5" />
                            <h2 className="text-base font-bold">Sale Complete!</h2>
                        </div>
                    </div>

                    {/* Compact Receipt - This is what prints */}
                    <div id="sale-receipt" className="bg-white text-gray-900 p-4 text-xs">
                        {/* Receipt Header */}
                        <div className="text-center border-b border-dashed border-gray-300 pb-2 mb-2">
                            <h1 className="text-sm font-bold">JUBEL HAVILAH ENTERPRISE</h1>
                            <p className="text-[10px] text-gray-500">Kasoa, Nyanyano Road, Fijai</p>
                            <p className="text-[10px] text-gray-500">Tel: +233-302-944-074</p>
                        </div>

                        {/* Transaction Info */}
                        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px] mb-2 pb-2 border-b border-gray-200">
                            <div className="text-gray-500">Receipt:</div>
                            <div className="font-mono font-medium text-right">{completedSale.receiptId}</div>
                            <div className="text-gray-500">Date:</div>
                            <div className="text-right">{completedSale.date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                            <div className="text-gray-500">Time:</div>
                            <div className="text-right">{completedSale.date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</div>
                            <div className="text-gray-500">Cashier:</div>
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
                                    {completedSale.items.map((item) => (
                                        <tr key={item.product_id}>
                                            <td className="py-1 pr-1">
                                                <span className="block truncate max-w-[120px]">{item.name}</span>
                                            </td>
                                            <td className="py-1 text-center text-gray-600">{item.quantity}</td>
                                            <td className="py-1 text-right font-medium">{(item.quantity * item.price).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Total */}
                        <div className="border-t-2 border-gray-900 pt-1 mb-2">
                            <div className="flex justify-between text-sm font-bold">
                                <span>TOTAL</span>
                                <span>GHS {completedSale.total.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="text-center border-t border-dashed border-gray-300 pt-2">
                            <p className="text-[10px] font-medium text-gray-600">Thank you for your purchase!</p>
                            <p className="text-[9px] text-gray-400">Goods sold are not returnable</p>
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
                        <button onClick={handleNewSale} className="flex-1 px-3 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center justify-center gap-1">
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
                            <div className="w-9 h-9 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
                                <ShoppingCart className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Record Sale</h2>
                                <p className="text-xs text-slate-500">Add items to complete sale</p>
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
                                        className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
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
                                        className="w-full flex items-center justify-between p-3 bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 hover:border-emerald-500 hover:shadow-sm transition-all text-left group"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-8 h-8 bg-slate-100 dark:bg-slate-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <Package className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-emerald-500" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{product.name}</p>
                                                <p className="text-xs text-slate-500">{product.quantity} in stock</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">GHS {product.price.toFixed(2)}</span>
                                            <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-600 flex items-center justify-center group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30">
                                                <Plus size={12} className="text-slate-500 group-hover:text-emerald-600" />
                                            </div>
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

                        {/* Right: Cart */}
                        <div className="w-full md:w-1/2 flex flex-col bg-white dark:bg-slate-800">
                            <div className="p-3 bg-slate-50 dark:bg-slate-700/30 border-b border-slate-100 dark:border-slate-700">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-900 dark:text-white">Cart</span>
                                    <span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full">{items.length} items</span>
                                </div>
                            </div>

                            <div className="flex-grow overflow-y-auto p-3 space-y-2">
                                {items.length > 0 ? items.map(item => (
                                    <div key={item.product_id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                                        <div className="flex-grow min-w-0">
                                            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{item.name}</p>
                                            <p className="text-xs text-slate-500">GHS {item.price.toFixed(2)} each</p>
                                        </div>
                                        <div className="flex items-center bg-white dark:bg-slate-600 rounded border border-slate-200 dark:border-slate-500">
                                            <button
                                                type="button"
                                                onClick={() => handleQuantityChange(item.product_id, Math.max(1, item.quantity - 1))}
                                                className="w-7 h-7 flex items-center justify-center text-slate-500 hover:text-slate-700"
                                            >-</button>
                                            <input
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e) => handleQuantityChange(item.product_id, Math.min(item.stock, Math.max(1, Number(e.target.value))))}
                                                className="w-10 h-7 text-center text-sm bg-transparent border-none focus:ring-0 p-0 text-slate-900 dark:text-white"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleQuantityChange(item.product_id, Math.min(item.stock, item.quantity + 1))}
                                                className="w-7 h-7 flex items-center justify-center text-slate-500 hover:text-slate-700"
                                            >+</button>
                                        </div>
                                        <span className="text-sm font-semibold text-slate-900 dark:text-white w-16 text-right">{(item.price * item.quantity).toFixed(2)}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveItem(item.product_id)}
                                            className="p-1 text-slate-400 hover:text-red-500 rounded"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                )) : (
                                    <div className="h-full flex flex-col items-center justify-center text-center py-8">
                                        <ShoppingCart className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
                                        <p className="text-sm text-slate-500">Cart is empty</p>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Total</span>
                                    <span className="text-2xl font-bold text-slate-900 dark:text-white">GHS {total.toFixed(2)}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={items.length === 0}
                                        className="flex-[2] px-4 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Complete Sale
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

export default SaleModal;
