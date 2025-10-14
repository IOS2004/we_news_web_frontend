import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@/contexts/WalletContext';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { formatCurrency, formatDate } from '@/utils/helpers';

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  status: 'completed' | 'pending' | 'failed';
  createdAt: { _seconds: number; _nanoseconds: number } | string;
  category?: string;
}

const filters = [
  { label: 'All', value: 'all' },
  { label: 'Credit', value: 'credit' },
  { label: 'Debit', value: 'debit' },
  { label: 'Pending', value: 'pending' },
];

export default function Wallet() {
  const navigate = useNavigate();
  const walletContext = useWallet();
  const { wallet, transactions, isLoading } = walletContext;
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    document.title = 'Wallet - WeNews';
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      setError(null);
      setInitialLoading(true);
      await Promise.all([
        walletContext.refreshWallet(),
        walletContext.refreshTransactions()
      ]);
    } catch (err: any) {
      console.error('Failed to load wallet data:', err);
      setError(err?.message || 'Failed to load wallet data. Please try again.');
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    filterTransactions();
  }, [selectedFilter, transactions]);

  const filterTransactions = () => {
    if (!transactions) {
      setFilteredTransactions([]);
      return;
    }

    let filtered = [...transactions];

    if (selectedFilter !== 'all') {
      if (selectedFilter === 'credit') {
        filtered = filtered.filter((t) => t.type === 'credit');
      } else if (selectedFilter === 'debit') {
        filtered = filtered.filter((t) => t.type === 'debit');
      } else if (selectedFilter === 'pending') {
        filtered = filtered.filter((t) => t.status === 'pending');
      }
    }

    setFilteredTransactions(filtered);
  };

  const getTransactionDate = (createdAt: any): string => {
    if (typeof createdAt === 'string') {
      return formatDate(createdAt);
    }
    if (createdAt && createdAt._seconds) {
      return formatDate(new Date(createdAt._seconds * 1000).toISOString());
    }
    return 'N/A';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'failed':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (initialLoading || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Card className="p-8 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2">Error Loading Wallet</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={loadWalletData}>Try Again</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Wallet</h1>
        <p className="text-muted-foreground">Manage your balance and transactions</p>
      </div>

      {/* Balance Card */}
      <Card className="mb-6 bg-gradient-to-br from-primary to-primary/80 text-white">
        <div className="p-6">
          <div className="text-sm opacity-90 mb-2">Current Balance</div>
          <div className="text-4xl font-bold mb-6">
            {formatCurrency(wallet?.balance || 0)}
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1 bg-white text-primary hover:bg-gray-100"
              onClick={() => navigate('/add-money')}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Money
            </Button>
            <Button
              variant="secondary"
              className="flex-1 bg-white text-primary hover:bg-gray-100"
              onClick={() => navigate('/withdrawals')}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
              Withdraw
            </Button>
          </div>
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Total Credit</div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(
                  transactions?.filter((t) => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0) || 0
                )}
              </div>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Total Debit</div>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(
                  transactions?.filter((t) => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0) || 0
                )}
              </div>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Transactions</div>
              <div className="text-2xl font-bold text-primary">
                {transactions?.length || 0}
              </div>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Transactions Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Transaction History</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              walletContext.refreshTransactions();
            }}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </Button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {filters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setSelectedFilter(filter.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedFilter === filter.value
                  ? 'bg-primary text-white'
                  : 'bg-accent text-foreground hover:bg-accent/80'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Transactions List */}
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💸</div>
            <h3 className="text-xl font-semibold mb-2">No Transactions</h3>
            <p className="text-muted-foreground">
              {selectedFilter === 'all'
                ? 'Your transaction history will appear here'
                : `No ${selectedFilter} transactions found`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      transaction.type === 'credit' ? 'bg-green-100' : 'bg-red-100'
                    }`}
                  >
                    {transaction.type === 'credit' ? (
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                      </svg>
                    )}
                  </div>

                  {/* Details */}
                  <div>
                    <div className="font-semibold text-foreground">{transaction.description}</div>
                    <div className="text-sm text-muted-foreground">{getTransactionDate(transaction.createdAt)}</div>
                  </div>
                </div>

                {/* Amount and Status */}
                <div className="text-right">
                  <div
                    className={`text-lg font-bold ${
                      transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {transaction.type === 'credit' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full border inline-block ${getStatusColor(transaction.status)}`}>
                    {transaction.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
