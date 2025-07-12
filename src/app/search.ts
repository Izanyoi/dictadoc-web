import { useState, useRef, useCallback } from 'react';

export function useListSearch<T>(
    items: T[],
    matcher: (item: T, query: string) => boolean
) {
    const [searchState, setSearchState] = useState({
        results: [] as number[],
        currentIndex: -1
    });

    const searchQuery = useRef("");

    const handleSearch = useCallback((query: string) => {
        searchQuery.current = query;

        if (!query.trim()) {
            setSearchState({ results: [], currentIndex: -1 });
            return -1;
        }

        const results = items
            .map((item, index) => matcher(item, query) ? index : -1)
            .filter(index => index !== -1);

        setSearchState({
            results,
            currentIndex: results.length > 0 ? 0 : -1
        });

        return results.length > 0 ? results[0] : -1; // Return first result index
    }, [items, matcher]);

    const handleNext = useCallback(() => {
        if (searchState.results.length === 0) return -1;
    
        const nextIndex = (searchState.currentIndex + 1) % searchState.results.length;
        const nextResultIndex = searchState.results[nextIndex];
    
        setSearchState(prev => ({ ...prev, currentIndex: nextIndex }));
        return nextResultIndex;
    }, [searchState]);

    const handlePrev = useCallback(() => {
        if (searchState.results.length === 0) return -1;
    
        const prevIndex = searchState.currentIndex === 0 
            ? searchState.results.length - 1 
            : searchState.currentIndex - 1;

        const prevResultIndex = searchState.results[prevIndex];
    
        setSearchState(prev => ({ ...prev, currentIndex: prevIndex }));
        return prevResultIndex;
    }, [searchState]);

    const reset = useCallback(() => {
        searchQuery.current = "";
        setSearchState({ results: [], currentIndex: -1 });
    }, []);

    return {
        searchState,
        searchQuery: searchQuery.current,
        handleSearch,
        handleNext,
        handlePrev,
        reset
    };
}