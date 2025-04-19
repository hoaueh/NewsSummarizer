chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed and initialized.');
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'summarizeArticle') {
    summarizeArticle(request.articleText).then(summary => {
      sendResponse({ summary });
    }).catch(error => {
      console.error(error);
      sendResponse({ error: error.message });
    });
    return true;  // Will respond asynchronously
  }
});

async function summarizeArticle(articleText) {
  const language = detectLanguage(articleText);
  const response = await fetch('http://localhost:3001/summarize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ articleText, language })
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

function detectLanguage(text) {
  if (text.match(/[ảãạ]/)) { // Example check for Vietnamese characters
    return 'vi';
  }
  return 'en'; // Default to English
}
