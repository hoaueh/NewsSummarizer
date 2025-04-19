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

// Modified summarizeArticle function with improved error handling and caching
async function summarizeArticle(articleText) {
  // Check cache first
  const cacheKey = `summary_${hashString(articleText.substring(0, 100))}`;
  const cachedResult = await chrome.storage.local.get(cacheKey);

  if (cachedResult[cacheKey]) {
    console.log('Using cached summary');
    return cachedResult[cacheKey];
  }

  const language = detectLanguage(articleText);

  try {
    const response = await fetch('https://your-production-api.com/summarize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_API_KEY' // Consider using environment variables
      },
      body: JSON.stringify({ articleText, language })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API error (${response.status}): ${errorData.message || response.statusText}`);
    }

    const data = await response.json();

    // Cache the result
    await chrome.storage.local.set({ [cacheKey]: data });

    return data;
  } catch (error) {
    console.error('Summarization failed:', error);
    throw new Error(`Failed to summarize: ${error.message}`);
  }
}

// Helper function to create a simple hash for caching
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString(36);
}

function detectLanguage(text) {
  if (text.match(/[ảãạ]/)) { // Example check for Vietnamese characters
    return 'vi';
  }
  return 'en'; // Default to English
}
