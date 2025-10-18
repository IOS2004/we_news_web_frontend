import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@/contexts/WalletContext';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { formatCurrency, formatDate } from '@/utils/helpers';
import toast from 'react-hot-toast';

export default function Wallet() {
  const navigate = useNavigate();
  const { wallet, transactions, isLoading, refreshWallet, refreshTransactions } = useWallet();
  const [dataLoaded, setDataLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Wallet - WeNews';
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setError(null);
      await refreshWallet();
      await refreshTransactions();
      setDataLoaded(true);
    } catch (err: any) {
      console.error('Error loading wallet:', err);
      setError(err?.message || 'Failed to load wallet data');
      toast.error('Failed to load wallet data');
      setDataLoaded(true);
    }
  };

  if (!dataLoaded || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-muted-foreground">Loading wallet...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Card className="p-8 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2">Unable to Load Wallet</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={loadData}>Try Again</Button>
        </Card>
      </div>
    );
  }

  const balance = wallet?.balance || 0;
  const txList = Array.isArray(transactions) ? transactions : [];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Wallet</h1>
        <p className="text-muted-foreground">Manage your balance and transactions</p>
      </div>

      {/* Balance Card */}
      <Card className="mb-6 bg-gradient-to-br from-primary to-primary/80 text-white overflow-hidden">
        <div className="p-6">
          <div className="text-sm opacity-90 mb-2">Current Balance</div>
          <div className="text-4xl font-bold mb-6">
            {formatCurrency(balance)}
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button
              className="flex-1 min-w-[140px] bg-white text-primary font-semibold py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center shadow-md"
              onClick={() => navigate('/add-money')}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Money
            </button>
            <button
              className="flex-1 min-w-[140px] bg-white text-primary font-semibold py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center shadow-md"
              onClick={() => navigate('/withdrawals')}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
              Withdraw
            </button>
          </div>
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Total Credit</div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(
                  txList.filter((t: any) => t.type === 'credit').reduce((sum: number, t: any) => sum + (t.amount || 0), 0)
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
                  txList.filter((t: any) => t.type === 'debit').reduce((sum: number, t: any) => sum + (t.amount || 0), 0)
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
                {txList.length}
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
          <h2 className="text-xl font-semibold">Recent Transactions</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refreshTransactions();
              toast.success('Transactions refreshed');
            }}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </Button>
        </div>

        {/* Transactions List */}
        {txList.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💸</div>
            <h3 className="text-xl font-semibold mb-2">No Transactions Yet</h3>
            <p className="text-muted-foreground mb-6">
              Your transaction history will appear here once you make your first transaction
            </p>
            <Button onClick={() => navigate('/add-money')}>Add Money to Get Started</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {txList.slice(0, 10).map((transaction: any, index: number) => {
              const txDate = transaction.createdAt?._seconds 
                ? new Date(transaction.createdAt._seconds * 1000).toISOString()
                : transaction.date || new Date().toISOString();

              return (
                <div
                  key={transaction.id || `tx-${index}`}
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
                      <div className="font-semibold text-foreground">
                        {transaction.description || 'Transaction'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(txDate)}
                      </div>
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
                      {formatCurrency(transaction.amount || 0)}
                    </div>
                    {transaction.status && (
                      <div className={`text-xs px-2 py-1 rounded-full border inline-block ${
                        transaction.status === 'completed' || transaction.status === 'success'
                          ? 'text-green-600 bg-green-50 border-green-200'
                          : transaction.status === 'pending'
                          ? 'text-yellow-600 bg-yellow-50 border-yellow-200'
                          : 'text-red-600 bg-red-50 border-red-200'
                      }`}>
                        {transaction.status}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
