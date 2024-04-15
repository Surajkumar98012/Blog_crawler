// App.js
import React, { useState, useEffect } from 'react';
import SearchBox from './SearchBox';
import CrawledData from './CrawledData';
import axios from 'axios';
import './App.css';

function App() {
  const [recommendedWords, setRecommendedWords] = useState([]);
  const [crawledData, setCrawledData] = useState([]);
  const [currentTag, setCurrentTag] = useState('');
  const [loading, setLoading] = useState(true); // Add loading state

  const fetchRecommendedWords = async (query) => {
    try {
      const response = await axios.get(`https://api.datamuse.com/sug?s=${query}`);
      const words = response.data.map((item) => item.word);
      setRecommendedWords(words);
    } catch (error) {
      console.error('Error fetching recommended words:', error);
    }
  };

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
        setCurrentTag(tag);
        setLoading(false); // Set loading to false after data is fetched
      } else {
        // If tag is empty, set crawledData to an empty array and setLoading to false
        setCrawledData([]);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching crawled data:', error);
      setLoading(false); // Set loading to false if there's an error
    }
  };
  

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // Set loading to true before fetching data
      await fetchCrawledData('');
    };
    fetchData();
  }, []);

  const handleSearch = (tag) => {
    const newTag = tag.trim();
    if (newTag) {
      setCurrentTag(newTag);
      fetchCrawledData(newTag);
    } else {
      console.error('Invalid tag:', newTag);
    }
  };

  return (
    <div className="container">
      <h1 className="title">Web Crawler</h1>
      <SearchBox
        fetchRecommendedWords={fetchRecommendedWords}
        recommendedWords={recommendedWords}
        onSearch={handleSearch}
      />
      {loading ? (
        <p>Loading...</p> // Display loading message while fetching data
      ) : (
        <CrawledData crawledData={crawledData} currentTag={currentTag} />
      )}
    </div>
  );
}

export default App;
