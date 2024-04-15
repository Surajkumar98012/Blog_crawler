import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

function SearchBox({ onSearch }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [recommendedWords, setRecommendedWords] = useState([]);
  const [showRecommendedWords, setShowRecommendedWords] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);

  const handleInputChange = async (value) => {
    setSearchQuery(value);
    setShowRecommendedWords(true); // Always show recommended words when input changes
    try {
      const response = await axios.get(`https://api.datamuse.com/sug?s=${value}`);
      setRecommendedWords(response.data);
    } catch (error) {
      console.error('Error fetching recommended words:', error);
    }
  };

  const handleWordSelect = (word) => {
    setSearchQuery(word);
    setShowRecommendedWords(false);
    onSearch(word);
  };

  const handleKeyDown = async (event) => {
    if (event.key === 'Enter') {
      if (searchQuery) {
        onSearch(searchQuery);
        setLoading(true); // Set loading state
        //setShowRecommendedWords(true);
        //setSearchQuery('');
        return; // Exit early to avoid further API calls
      }
      

    }
  };

  const handleClickOutside = (event) => {
    if (searchRef.current && !searchRef.current.contains(event.target)) {
      setShowRecommendedWords(false);
    }
  };

  const handleFocus = () => {
    if (searchQuery && recommendedWords.length > 0) {
      setShowRecommendedWords(true);
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
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        value={searchQuery}
        className="search-input"
      />
      {showRecommendedWords && searchQuery && !loading && (
        <ul className="recommended-list">
          {recommendedWords.map((wordObj, index) => (
            <li key={index} onClick={() => handleWordSelect(wordObj.word)}>
              {wordObj.word}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SearchBox;
