import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { tradingService } from '@/services/tradingApi';
import toast from 'react-hot-toast';

interface Round {
  id: string;
  roundId?: string;
  roundNumber: number;
  gameType: 'color' | 'number';
  roundType?: 'colour' | 'number';
  status: 'upcoming' | 'active' | 'open' | 'closed' | 'settled' | 'cancelled' | 'completed';
  startTime?: any;
  resultDeclarationTime?: any;
  totalTrades?: number;
  [key: string]: any;
}

interface RoundsContextType {
  // Color rounds
  colorActiveRounds: Round[];
  colorUpcomingRounds: Round[];
  selectedColorRoundId: string | null;
  setSelectedColorRoundId: (id: string | null) => void;
  
  // Number rounds
  numberActiveRounds: Round[];
  numberUpcomingRounds: Round[];
  selectedNumberRoundId: string | null;
  setSelectedNumberRoundId: (id: string | null) => void;
  
  // Loading states
  isLoadingColorRounds: boolean;
  isLoadingNumberRounds: boolean;
  
  // Fetch functions
  fetchColorRounds: (forceRefresh?: boolean) => Promise<void>;
  fetchNumberRounds: (forceRefresh?: boolean) => Promise<void>;
  refreshAllRounds: () => Promise<void>;
  
  // Last fetch timestamps
  lastColorFetch: number | null;
  lastNumberFetch: number | null;
}

const RoundsContext = createContext<RoundsContextType | undefined>(undefined);

// Cache duration: 30 seconds
const CACHE_DURATION = 30 * 1000;

export const RoundsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Color rounds state
  const [colorActiveRounds, setColorActiveRounds] = useState<Round[]>([]);
  const [colorUpcomingRounds, setColorUpcomingRounds] = useState<Round[]>([]);
  const [selectedColorRoundId, setSelectedColorRoundId] = useState<string | null>(null);
  const [isLoadingColorRounds, setIsLoadingColorRounds] = useState(false);
  const [lastColorFetch, setLastColorFetch] = useState<number | null>(null);

  // Number rounds state
  const [numberActiveRounds, setNumberActiveRounds] = useState<Round[]>([]);
  const [numberUpcomingRounds, setNumberUpcomingRounds] = useState<Round[]>([]);
  const [selectedNumberRoundId, setSelectedNumberRoundId] = useState<string | null>(null);
  const [isLoadingNumberRounds, setIsLoadingNumberRounds] = useState(false);
  const [lastNumberFetch, setLastNumberFetch] = useState<number | null>(null);

  // Fetch color rounds with cache check
  const fetchColorRounds = useCallback(async (forceRefresh = false) => {
    const now = Date.now();
    
    // Check if we have cached data and it's still fresh
    if (!forceRefresh && lastColorFetch && (now - lastColorFetch) < CACHE_DURATION) {
      console.log('Using cached color rounds data');
      return;
    }

    setIsLoadingColorRounds(true);
    try {
      const [upcoming, active] = await Promise.all([
        tradingService.getUpcomingRounds('colour', 10),
        tradingService.getActiveRounds('colour')
      ]);
      
      // Add gameType to rounds
      const upcomingWithType = upcoming.map(r => ({ ...r, gameType: 'color' as const }));
      const activeWithType = active.map(r => ({ ...r, gameType: 'color' as const }));
      
      setColorUpcomingRounds(upcomingWithType);
      setColorActiveRounds(activeWithType);
      setLastColorFetch(now);
      
      // Auto-select first active round if none selected and there are active rounds
      if (!selectedColorRoundId && active.length > 0) {
        setSelectedColorRoundId(active[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch color rounds:', error);
      toast.error('Failed to load color rounds');
    } finally {
      setIsLoadingColorRounds(false);
    }
  }, [lastColorFetch, selectedColorRoundId]);

  // Fetch number rounds with cache check
  const fetchNumberRounds = useCallback(async (forceRefresh = false) => {
    const now = Date.now();
    
    // Check if we have cached data and it's still fresh
    if (!forceRefresh && lastNumberFetch && (now - lastNumberFetch) < CACHE_DURATION) {
      console.log('Using cached number rounds data');
      return;
    }

    setIsLoadingNumberRounds(true);
    try {
      const [upcoming, active] = await Promise.all([
        tradingService.getUpcomingRounds('number', 10),
        tradingService.getActiveRounds('number')
      ]);
      
      // Add gameType to rounds
      const upcomingWithType = upcoming.map(r => ({ ...r, gameType: 'number' as const }));
      const activeWithType = active.map(r => ({ ...r, gameType: 'number' as const }));
      
      setNumberUpcomingRounds(upcomingWithType);
      setNumberActiveRounds(activeWithType);
      setLastNumberFetch(now);
      
      // Auto-select first active round if none selected and there are active rounds
      if (!selectedNumberRoundId && active.length > 0) {
        setSelectedNumberRoundId(active[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch number rounds:', error);
      toast.error('Failed to load number rounds');
    } finally {
      setIsLoadingNumberRounds(false);
    }
  }, [lastNumberFetch, selectedNumberRoundId]);

  // Refresh all rounds (force refresh)
  const refreshAllRounds = useCallback(async () => {
    await Promise.all([
      fetchColorRounds(true),
      fetchNumberRounds(true)
    ]);
  }, [fetchColorRounds, fetchNumberRounds]);

  // Auto-refresh rounds every 60 seconds if data is stale
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      
      // Refresh color rounds if they were fetched and are now stale
      if (lastColorFetch && (now - lastColorFetch) > CACHE_DURATION) {
        console.log('Auto-refreshing stale color rounds');
        fetchColorRounds(true);
      }
      
      // Refresh number rounds if they were fetched and are now stale
      if (lastNumberFetch && (now - lastNumberFetch) > CACHE_DURATION) {
        console.log('Auto-refreshing stale number rounds');
        fetchNumberRounds(true);
      }
    }, 60000); // Check every 60 seconds

    return () => clearInterval(interval);
  }, [lastColorFetch, lastNumberFetch, fetchColorRounds, fetchNumberRounds]);

  const value: RoundsContextType = {
    // Color rounds
    colorActiveRounds,
    colorUpcomingRounds,
    selectedColorRoundId,
    setSelectedColorRoundId,
    
    // Number rounds
    numberActiveRounds,
    numberUpcomingRounds,
    selectedNumberRoundId,
    setSelectedNumberRoundId,
    
    // Loading states
    isLoadingColorRounds,
    isLoadingNumberRounds,
    
    // Fetch functions
    fetchColorRounds,
    fetchNumberRounds,
    refreshAllRounds,
    
    // Last fetch timestamps
    lastColorFetch,
    lastNumberFetch,
  };

  return <RoundsContext.Provider value={value}>{children}</RoundsContext.Provider>;
};

export const useRounds = () => {
  const context = useContext(RoundsContext);
  if (context === undefined) {
    throw new Error('useRounds must be used within a RoundsProvider');
  }
  return context;
};
