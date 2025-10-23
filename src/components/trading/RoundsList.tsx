import { Clock, TrendingUp, Users } from 'lucide-react';
import Card from '@/components/common/Card';

interface Round {
  id: string;
  roundId?: string;
  roundNumber: number;
  gameType: 'color' | 'number';
  status: 'upcoming' | 'active' | 'open' | 'closed' | 'settled' | 'cancelled' | 'completed';
  startTime?: Date | { toDate?: () => Date } | any;
  startsAt?: Date | { toDate?: () => Date } | any;
  resultDeclarationTime?: Date | { toDate?: () => Date } | any;
  endsAt?: Date | { toDate?: () => Date } | any;
  options?: string[];
  multipliers?: Record<string, number>;
  winningOption?: string | null;
  totalTrades?: number;
}

interface RoundListProps {
  rounds: Round[];
  selectedRoundId: string | null;
  onSelectRound: (roundId: string) => void;
  title: string;
  emptyMessage?: string;
}

// Helper to format date
const formatDateTime = (date: any): string => {
  if (!date) return 'N/A';
  
  try {
    let dateObj: Date;
    
    // Handle Firestore Timestamp
    if (date.toDate && typeof date.toDate === 'function') {
      dateObj = date.toDate();
    } else if (date instanceof Date) {
      dateObj = date;
    } else if (typeof date === 'string' || typeof date === 'number') {
      dateObj = new Date(date);
    } else {
      return 'N/A';
    }
    
    const now = new Date();
    const diffMs = dateObj.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    
    // If in the past
    if (diffMs < 0) {
      return dateObj.toLocaleString('en-IN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    // If less than 60 minutes away
    if (diffMins < 60) {
      return `in ${diffMins} min${diffMins !== 1 ? 's' : ''}`;
    }
    
    // If less than 24 hours away
    if (diffHours < 24) {
      return `in ${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
    }
    
    // Otherwise show date
    return dateObj.toLocaleString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return 'N/A';
  }
};

// Get status color
const getStatusColor = (status: string) => {
  switch (status) {
    case 'upcoming':
      return 'bg-blue-100 text-blue-700 border-blue-300';
    case 'active':
    case 'open':
      return 'bg-green-100 text-green-700 border-green-300';
    case 'closed':
      return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    case 'completed':
    case 'settled':
      return 'bg-gray-100 text-gray-700 border-gray-300';
    case 'cancelled':
      return 'bg-red-100 text-red-700 border-red-300';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-300';
  }
};

// Get status icon
const getStatusIcon = (status: string) => {
  switch (status) {
    case 'upcoming':
      return '⏳';
    case 'active':
    case 'open':
      return '▶️';
    case 'closed':
      return '🔒';
    case 'completed':
    case 'settled':
      return '✅';
    case 'cancelled':
      return '❌';
    default:
      return '⏸️';
  }
};

export const RoundsList = ({
  rounds,
  selectedRoundId,
  onSelectRound,
  title,
  emptyMessage = 'No rounds available'
}: RoundListProps) => {
  if (rounds.length === 0) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <div className="text-center py-8 text-muted-foreground">
          <Clock className="mx-auto mb-2 opacity-50" size={40} />
          <p>{emptyMessage}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rounds.map((round) => {
          const isSelected = selectedRoundId === round.id;
          const canSelect = round.status === 'active' || round.status === 'open' || round.status === 'upcoming';
          
          return (
            <button
              key={round.id}
              onClick={() => canSelect && onSelectRound(round.id)}
              disabled={!canSelect}
              className={`
                text-left p-4 rounded-lg border-2 transition-all duration-200
                ${isSelected 
                  ? 'bg-gradient-to-br from-blue-50 to-purple-50 border-blue-500 shadow-lg ring-2 ring-blue-300 scale-105' 
                  : canSelect
                    ? 'bg-card border-border hover:border-blue-300 hover:shadow-md hover:scale-102'
                    : 'bg-muted border-border opacity-60 cursor-not-allowed'
                }
              `}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getStatusIcon(round.status)}</span>
                  <div>
                    <h3 className="font-bold text-base">Round #{round.roundNumber}</h3>
                    <p className="text-xs text-muted-foreground">
                      {round.roundId?.slice(-6) || round.id.slice(-6)}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(round.status)}`}>
                  {round.status === 'active' || round.status === 'open' ? 'ACTIVE' : round.status.toUpperCase()}
                </span>
              </div>

              {/* Details */}
              <div className="space-y-2">
                {/* Game Type */}
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp size={14} className="text-muted-foreground" />
                  <span className="text-muted-foreground capitalize">{round.gameType}</span>
                </div>

                {/* Total Trades */}
                <div className="flex items-center gap-2 text-sm">
                  <Users size={14} className="text-muted-foreground" />
                  <span className="text-muted-foreground">Trades: {round.totalTrades || 0}</span>
                </div>

                {/* Betting Closes Time - Most Important */}
                {round.resultDeclarationTime && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock size={14} className="text-orange-600" />
                    <span className="text-orange-700 font-medium text-xs">
                      Closes: {formatDateTime(round.resultDeclarationTime)}
                    </span>
                  </div>
                )}
              </div>

              {/* Selection Indicator */}
              {isSelected && (
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <div className="flex items-center justify-center gap-1 text-blue-600 font-semibold text-sm">
                    <span>✓</span>
                    <span>Selected</span>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </Card>
  );
};

export default RoundsList;
