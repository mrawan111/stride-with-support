import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

export type ColorBlindType = 'protanopia' | 'deuteranopia' | 'tritanopia';
export type FontSize = 'small' | 'medium' | 'large' | 'extra-large';

interface ColorBlindModeContextType {
  isColorBlindMode: boolean;
  colorBlindType: ColorBlindType;
  fontSize: FontSize;
  reduceMotion: boolean;
  toggleColorBlindMode: () => Promise<void>;
  setColorBlindType: (type: ColorBlindType) => Promise<void>;
  setFontSize: (size: FontSize) => Promise<void>;
  setReduceMotion: (reduce: boolean) => Promise<void>;
  loading: boolean;
}

const ColorBlindModeContext = createContext<ColorBlindModeContextType | undefined>(undefined);

export const ColorBlindModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isColorBlindMode, setIsColorBlindMode] = useState(false);
  const [colorBlindType, setColorBlindTypeState] = useState<ColorBlindType>('deuteranopia');
  const [fontSize, setFontSizeState] = useState<FontSize>('medium');
  const [reduceMotion, setReduceMotionState] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Load accessibility preferences from database
  useEffect(() => {
    const loadPreferences = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('users')
            .select('color_blind_mode, color_blind_mode_type, font_size, reduce_motion')
            .eq('id', user.id)
            .single();

          if (!error && data) {
            const mode = data.color_blind_mode || false;
            const type = (data.color_blind_mode_type || 'deuteranopia') as ColorBlindType;
            const size = (data.font_size || 'medium') as FontSize;
            const motion = data.reduce_motion || false;
            
            setIsColorBlindMode(mode);
            setColorBlindTypeState(type);
            setFontSizeState(size);
            setReduceMotionState(motion);
            
            applyAccessibilitySettings(mode, type, size, motion);
          }
        } catch (error) {
          console.error('Error loading accessibility preferences:', error);
        }
      } else {
        // Load from localStorage for non-authenticated users
        const savedMode = localStorage.getItem('colorBlindMode') === 'true';
        const savedType = (localStorage.getItem('colorBlindType') || 'deuteranopia') as ColorBlindType;
        const savedSize = (localStorage.getItem('fontSize') || 'medium') as FontSize;
        const savedMotion = localStorage.getItem('reduceMotion') === 'true';
        
        setIsColorBlindMode(savedMode);
        setColorBlindTypeState(savedType);
        setFontSizeState(savedSize);
        setReduceMotionState(savedMotion);
        
        applyAccessibilitySettings(savedMode, savedType, savedSize, savedMotion);
      }
      setLoading(false);
    };

    loadPreferences();
  }, [user]);

  const applyAccessibilitySettings = (
    mode: boolean,
    type: ColorBlindType,
    size: FontSize,
    motion: boolean
  ) => {
    // Apply color blind mode
    if (mode) {
      document.documentElement.classList.add('color-blind-mode');
      document.documentElement.setAttribute('data-color-blind-type', type);
    } else {
      document.documentElement.classList.remove('color-blind-mode');
      document.documentElement.removeAttribute('data-color-blind-type');
    }
    
    // Apply font size
    document.documentElement.setAttribute('data-font-size', size);
    
    // Apply motion preference
    if (motion) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
  };

  const toggleColorBlindMode = async () => {
    const newMode = !isColorBlindMode;
    setIsColorBlindMode(newMode);
    applyAccessibilitySettings(newMode, colorBlindType, fontSize, reduceMotion);

    if (user) {
      try {
        await supabase
          .from('users')
          .update({ color_blind_mode: newMode })
          .eq('id', user.id);
      } catch (error) {
        console.error('Error updating color blind mode:', error);
      }
    } else {
      localStorage.setItem('colorBlindMode', String(newMode));
    }
  };

  const setColorBlindType = async (type: ColorBlindType) => {
    setColorBlindTypeState(type);
    applyAccessibilitySettings(isColorBlindMode, type, fontSize, reduceMotion);

    if (user) {
      try {
        await supabase
          .from('users')
          .update({ color_blind_mode_type: type })
          .eq('id', user.id);
      } catch (error) {
        console.error('Error updating color blind type:', error);
      }
    } else {
      localStorage.setItem('colorBlindType', type);
    }
  };

  const setFontSize = async (size: FontSize) => {
    setFontSizeState(size);
    applyAccessibilitySettings(isColorBlindMode, colorBlindType, size, reduceMotion);

    if (user) {
      try {
        await supabase
          .from('users')
          .update({ font_size: size })
          .eq('id', user.id);
      } catch (error) {
        console.error('Error updating font size:', error);
      }
    } else {
      localStorage.setItem('fontSize', size);
    }
  };

  const setReduceMotion = async (reduce: boolean) => {
    setReduceMotionState(reduce);
    applyAccessibilitySettings(isColorBlindMode, colorBlindType, fontSize, reduce);

    if (user) {
      try {
        await supabase
          .from('users')
          .update({ reduce_motion: reduce })
          .eq('id', user.id);
      } catch (error) {
        console.error('Error updating motion preference:', error);
      }
    } else {
      localStorage.setItem('reduceMotion', String(reduce));
    }
  };

  return (
    <ColorBlindModeContext.Provider
      value={{
        isColorBlindMode,
        colorBlindType,
        fontSize,
        reduceMotion,
        toggleColorBlindMode,
        setColorBlindType,
        setFontSize,
        setReduceMotion,
        loading,
      }}
    >
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
