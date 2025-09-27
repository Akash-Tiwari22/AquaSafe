import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './button';

interface SiriAnimationProps {
  isActive: boolean;
  onComplete: () => void;
  onClose: () => void;
  query?: string;
  response?: string;
}

export function SiriAnimation({ isActive, onComplete, onClose, query, response }: SiriAnimationProps) {
  const [animationPhase, setAnimationPhase] = useState<'listening' | 'processing' | 'responding'>('processing');
  const [displayedResponse, setDisplayedResponse] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!isActive) {
      setAnimationPhase('processing');
      setDisplayedResponse('');
      setIsTyping(false);
      return;
    }

    // Start directly with processing phase
    setAnimationPhase('processing');

    // Move to responding phase after processing
    const timer = setTimeout(() => {
      setAnimationPhase('responding');
      if (response) {
        setIsTyping(true);
        typeResponse(response);
      }
    }, 2000); // Reduced from 3500 to 2000

    return () => {
      clearTimeout(timer);
    };
  }, [isActive, response]);

  const typeResponse = (text: string) => {
    let index = 0;
    const typeInterval = setInterval(() => {
      if (index < text.length) {
        setDisplayedResponse(text.slice(0, index + 1));
        index++;
      } else {
        clearInterval(typeInterval);
        setIsTyping(false);
        setTimeout(() => {
          onComplete();
        }, 2000);
      }
    }, 50);
  };

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="relative bg-gradient-to-br from-blue-900/90 to-purple-900/90 rounded-3xl p-8 max-w-md w-full mx-4 border border-white/20">
        {/* Close Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="absolute top-4 right-4 text-white/70 hover:text-white hover:bg-white/10"
        >
          <X className="w-4 h-4" />
        </Button>

        {/* Animation Container */}
        <div className="flex flex-col items-center space-y-6">
          {/* Siri-like Wave Animation */}
          <div className="relative w-32 h-32 flex items-center justify-center">
            {/* Central Orb */}
            <div className="absolute w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-90 animate-pulse" />
            
            {/* Animated Waves */}
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`absolute rounded-full border-2 border-white/30 ${
                  animationPhase === 'listening' 
                    ? 'animate-ping' 
                    : animationPhase === 'processing'
                    ? 'animate-spin'
                    : 'animate-pulse'
                }`}
                style={{
                  width: `${4 + i * 1.5}rem`,
                  height: `${4 + i * 1.5}rem`,
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: animationPhase === 'processing' ? '2s' : '1.5s'
                }}
              />
            ))}

            {/* Processing Wave Bars (for processing phase) */}
            {animationPhase === 'processing' && (
              <div className="absolute flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white/60 rounded-full animate-pulse"
                    style={{
                      width: '4px',
                      height: `${15 + i * 3}px`,
                      animationDelay: `${i * 0.2}s`,
                      animationDuration: '1.2s'
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Status Text */}
          <div className="text-center space-y-2">
            <h3 className="text-white text-lg font-medium">
              {animationPhase === 'processing' && 'Processing your query...'}
              {animationPhase === 'responding' && 'AquaSafe Assistant'}
            </h3>
            
            {query && (
              <p className="text-blue-200 text-sm italic">"{query}"</p>
            )}
          </div>

          {/* Response Display */}
          {animationPhase === 'responding' && (
            <div className="bg-white/10 rounded-lg p-4 max-w-full">
              <p className="text-white text-sm leading-relaxed">
                {displayedResponse}
                {isTyping && <span className="animate-pulse">|</span>}
              </p>
            </div>
          )}

          {/* Progress Indicator */}
          <div className="w-full bg-white/20 rounded-full h-1">
            <div 
              className="bg-gradient-to-r from-blue-400 to-purple-400 h-1 rounded-full transition-all duration-1000"
              style={{
                width: animationPhase === 'processing' ? '50%' : '100%'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
