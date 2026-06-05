import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import {
  Customization,
  DEFAULT_CUSTOMIZATION,
  loadCustomization,
  saveCustomization,
  resolveVars,
} from '@/lib/customization';
import { setMuted } from '@/lib/sound';

interface CustomizationContextType {
  customization: Customization;
  update: (patch: Partial<Customization>) => void;
  reset: () => void;
}

const CustomizationContext = createContext<CustomizationContextType | undefined>(undefined);

/** Apply the chosen palette + structural options to the document root. */
function applyCustomization(c: Customization) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const vars = resolveVars(c);
  for (const [key, value] of Object.entries(vars)) {
    root.style.setProperty(key, value);
  }
  root.dataset.board = c.boardStyle;
  root.dataset.skin = c.snakeSkin;
  root.dataset.food = c.foodShape;
  root.dataset.blink = c.foodBlink ? 'on' : 'off';
}

export function CustomizationProvider({ children }: { children: ReactNode }) {
  const [customization, setCustomization] = useState<Customization>(() => loadCustomization());

  useEffect(() => {
    applyCustomization(customization);
    saveCustomization(customization);
    // Keep the low-level audio mute in sync (sound.ts is the gate sfx checks).
    setMuted(!customization.sound);
  }, [customization]);

  const update = useCallback((patch: Partial<Customization>) => {
    setCustomization(prev => ({ ...prev, ...patch }));
  }, []);

  const reset = useCallback(() => {
    setCustomization({ ...DEFAULT_CUSTOMIZATION });
  }, []);

  return (
    <CustomizationContext.Provider value={{ customization, update, reset }}>
      {children}
    </CustomizationContext.Provider>
  );
}

export function useCustomization() {
  const ctx = useContext(CustomizationContext);
  if (!ctx) throw new Error('useCustomization must be used within a CustomizationProvider');
  return ctx;
}
