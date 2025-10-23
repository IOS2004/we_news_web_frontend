import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { tradingService } from '@/services/tradingApi';
import type { UserTrades, TradingColor } from '@/types/trading';
import { formatCurrency } from '@/utils/helpers';

export default function TradingHistory() {
  const navigate = useNavigate();
  const [allTrades, setAllTrades] = useState<UserTrades[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'colour' | 'number'>('all');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const trades = await tradingService.getAllMyTrades();
      setAllTrades(trades);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTrades = allTrades.filter(trade => {
    if (filter === 'all') return true;
    return trade.roundType === filter;
  });

  const formatDate = (timestamp: any): string => {
    try {
      let date: Date;
      if (timestamp && typeof timestamp === 'object' && timestamp._seconds) {
        date = new Date(timestamp._seconds * 1000);
      } else if (timestamp && typeof timestamp.toDate === 'function') {
        date = timestamp.toDate();
      } else {
        date = new Date(timestamp);
      }
      return date.toLocaleString();
    } catch {
      return 'N/A';
    }
  };

  const getResultDisplay = (trade: UserTrades): string => {
    if (trade.status !== 'completed') return 'Pending';
    if (!trade.result) return 'No Result';
    return String(trade.result);
  };

  const getColorTradeSummary = (colorTrades: Record<TradingColor, any[]>) => {
    const summary: { color: string; amount: number }[] = [];
    Object.entries(colorTrades).forEach(([color, trades]) => {
      if (trades && trades.length > 0) {
        const total = trades.reduce((sum, t) => sum + t.amount, 0);
        summary.push({ color, amount: total });
      }
    });
    return summary;
  };

  const getNumberTradeSummary = (numberTrades: Record<number, any[]>) => {
    const summary: { number: number; amount: number }[] = [];
    Object.entries(numberTrades).forEach(([num, trades]) => {
      if (trades && trades.length > 0) {
        const total = trades.reduce((sum, t) => sum + t.amount, 0);
        summary.push({ number: Number(num), amount: total });
      }
    });
    return summary;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Trading History</h1>
        <p className="text-muted-foreground">View all your past trades and results</p>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            filter === 'all'
              ? 'bg-primary text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          All ({allTrades.length})
        </button>
        <button
          onClick={() => setFilter('colour')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            filter === 'colour'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Color ({allTrades.filter(t => t.roundType === 'colour').length})
        </button>
        <button
          onClick={() => setFilter('number')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            filter === 'number'
              ? 'bg-green-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Number ({allTrades.filter(t => t.roundType === 'number').length})
        </button>
      </div>

      {/* Trades List */}
      {filteredTrades.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold mb-2">No Trading History</h3>
          <p className="text-muted-foreground mb-6">
            You haven't placed any trades yet. Start trading now!
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => navigate('/color-trading')}>
              Color Trading
            </Button>
            <Button onClick={() => navigate('/number-trading')} variant="secondary">
              Number Trading
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredTrades.map((trade, index) => {
            const colorSummary = getColorTradeSummary(trade.colorTrades);
            const numberSummary = getNumberTradeSummary(trade.numberTrades);
            
            return (
              <Card key={`${trade.roundId}-${index}`} className="p-6">
                {/* Round Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        trade.roundType === 'colour'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {trade.roundType === 'colour' ? 'Color' : 'Number'} Trading
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        trade.status === 'completed'
                          ? 'bg-gray-100 text-gray-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {trade.status === 'completed' ? 'Finished' : 'Active'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {trade.startTime && formatDate(trade.startTime)}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Total Bet</div>
                    <div className="text-2xl font-bold">{formatCurrency(trade.totalAmount)}</div>
                  </div>
                </div>

                {/* Color Trades */}
                {colorSummary.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Color Bets:</h4>
                    <div className="flex flex-wrap gap-2">
                      {colorSummary.map(({ color, amount }) => {
                        const config = tradingService.getColorConfig(color as TradingColor);
                        const isWinner = trade.status === 'completed' && trade.result === color;
                        
                        return (
                          <div
                            key={color}
                            className={`px-3 py-2 rounded-lg flex items-center gap-2 ${
                              isWinner 
                                ? 'ring-2 ring-yellow-400 bg-yellow-50'
                                : config.bgClass
                            } ${config.textClass}`}
                          >
                            <span className="font-semibold">{config.displayName}</span>
                            <span className={isWinner ? 'text-yellow-700 font-bold' : ''}>
                              {formatCurrency(amount)}
                            </span>
                            {isWinner && <span className="text-yellow-600">🏆</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Number Trades */}
                {numberSummary.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Number Bets:</h4>
                    <div className="flex flex-wrap gap-2">
                      {numberSummary.map(({ number, amount }) => {
                        const isWinner = trade.status === 'completed' && trade.result === number;
                        
                        return (
                          <div
                            key={number}
                            className={`px-3 py-2 rounded-lg flex items-center gap-2 ${
                              isWinner
                                ? 'bg-yellow-100 text-yellow-900 ring-2 ring-yellow-400 font-bold'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <span className="font-mono font-semibold">{number}</span>
                            <span>{formatCurrency(amount)}</span>
                            {isWinner && <span>🏆</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Result */}
                {trade.status === 'completed' && (
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm text-muted-foreground">Result: </span>
                        <span className="text-lg font-bold text-gray-900">
                          {getResultDisplay(trade)}
                        </span>
                      </div>
                      
                      {trade.result && (
                        colorSummary.some(c => c.color === trade.result) || 
                        numberSummary.some(n => n.number === trade.result)
                      ) && (
                        <div className="flex items-center gap-2 text-green-600">
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="font-semibold">You Won!</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
