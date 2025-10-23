import React, { useState, useEffect } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import tradingApi from '../services/tradingApi';
import { UserTrades } from '@/types/trading';
import Card from '@/components/common/Card';

type FilterType = 'all' | 'color' | 'number';

const MyTrades: React.FC = () => {
  const [trades, setTrades] = useState<UserTrades[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<FilterType>('all');

  useEffect(() => {
    fetchTrades();
  }, [filterType]);

  const fetchTrades = async () => {
    try {
      setLoading(true);
      const response = await tradingApi.getMyOrders({
        gameType: filterType === 'all' ? undefined : filterType,
      });
      
      setTrades(response.items);
    } catch (error: any) {
      console.error('Failed to fetch trades:', error);
      toast.error('Failed to load trades');
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: trades.length,
    totalAmount: trades.reduce((sum, t) => sum + t.totalAmount, 0),
    active: trades.filter(t => t.status === 'active').length,
    completed: trades.filter(t => t.status === 'completed').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Trades</h1>
            <p className="text-gray-600 mt-1">View your trading history</p>
          </div>
          <button onClick={fetchTrades} disabled={loading} className="p-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600">
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
          <Card className="p-12 text-center"><RefreshCw className="w-12 h-12 animate-spin mx-auto mb-4" /><p>Loading...</p></Card>
        ) : trades.length === 0 ? (
          <Card className="p-12 text-center"><AlertCircle className="w-12 h-12 mx-auto mb-4" /><h3>No Trades</h3></Card>
        ) : (
          <div>{trades.map((trade, i) => <Card key={i} className="p-6 mb-4"><p>Round: {trade.roundId}</p><p>Total: ₹{trade.totalAmount}</p></Card>)}</div>
        )}
      </div>
    </div>
  );
};

export default MyTrades;
