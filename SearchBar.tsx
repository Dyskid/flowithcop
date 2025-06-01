// --- START components/SearchBar.tsx ---
import React from 'react';

interface SearchBarProps {
  /**
   * Callback function triggered when the search input value changes.
   * @param query - The current value of the search input.
   */
  onSearchChange: (query: string) => void;
  /**
   * Optional placeholder text for the search input.
   */
  placeholder?: string;
  /**
   * Optional current value for the search input (for controlled component).
   */
  value?: string;
  /**
   * Optional class name for the container div.
   */
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearchChange,
  placeholder = "지역 또는 마켓 이름을 검색하세요...",
  value = '',
  className,
}) => {
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(event.target.value);
  };

  return (
    <div className={`mb-6 w-full ${className}`}> {/* Added w-full and className prop */}
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={handleInputChange}
        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 placeholder-gray-400 transition duration-150 ease-in-out" // Enhanced styling and focus
        aria-label="지역 또는 마켓 이름 검색" // More specific accessibility label
      />
    </div>
  );
};

export default SearchBar;
// --- END components/SearchBar.tsx ---
