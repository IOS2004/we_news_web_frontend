import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { formatCurrency, formatDateTime } from '@/utils/helpers';
import { toast } from 'react-hot-toast';
import tradingApi from '../services/tradingApi';
import { UserTrades } from '@/types/trading';
import Card from '@/components/common/Card';

type FilterType = 'all' | 'color' | 'number';

const MyTrades: React.FC = () => {
  const [allTrades, setAllTrades] = useState<UserTrades[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<FilterType>('all');

  // Helper function to calculate trade amounts - memoized with useCallback
  const calculateTradeAmounts = useCallback((trade: UserTrades) => {
    let colorAmount = 0;
    let numberAmount = 0;
    let colorCount = 0;
    let numberCount = 0;

    // Calculate color trades
    Object.values(trade.colorTrades || {}).forEach((tradesArray) => {
      tradesArray.forEach((t) => {
        colorAmount += t.amount || 0;
        colorCount++;
      });
    });

    // Calculate number trades
    Object.values(trade.numberTrades || {}).forEach((tradesArray) => {
      tradesArray.forEach((t) => {
        numberAmount += t.amount || 0;
        numberCount++;
      });
    });

    return {
      colorAmount,
      numberAmount,
      colorCount,
      numberCount,
      totalAmount: colorAmount + numberAmount,
    };
  }, []);

  const fetchTrades = useCallback(async () => {
    try {
      setLoading(true);
      const response = await tradingApi.getMyOrders({
        gameType: undefined, // Fetch all trades
      });
      
      console.log('Fetched fresh trades:', response.items.length, 'trades');
      setAllTrades(response.items);
    } catch (error: any) {
      console.error('Failed to fetch trades:', error);
      toast.error('Failed to load trades');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  // Client-side filtering of cached data
  const trades = useMemo(() => {
    if (filterType === 'all') return allTrades;
    
    return allTrades.filter(trade => {
      if (filterType === 'color') {
        return trade.roundType === 'colour' || Object.keys(trade.colorTrades || {}).length > 0;
      } else if (filterType === 'number') {
        return trade.roundType === 'number' || Object.keys(trade.numberTrades || {}).length > 0;
      }
      return true;
    });
  }, [allTrades, filterType]);

  // Memoized stats calculation
  const stats = useMemo(() => ({
    total: trades.length,
    totalAmount: trades.reduce((sum, t) => {
      const amounts = calculateTradeAmounts(t);
      return sum + amounts.totalAmount;
    }, 0),
    active: trades.filter(t => t.status === 'active').length,
    completed: trades.filter(t => t.status === 'completed').length,
  }), [trades, calculateTradeAmounts]);

  // Memoize trade amounts for each trade to avoid recalculating on every render
  const tradeAmountsMap = useMemo(() => {
    const map = new Map<string, ReturnType<typeof calculateTradeAmounts>>();
    trades.forEach((trade) => {
      map.set(trade.roundId, calculateTradeAmounts(trade));
    });
    return map;
  }, [trades, calculateTradeAmounts]);

  // Helper: small color palette for badges
  const colorPalette: Record<string, string> = {
    red: '#DC2626',
    blue: '#2563EB',
    green: '#16A34A',
    yellow: '#EAB308',
    orange: '#EA580C',
    purple: '#9333EA',
    pink: '#EC4899',
    brown: '#92400E',
    cyan: '#0891B2',
    magenta: '#FF00FF',
    lime: '#84CC16',
    violet: '#8B5CF6',
  };

  // Render color trades (individual selections)
  const renderColorSelections = (trade: UserTrades) => {
    const entries = Object.entries(trade.colorTrades || {}) as [string, any[]][];
    if (entries.length === 0) return null;

    const items: JSX.Element[] = [];
    entries.forEach(([color, arr]) => {
      arr.forEach((t) => {
        const ts = t.timestamp && (t.timestamp._seconds ? new Date(t.timestamp._seconds * 1000) : new Date(t.timestamp));
        items.push(
          <div key={t.tradeId || `${trade.roundId}-color-${color}-${items.length}`} className="flex items-center gap-3 p-2 rounded-md bg-gray-50">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full" style={{ background: colorPalette[color] || '#CBD5E1' }} />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-gray-800">{color.toUpperCase()}</div>
                <div className="text-sm text-gray-600">{formatCurrency(t.amount || 0)}</div>
              </div>
              <div className="text-xs text-gray-500">{ts ? formatDateTime(ts) : ''}</div>
            </div>
          </div>
        );
      });
    });

    return (
      <div className="mt-4">
        <p className="text-xs text-gray-500 mb-2">Color Selections</p>
        <div className="grid gap-2">{items}</div>
      </div>
    );
  };

  // Render number trades (individual selections)
  const renderNumberSelections = (trade: UserTrades) => {
    const entries = Object.entries(trade.numberTrades || {}) as [string, any[]][];
    if (entries.length === 0) return null;

    const items: JSX.Element[] = [];
    entries.forEach(([numKey, arr]) => {
      arr.forEach((t) => {
        const ts = t.timestamp && (t.timestamp._seconds ? new Date(t.timestamp._seconds * 1000) : new Date(t.timestamp));
        items.push(
          <div key={t.tradeId || `${trade.roundId}-num-${numKey}-${items.length}`} className="flex items-center gap-3 p-2 rounded-md bg-gray-50">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-white border text-sm font-semibold">{numKey}</span>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-gray-800">Number {numKey}</div>
                <div className="text-sm text-gray-600">{formatCurrency(t.amount || 0)}</div>
              </div>
              <div className="text-xs text-gray-500">{ts ? formatDateTime(ts) : ''}</div>
            </div>
          </div>
        );
      });
    });

    return (
      <div className="mt-4">
        <p className="text-xs text-gray-500 mb-2">Number Selections</p>
        <div className="grid gap-2">{items}</div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Trades</h1>
            <p className="text-gray-600 mt-1">View your trading history</p>
          </div>
          <button onClick={() => fetchTrades()} disabled={loading} className="p-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50">
            <RefreshCw className={'w-5 h-5 ' + (loading ? 'animate-spin' : '')} />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card className="p-5 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <p className="text-sm mb-1">Total Trades</p>
            <p className="text-3xl font-bold">{stats.total}</p>
          </Card>
          <Card className="p-5 bg-gradient-to-br from-green-500 to-green-600 text-white">
            <p className="text-sm mb-1">Total Invested</p>
            <p className="text-3xl font-bold">₹{stats.totalAmount.toFixed(2)}</p>
          </Card>
          <Card className="p-5 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <p className="text-sm mb-1">Active</p>
            <p className="text-3xl font-bold">{stats.active}</p>
          </Card>
          <Card className="p-5 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <p className="text-sm mb-1">Completed</p>
            <p className="text-3xl font-bold">{stats.completed}</p>
          </Card>
        </div>

        <Card className="p-4 mb-6">
          <div className="flex gap-2">
            <button onClick={() => setFilterType('all')} className={'px-4 py-2 rounded-lg ' + (filterType === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-100')}>All</button>
            <button onClick={() => setFilterType('color')} className={'px-4 py-2 rounded-lg ' + (filterType === 'color' ? 'bg-blue-500 text-white' : 'bg-gray-100')}>Color</button>
            <button onClick={() => setFilterType('number')} className={'px-4 py-2 rounded-lg ' + (filterType === 'number' ? 'bg-blue-500 text-white' : 'bg-gray-100')}>Number</button>
          </div>
        </Card>
      </div>

      <div className="max-w-7xl mx-auto">
        {loading ? (
          <Card className="p-12 text-center">
            <RefreshCw className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-500" />
            <p className="text-gray-600">Loading trades...</p>
          </Card>
        ) : trades.length === 0 ? (
          <Card className="p-12 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Trades Found</h3>
            <p className="text-gray-600">You haven't placed any trades yet</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {trades.map((trade, i) => {
              // Use memoized amounts from the Map
              const amounts = tradeAmountsMap.get(trade.roundId) || {
                colorAmount: 0,
                numberAmount: 0,
                colorCount: 0,
                numberCount: 0,
                totalAmount: 0,
              };
              
              return (
                <Card key={i} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          trade.roundType === 'colour' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-purple-100 text-purple-700'
                        }`}>
                          {trade.roundType === 'colour' ? 'Color Trading' : 'Number Trading'}
                        </div>
                        {trade.status && (
                          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            trade.status === 'active' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {trade.status.toUpperCase()}
                          </div>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">Round ID: <span className="font-mono text-gray-900">{trade.roundId}</span></p>
                      
                      <div className="grid grid-cols-3 gap-4 mt-4">
                        <div>
                          <p className="text-xs text-gray-500">Color Trades</p>
                          <p className="text-lg font-bold text-gray-900">{amounts.colorCount}</p>
                          <p className="text-sm text-gray-600">₹{amounts.colorAmount.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Number Trades</p>
                          <p className="text-lg font-bold text-gray-900">{amounts.numberCount}</p>
                          <p className="text-sm text-gray-600">₹{amounts.numberAmount.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Total Amount</p>
                          <p className="text-2xl font-bold text-green-600">₹{amounts.totalAmount.toFixed(2)}</p>
                        </div>
                      </div>

                      {/* Individual selections */}
                      {renderColorSelections(trade)}
                      {renderNumberSelections(trade)}

                      {trade.result && (
                        <div className="mt-4 pt-4 border-t">
                          <p className="text-sm text-gray-600">
                            Result: <span className="font-bold text-green-600">{String(trade.result)}</span>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTrades;
