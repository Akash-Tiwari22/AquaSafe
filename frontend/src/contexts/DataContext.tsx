import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface WaterQualityData {
  avgHMPI: number;
  safeQuality: number;
  unsafeCritical: number;
  metalConcentrations: {
    arsenic: number;
    lead: number;
    mercury: number;
    cadmium: number;
    chromium: number;
  };
  sampleCount: number;
  lastUpdated: string;
  source: 'uploaded' | 'complete';
}

interface DataContextType {
  currentView: 'uploaded' | 'complete';
  uploadedData: WaterQualityData | null;
  completeData: WaterQualityData;
  setCurrentView: (view: 'uploaded' | 'complete') => void;
  setUploadedData: (data: WaterQualityData) => void;
  clearUploadedData: () => void;
  getCurrentData: () => WaterQualityData;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Default complete dataset
const defaultCompleteData: WaterQualityData = {
  avgHMPI: 72.5,
  safeQuality: 70,
  unsafeCritical: 30,
  metalConcentrations: {
    arsenic: 0.01,
    lead: 0.005,
    mercury: 0.001,
    cadmium: 0.002,
    chromium: 0.05
  },
  sampleCount: 1250,
  lastUpdated: new Date().toISOString(),
  source: 'complete'
};

export function DataProvider({ children }: { children: ReactNode }) {
  const [currentView, setCurrentView] = useState<'uploaded' | 'complete'>('complete');
  const [uploadedData, setUploadedData] = useState<WaterQualityData | null>(null);

  const clearUploadedData = () => {
    setUploadedData(null);
    setCurrentView('complete');
  };

  const getCurrentData = (): WaterQualityData => {
    if (currentView === 'uploaded' && uploadedData) {
      return uploadedData;
    }
    return defaultCompleteData;
  };

  return (
    <DataContext.Provider
      value={{
        currentView,
        uploadedData,
        completeData: defaultCompleteData,
        setCurrentView,
        setUploadedData,
        clearUploadedData,
        getCurrentData
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
