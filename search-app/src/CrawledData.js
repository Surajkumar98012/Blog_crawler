import React from "react";

function CrawledData({ crawledData, currentTag }) {
  // Check if crawledData is an array and contains objects
  const isValidData =
    Array.isArray(crawledData) &&
    crawledData.every((item) => typeof item === "object");

  return (
    <div className="crawled-data">
      <h2>Crawled Data for Tag: {currentTag}</h2>
      {isValidData ? (
        <ul>
          {crawledData.map((data, index) => (
            <li key={index}>
              <h3>{data.title}</h3>
              <p>
                <span>Creator:</span> {data.creator}
              </p>
              <p>
                <span>Content:</span> {data.content}
              </p>
              <p>
                <span>Tag:</span> {data.tags}
              </p>
              <p>
                <span>Responses:</span> {data.responses}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No valid crawled data available.</p>
      )}
    </div>
  );
}

export default CrawledData;
