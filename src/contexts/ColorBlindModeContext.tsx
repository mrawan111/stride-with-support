import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

interface ColorBlindModeContextType {
  isColorBlindMode: boolean;
  toggleColorBlindMode: () => Promise<void>;
  loading: boolean;
}

const ColorBlindModeContext = createContext<ColorBlindModeContextType | undefined>(undefined);

export const ColorBlindModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isColorBlindMode, setIsColorBlindMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Load color blind mode preference from database
  useEffect(() => {
    const loadPreference = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('users')
            .select('color_blind_mode')
            .eq('id', user.id)
            .single();

          if (!error && data) {
            setIsColorBlindMode(data.color_blind_mode || false);
            applyColorBlindMode(data.color_blind_mode || false);
          }
        } catch (error) {
          console.error('Error loading color blind mode preference:', error);
        }
      } else {
        // Load from localStorage for non-authenticated users
        const savedMode = localStorage.getItem('colorBlindMode') === 'true';
        setIsColorBlindMode(savedMode);
        applyColorBlindMode(savedMode);
      }
      setLoading(false);
    };

    loadPreference();
  }, [user]);

  const applyColorBlindMode = (enabled: boolean) => {
    if (enabled) {
      document.documentElement.classList.add('color-blind-mode');
    } else {
      document.documentElement.classList.remove('color-blind-mode');
    }
  };

  const toggleColorBlindMode = async () => {
    const newMode = !isColorBlindMode;
    setIsColorBlindMode(newMode);
    applyColorBlindMode(newMode);

    // Persist to database if user is authenticated
    if (user) {
      try {
        const { error } = await supabase
          .from('users')
          .update({ color_blind_mode: newMode })
          .eq('id', user.id);

        if (error) {
          console.error('Error saving color blind mode preference:', error);
        }
      } catch (error) {
        console.error('Error updating color blind mode:', error);
      }
    } else {
      // Save to localStorage for non-authenticated users
      localStorage.setItem('colorBlindMode', String(newMode));
    }
  };

  return (
    <ColorBlindModeContext.Provider value={{ isColorBlindMode, toggleColorBlindMode, loading }}>
      {children}
    </ColorBlindModeContext.Provider>
  );
};

export const useColorBlindMode = () => {
  const context = useContext(ColorBlindModeContext);
  if (context === undefined) {
    throw new Error('useColorBlindMode must be used within a ColorBlindModeProvider');
  }
  return context;
};
