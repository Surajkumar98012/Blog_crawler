import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

function SearchBox({ onSearch }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [recommendedWords, setRecommendedWords] = useState([]);
  const [showRecommendedWords, setShowRecommendedWords] = useState(false);
  const searchRef = useRef(null);

  const handleInputChange = async (value) => {
    setSearchQuery(value);
    try {
      const response = await axios.get(`http://localhost:8000/api/recommended-words/?query=${value}`);
      setRecommendedWords(response.data);
      setShowRecommendedWords(true);
    } catch (error) {
      console.error('Error fetching recommended words:', error);
    }
  };

  const handleWordSelect = (word) => {
    setSearchQuery(word);
    setShowRecommendedWords(false);
    onSearch(word);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      if (recommendedWords.length > 0) {
        handleWordSelect(recommendedWords[0]);
      }
    }
  };

  const handleClickOutside = (event) => {
    if (searchRef.current && !searchRef.current.contains(event.target)) {
      setShowRecommendedWords(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="search-container" ref={searchRef}>
      <input
        type="text"
        placeholder="Enter blog tags..."
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => setShowRecommendedWords(true)}
        onKeyDown={handleKeyDown}
        value={searchQuery}
        className="search-input"
      />
      {showRecommendedWords && searchQuery && (
        <ul className="recommended-list">
          {recommendedWords.map((word, index) => (
            <li key={index} onClick={() => handleWordSelect(word)}>
              {word}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SearchBox;