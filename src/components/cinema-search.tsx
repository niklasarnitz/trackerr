"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "~/lib/utils";
import { Input } from "~/components/ui/input";
import { api } from "~/trpc/react";

interface CinemaSearchProps {
  readonly value?: string;
  readonly onValueChange: (value: string) => void;
  readonly placeholder?: string;
}

export function CinemaSearch({
  value,
  onValueChange,
  placeholder = "Search cinema...",
}: CinemaSearchProps) {
  const [inputValue, setInputValue] = useState(value ?? "");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Get top cinemas for user (shown when no search)
  const { data: topCinemas = [] } = api.movieWatch.getTopCinemas.useQuery();

  // Search cinemas based on input
  const { data: searchResults = [] } = api.movieWatch.searchCinemas.useQuery(
    { search: inputValue },
    {
      enabled: inputValue.length > 0,
    },
  );

  // Use top cinemas when no search, search results when searching
  const suggestions =
    inputValue.length > 0 ? searchResults : topCinemas.map((c) => c.name);

  // Update input when value changes externally
  useEffect(() => {
    setInputValue(value ?? "");
  }, [value]);

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
    onValueChange(newValue);
    setShowSuggestions(true);
    setFocusedIndex(-1);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    onValueChange(suggestion);
    setShowSuggestions(false);
    setFocusedIndex(-1);
  };

  const handleInputFocus = () => {
    setShowSuggestions(true);
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow for click events
    setTimeout(() => {
      setShowSuggestions(false);
      setFocusedIndex(-1);
    }, 150);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1,
        );
        break;
      case "Enter":
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < suggestions.length) {
          const selectedSuggestion = suggestions[focusedIndex];
          if (selectedSuggestion) {
            handleSuggestionClick(selectedSuggestion);
          }
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setFocusedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        value={inputValue}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full"
      />

      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="bg-popover border-border absolute top-full right-0 left-0 z-50 mt-1 max-h-60 overflow-y-auto rounded-md border shadow-md"
        >
          {inputValue.length === 0 && (
            <div className="text-muted-foreground border-b px-3 py-2 text-xs">
              Most frequently used:
            </div>
          )}
          {suggestions.map((cinema, index) => (
            <button
              key={cinema}
              type="button"
              className={cn(
                "hover:bg-accent hover:text-accent-foreground flex w-full cursor-pointer items-center justify-between px-3 py-2 text-left text-sm",
                index === focusedIndex && "bg-accent text-accent-foreground",
              )}
              onClick={() => handleSuggestionClick(cinema)}
            >
              <span>{cinema}</span>
              {inputValue.length === 0 && (
                <span className="text-muted-foreground text-xs">
                  {topCinemas.find((c) => c.name === cinema)?.count} times
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
