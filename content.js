/**
 * Extracts article content using multiple strategies
 */
function getMainArticle() {
  // Strategy 1: Look for article tag
  let articleText = extractFromSelector('article');
  if (articleText) return articleText;

  // Strategy 2: Look for common content containers
  const contentSelectors = [
    '.post-content',
    '.entry-content',
    '.article-content',
    '.content-body',
    'main',
    '#content',
    '.content'
  ];

  for (const selector of contentSelectors) {
    articleText = extractFromSelector(selector);
    if (articleText) return articleText;
  }

  // Strategy 3: Fall back to body text, excluding navigation, header, footer
  const body = document.body;
  if (body) {
    const excludeSelectors = 'nav, header, footer, aside, .sidebar, .comments, script, style';
    const clone = body.cloneNode(true);

    // Remove elements that are unlikely to be part of the article
    clone.querySelectorAll(excludeSelectors).forEach(el => el.remove());

    // Extract text from paragraphs
    const paragraphs = clone.querySelectorAll('p');
    if (paragraphs.length > 3) { // Only if we have enough paragraphs
      articleText = Array.from(paragraphs)
        .map(p => p.textContent.trim())
        .filter(text => text.length > 40) // Filter out short paragraphs
        .join('\n\n');

      if (articleText.length > 200) return articleText;
    }
  }

  return "No article content could be extracted from this page.";
}

/**
 * Helper function to extract text from an element matching the selector
 */
function extractFromSelector(selector) {
  const element = document.querySelector(selector);
  if (!element) return null;

  const paragraphs = element.querySelectorAll('p');
  if (paragraphs.length < 3) return null; // Need at least 3 paragraphs

  const text = Array.from(paragraphs)
    .map(p => p.textContent.trim())
    .filter(text => text.length > 0)
    .join('\n\n');

  return text.length > 200 ? text : null; // Need minimum content
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getArticle') {
    const articleText = getMainArticle();
    sendResponse({ articleText });
  }
});

// function getMainArticle() {
//   const article = document.querySelector('article');
//   if (!article) {
//     console.log("No article element found.");
//     return '';
//   }
//
//   const paragraphs = article.querySelectorAll('p');
//   let articleText = '';
//   paragraphs.forEach(p => articleText += p.textContent + '\n');
//
//   return articleText;
// }
//
// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   if (request.action === 'getArticle') {
//     const articleText = getMainArticle();
//     sendResponse({ articleText });
//   }
// });
