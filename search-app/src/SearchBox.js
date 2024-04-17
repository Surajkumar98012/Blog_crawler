import React, { useState, useRef, useEffect,useCallback } from 'react';

function SearchBox({ onSearch }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [recommendedWords, setRecommendedWords] = useState([]);
  const [showRecommendedWords, setShowRecommendedWords] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);

  const handleInputChange = useCallback(async (value) => {
    setSearchQuery(value);
    setShowRecommendedWords(true); // Always show recommended words when input changes
    const newTag = value.trim();
    const isValidTag = /^[a-zA-Z]+$/.test(newTag); // Regex to match letters
    if (newTag && isValidTag) {
      try {
        const response = await fetch(`https://api.datamuse.com/sug?s=${newTag}`);
        if (response.ok) {
          const data = await response.json();
          if (data.length > 0) {
            setSearchQuery(newTag);
            setRecommendedWords(data)
          } else {
            console.error('Invalid tag:', newTag);
            //alert('Please enter a valid tag.');
          }
        } 
      } catch (error) {
        console.error('Error validating tag:', error);
        alert('Error validating tag. Please try again.');
      }
    } else {
      console.error('Invalid tag:', newTag);
      //alert('Please enter a valid tag.');
    }
  },[]);

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
