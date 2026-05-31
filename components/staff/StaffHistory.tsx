
import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import TransactionHistory from '../TransactionHistory';

const StaffHistory: React.FC = () => {
    const { user } = useAuth();

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Transaction History</h1>
            <p className="text-gray-600 dark:text-gray-400">A log of all sales and stock updates you have recorded.</p>
            <TransactionHistory userFilter={user?.name} />
        </div>
    );
};

export default StaffHistory;
