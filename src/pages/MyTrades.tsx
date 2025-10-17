import React, { useState, useEffect, useCallback } from 'react';
import { 
  Trash2, 
  Calendar, 
  TrendingUp, 
  TrendingDown,
  Circle,
  Hash,
  Filter,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import tradingApi, { TradingOrder } from '../services/tradingApi';

type FilterType = 'all' | 'color' | 'number';
type StatusFilter = 'all' | 'pending' | 'won' | 'lost';

const MyTrades: React.FC = () => {
  const [trades, setTrades] = useState<TradingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    fetchTrades();
  }, [filterType, statusFilter, page]);

  const fetchTrades = async () => {
    try {
      setLoading(true);
      const response = await tradingApi.getMyOrders({
        page,
        limit: 20,
        status: statusFilter === 'all' ? undefined : statusFilter,
        gameType: filterType === 'all' ? undefined : filterType,
      });
      
      setTrades(response.items);
      setHasMore(response.pagination?.hasNext || false);
    } catch (error: any) {
      console.error('Failed to fetch trades:', error);
      toast.error('Failed to load trades');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelTrade = async (tradeId: string) => {
    if (!window.confirm('Are you sure you want to cancel this trade?')) {
      return;
    }

    try {
      await tradingApi.cancelOrder(tradeId);
      toast.success('Trade cancelled successfully');
      fetchTrades(); // Refresh the list
    } catch (error: any) {
      console.error('Failed to cancel trade:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel trade');
    }
  };

  const filteredTrades = trades;

  const stats = {
    total: filteredTrades.length,
    totalAmount: filteredTrades.reduce((sum, t) => sum + t.totalAmount, 0),
    pending: filteredTrades.filter(t => t.status === 'pending').length,
    won: filteredTrades.filter(t => t.status === 'won').length,
    lost: filteredTrades.filter(t => t.status === 'lost').length,
    totalWin: filteredTrades
      .filter(t => t.status === 'won')
      .reduce((sum, t) => sum + (t.payout || 0), 0),
    profitLoss: filteredTrades.reduce((sum, t) => {
      if (t.status === 'won') return sum + (t.profit || 0);
      if (t.status === 'lost') return sum - t.totalAmount;
      return sum;
    }, 0),
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'won': return 'text-green-600 bg-green-50';
      case 'lost': return 'text-red-600 bg-red-50';
      case 'cancelled': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getGameTypeIcon = (type: string) => {
    return type === 'color' ? <Circle className="w-5 h-5" /> : <Hash className="w-5 h-5" />;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">My Trades</h1>
            <button
              onClick={fetchTrades}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-white/80 text-sm mb-1">Total Trades</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-white/80 text-sm mb-1">Total Invested</p>
              <p className="text-2xl font-bold">₹{stats.totalAmount.toFixed(2)}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-white/80 text-sm mb-1">Total Won</p>
              <p className="text-2xl font-bold">₹{stats.totalWin.toFixed(2)}</p>
            </div>
            <div className={`bg-white/10 backdrop-blur-sm rounded-xl p-4 ${
              stats.profitLoss >= 0 ? '' : 'bg-red-500/20'
            }`}>
              <p className="text-white/80 text-sm mb-1">Profit/Loss</p>
              <p className="text-2xl font-bold flex items-center gap-1">
                {stats.profitLoss >= 0 ? (
                  <TrendingUp className="w-5 h-5" />
                ) : (
                  <TrendingDown className="w-5 h-5" />
                )}
                ₹{Math.abs(stats.profitLoss).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="font-semibold text-gray-900">Filters</span>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {/* Type Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilterType('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterType === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Types
              </button>
              <button
                onClick={() => setFilterType('color')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterType === 'color'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Circle className="w-4 h-4 inline mr-1" />
                Color
              </button>
              <button
                onClick={() => setFilterType('number')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterType === 'number'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Hash className="w-4 h-4 inline mr-1" />
                Number
              </button>
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Status
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === 'pending'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Pending ({stats.pending})
              </button>
              <button
                onClick={() => setStatusFilter('won')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === 'won'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Won ({stats.won})
              </button>
              <button
                onClick={() => setStatusFilter('lost')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === 'lost'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Lost ({stats.lost})
              </button>
            </div>
          </div>
        </div>

        {/* Trades List */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : filteredTrades.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Trades Found</h3>
            <p className="text-gray-600">You haven't placed any trades yet. Start trading to see your history here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTrades.map((trade) => (
              <div
                key={trade.id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden"
              >
                <div className="p-5">
                  {/* Trade Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        {getGameTypeIcon(trade.round.gameType)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {trade.round.gameType === 'color' ? 'Color Trading' : 'Number Trading'}
                        </h3>
                        <p className="text-sm text-gray-500">Round #{trade.round.roundNumber}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(trade.status)}`}>
                        {trade.status.charAt(0).toUpperCase() + trade.status.slice(1)}
                      </span>
                      {trade.status === 'pending' && (
                        <button
                          onClick={() => handleCancelTrade(trade.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Cancel trade"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Selections */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Selections:</p>
                    <div className="flex flex-wrap gap-2">
                      {trade.selections.map((selection, idx) => (
                        <div
                          key={idx}
                          className={`px-4 py-2 rounded-lg font-medium ${
                            trade.round.gameType === 'color'
                              ? selection.option === 'red'
                                ? 'bg-red-100 text-red-700'
                                : selection.option === 'green'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-purple-100 text-purple-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {selection.option} • ₹{selection.amount}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Trade Details */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 py-4 border-t border-gray-100">
                    <div>
                      <p className="text-sm text-gray-600">Total Bet</p>
                      <p className="text-lg font-semibold text-gray-900">₹{trade.totalAmount}</p>
                    </div>
                    {trade.status === 'won' && (
                      <>
                        <div>
                          <p className="text-sm text-gray-600">Payout</p>
                          <p className="text-lg font-semibold text-green-600">₹{trade.payout?.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Profit</p>
                          <p className="text-lg font-semibold text-green-600">+₹{trade.profit?.toFixed(2)}</p>
                        </div>
                      </>
                    )}
                    {trade.status === 'lost' && (
                      <div>
                        <p className="text-sm text-gray-600">Loss</p>
                        <p className="text-lg font-semibold text-red-600">-₹{trade.totalAmount}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-600">
                        <Calendar className="w-3 h-3 inline mr-1" />
                        Date
                      </p>
                      <p className="text-sm font-medium text-gray-900">{formatDate(trade.createdAt)}</p>
                    </div>
                  </div>

                  {/* Result */}
                  {trade.round.result && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-600">
                        Result: <span className="font-semibold text-gray-900">{trade.round.result}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More */}
        {hasMore && !loading && (
          <div className="text-center mt-6">
            <button
              onClick={() => setPage(p => p + 1)}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTrades;
