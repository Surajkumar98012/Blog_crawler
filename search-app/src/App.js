// App.js
import React, { useState, useEffect } from 'react';
import SearchBox from './SearchBox';
import CrawledData from './CrawledData';
import axios from 'axios';
import './App.css';

function App() {
  //const [recommendedWords, setRecommendedWords] = useState([]);
  const [crawledData, setCrawledData] = useState([]);
  const [currentTag, setCurrentTag] = useState('');
  const [loading, setLoading] = useState(true); // Add loading state

  const fetchCrawledData = async (tag) => {
    try {
      if (tag !== '') { // Only make the request if tag is not empty
        const response = await axios.get(`http://localhost:8000/crawl/${tag}/`);
        if (Array.isArray(response.data)) {
          setCrawledData(response.data);
        } else {
          // Handle the case where the response data is not an array
          console.error('Crawled data is not an array:', response.data);
          setCrawledData([]);
        }
        setLoading(false); // Set loading to false after data is fetched
      } else {
        // If tag is empty, set crawledData to an empty array and setLoading to false
        setCrawledData([]);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false); // Set loading to false if there's an error
      console.error('Error fetching crawled data:', error);
      alert('Please enter a valid tag.');
    }
  };
  

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // Set loading to true before fetching data
      await fetchCrawledData(currentTag); // Fetch data for the current tag
    };
    fetchData();
  }, [currentTag]); // Trigger useEffect whenever currentTag changes

  const handleSearch = (tag) => {
    const newTag = tag.trim();
    if (newTag) {
      setCurrentTag(newTag);
    } else {
      console.error('Invalid tag:', newTag);
    }
  };

  return (
<div className="container">
  <h1 className="title">Web Crawler</h1>
  <SearchBox
    onSearch={handleSearch}
  />
  {loading ? (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p className="loading-text">Crawling data . . . ..</p>
    </div>
  ) : (
    <CrawledData crawledData={crawledData} currentTag={currentTag} />
  )}
</div>


  );
}

export default App;
