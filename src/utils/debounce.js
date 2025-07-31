/**
 * Debounce utility function
 * Delays execution of a function until after a specified delay has elapsed
 * since the last time it was invoked
 */

/**
 * Creates a debounced version of the provided function
 * @param {Function} func - The function to debounce
 * @param {number} delay - The delay in milliseconds (default: 100ms as per SDD)
 * @returns {Function} The debounced function
 */
export function debounce(func, delay = 100) {
  let timeoutId;
  
  return function debounced(...args) {
    const context = this;
    
    // Clear the previous timeout
    clearTimeout(timeoutId);
    
    // Set a new timeout
    timeoutId = setTimeout(() => {
      func.apply(context, args);
    }, delay);
  };
}

/**
 * Creates a debounced function that also stores the timeout ID for manual clearing
 * Useful for cleanup in components
 * @param {Function} func - The function to debounce
 * @param {number} delay - The delay in milliseconds
 * @returns {Object} Object with debounced function and clear method
 */
export function createDebouncedFunction(func, delay = 100) {
  let timeoutId;
  
  const debouncedFunc = function(...args) {
    const context = this;
    
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(context, args);
    }, delay);
  };
  
  const clear = () => {
    clearTimeout(timeoutId);
  };
  
  return {
    func: debouncedFunc,
    clear
  };
}