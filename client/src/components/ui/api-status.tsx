import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";

interface APIStatusProps {
  className?: string;
}

export default function APIStatus({ className = "" }: APIStatusProps) {
  const [useRealAPI, setUseRealAPI] = useState(true);

  useEffect(() => {
    const checkAPIStatus = () => {
      try {
        const saved = localStorage.getItem('vicsurf-use-real-api');
        setUseRealAPI(saved ? JSON.parse(saved) : true);
      } catch {
        setUseRealAPI(true);
      }
    };

    checkAPIStatus();
    
    // Update when localStorage changes
    const interval = setInterval(checkAPIStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!useRealAPI) return null;

  return (
    <Badge 
      variant="outline" 
      className={`text-xs bg-green-50 border-green-200 text-green-700 ${className}`}
    >
      <i className="fas fa-satellite-dish mr-1 text-xs"></i>
      Live Data
    </Badge>
  );
}