import React, { createContext, ReactNode, useContext, useState } from 'react';

type TempUnit = 'Celsius' | 'Fahrenheit';
type WindSpeedUnit = 'km/h' | 'm/s' | 'knots';
type PressureUnit = 'hPa' | 'inches' | 'kPa' | 'mm';
type DistanceUnit = 'Kilometers' | 'Miles';

interface SettingsContextType {
  tempUnit: TempUnit;
  setTempUnit: (unit: TempUnit) => void;
  windSpeedUnit: WindSpeedUnit;
  setWindSpeedUnit: (unit: WindSpeedUnit) => void;
  pressureUnit: PressureUnit;
  setPressureUnit: (unit: PressureUnit) => void;
  distanceUnit: DistanceUnit;
  setDistanceUnit: (unit: DistanceUnit) => void;
  timeFormat24h: boolean;
  setTimeFormat24h: (value: boolean) => void;
  convertTemp: (temp: number) => number;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [tempUnit, setTempUnit] = useState<TempUnit>('Celsius');
  const [windSpeedUnit, setWindSpeedUnit] = useState<WindSpeedUnit>('km/h');
  const [pressureUnit, setPressureUnit] = useState<PressureUnit>('hPa');
  const [distanceUnit, setDistanceUnit] = useState<DistanceUnit>('Kilometers');
  const [timeFormat24h, setTimeFormat24h] = useState(true);

  const convertTemp = (temp: number) => {
    if (tempUnit === 'Fahrenheit') {
      return Math.round((temp * 9/5) + 32);
    }
    return Math.round(temp);
  };

  return (
    <SettingsContext.Provider value={{ 
      tempUnit, 
      setTempUnit, 
      windSpeedUnit, 
      setWindSpeedUnit,
      pressureUnit,
      setPressureUnit,
      distanceUnit,
      setDistanceUnit,
      timeFormat24h,
      setTimeFormat24h,
      convertTemp 
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}; 