import { useState, useEffect } from 'react';
/**
 * Custom React hook that debounces a value by a specified delay.
 *
 * @param value - The value to debounce. Defaults to an empty string.
 * @param delay - The debounce delay in milliseconds. Defaults to 300ms.
 * @returns The debounced value.
 *
 * @example
 * const debouncedSearchTerm = useDebounce(searchTerm, 500);
 */
export default function useDebounce(value: string = '', delay: number = 300) {
	const [debouncedValue, setDebouncedValue] = useState(value);
	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);
		return () => clearTimeout(handler);
	}, [value, delay]);
	return debouncedValue;
}
