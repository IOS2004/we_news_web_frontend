import { Clock } from 'lucide-react';
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
    
    // Handle Firestore Timestamp serialized from backend (has _seconds and _nanoseconds)
    if (date._seconds !== undefined) {
      dateObj = new Date(date._seconds * 1000);
    }
    // Handle Firestore Timestamp object (has toDate method)
    else if (date.toDate && typeof date.toDate === 'function') {
      dateObj = date.toDate();
    } 
    // Handle Date object
    else if (date instanceof Date) {
      dateObj = date;
    } 
    // Handle string or number timestamp
    else if (typeof date === 'string' || typeof date === 'number') {
      dateObj = new Date(date);
    } 
    // Unknown format
    else {
      console.warn('Unknown date format:', date);
      return 'N/A';
    }
    
    // Validate the date
    if (isNaN(dateObj.getTime())) {
      console.warn('Invalid date:', date);
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
    console.error('Error formatting date:', date, error);
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
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          {title}
        </h2>
        <div className="text-center py-8 text-muted-foreground">
          <Clock className="mx-auto mb-2 opacity-50" size={40} />
          <p className="text-sm">{emptyMessage}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
        {title}
        <span className="text-sm font-normal text-muted-foreground">({rounds.length})</span>
      </h2>
      <div className="grid grid-cols-1 gap-3">
        {rounds.map((round) => {
          const isSelected = selectedRoundId === round.id;
          const canSelect = round.status === 'active' || round.status === 'open' || round.status === 'upcoming';
          
          return (
            <button
              key={round.id}
              onClick={() => canSelect && onSelectRound(round.id)}
              disabled={!canSelect}
              className={`
                text-left p-4 rounded-xl border-2 transition-all duration-200
                ${isSelected 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 border-blue-600 shadow-lg text-white scale-[1.02]' 
                  : canSelect
                    ? 'bg-white border-gray-200 hover:border-blue-400 hover:shadow-md'
                    : 'bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed'
                }
              `}
            >
              <div className="flex items-center justify-between">
                {/* Left: Round Info */}
                <div className="flex items-center gap-3 flex-1">
                  <div className={`text-2xl ${isSelected ? 'opacity-100' : 'opacity-80'}`}>
                    {getStatusIcon(round.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-bold text-lg ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                        Round #{round.roundNumber}
                      </h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        isSelected 
                          ? 'bg-white/20 text-white' 
                          : getStatusColor(round.status)
                      }`}>
                        {round.status === 'active' || round.status === 'open' ? 'ACTIVE' : round.status.toUpperCase()}
                      </span>
                    </div>
                    <p className={`text-xs mt-0.5 ${isSelected ? 'text-white/80' : 'text-muted-foreground'}`}>
                      ID: {round.roundId?.substring(0, 8) || round.id.substring(0, 8)}
                    </p>
                  </div>
                </div>

                {/* Right: Stats */}
                <div className="flex items-center gap-4">
                  {/* Trades Count */}
                  <div className="text-center">
                    <div className={`text-xs ${isSelected ? 'text-white/70' : 'text-muted-foreground'}`}>
                      Trades
                    </div>
                    <div className={`text-lg font-bold ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                      {round.totalTrades || 0}
                    </div>
                  </div>

                  {/* Start Time */}
                  {round.startTime && (round.status === 'upcoming' || round.status === 'active') && (
                    <div className={`px-3 py-2 rounded-lg ${
                      isSelected ? 'bg-white/20' : 'bg-blue-50'
                    }`}>
                      <div className={`text-xs ${isSelected ? 'text-white/80' : 'text-blue-600'} flex items-center gap-1`}>
                        <Clock size={12} />
                        <span>Starts</span>
                      </div>
                      <div className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-blue-700'}`}>
                        {formatDateTime(round.startTime)}
                      </div>
                    </div>
                  )}

                  {/* Closing Time */}
                  {round.resultDeclarationTime && (round.status === 'active' || round.status === 'open') && (
                    <div className={`px-3 py-2 rounded-lg ${
                      isSelected ? 'bg-white/20' : 'bg-orange-50'
                    }`}>
                      <div className={`text-xs ${isSelected ? 'text-white/80' : 'text-orange-600'} flex items-center gap-1`}>
                        <Clock size={12} />
                        <span>Closes</span>
                      </div>
                      <div className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-orange-700'}`}>
                        {formatDateTime(round.resultDeclarationTime)}
                      </div>
                    </div>
                  )}

                  {/* Selected Indicator */}
                  {isSelected && (
                    <div className="ml-2">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                        <span className="text-white text-lg">✓</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
};

export default RoundsList;
