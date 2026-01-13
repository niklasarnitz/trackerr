import { useState, useEffect } from "react";

/**
 * Hook for managing navigation menu state
 * Handles mobile menu open/close and hydration
 */
export function useNavigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return {
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    mounted,
  };
}
