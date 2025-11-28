import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useColorBlindMode } from '@/contexts/ColorBlindModeContext';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export const ColorBlindModeToggle = () => {
  const { isColorBlindMode, toggleColorBlindMode, loading } = useColorBlindMode();

  if (loading) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleColorBlindMode}
            aria-label={isColorBlindMode ? 'Disable Color Blind Mode' : 'Enable Color Blind Mode'}
            className="relative"
          >
            {isColorBlindMode ? (
              <Eye className="h-5 w-5" />
            ) : (
              <EyeOff className="h-5 w-5" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isColorBlindMode ? 'Disable' : 'Enable'} Color Blind Friendly Mode</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
