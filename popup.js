document.getElementById('summarize-btn').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'getArticle' }, response => {
      if (response && response.articleText) {
        chrome.runtime.sendMessage({
          action: 'summarizeArticle',
          articleText: response.articleText
        }, response => {
          if (response.error) {
            alert(`Error: ${response.error}`);
          } else {
            document.getElementById('summary').textContent = response.summary;
          }
        });
      } else {
        alert('No article text found on this page.');
      }
    });
  });
});
