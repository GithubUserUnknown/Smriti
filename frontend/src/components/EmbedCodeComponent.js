import React from 'react';

const EmbedCodeComponent = ({ apiKey, token }) => {
  const chatbotUrl = process.env.REACT_APP_CHATBOT_URL || 'http://localhost:5000';

  const embedCode = `<iframe
  src="${chatbotUrl}/chatbot?apiKey=${encodeURIComponent(apiKey)}&token=${encodeURIComponent(token)}"
  width="800"
  height="600"
  style="border: none; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);"
  allow="microphone; camera"
></iframe>

<script>
  // Handle token refresh
  window.addEventListener('message', function(event) {
    if (event.data.type === 'TOKEN_EXPIRED') {
      // Refresh the iframe with a new token
      const iframe = document.querySelector('iframe[src*="${chatbotUrl}"]');
      if (iframe) {
        const currentSrc = new URL(iframe.src);
        currentSrc.searchParams.set('token', '${encodeURIComponent(token)}');
        iframe.src = currentSrc.toString();
      }
    }
  });
</script>`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      alert('Embed code copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Failed to copy embed code. Please try again.');
    }
  };

  return (
    <div className="embed-code-container">
      <h3>Export Chatbot</h3>
      <div className="code-preview">
        <pre className="code-block">
          <code>{embedCode}</code>
        </pre>
        <button onClick={handleCopy} className="copy-button">
          Copy Embed Code
        </button>
      </div>
      <div className="instructions">
        <p>To embed the chatbot on your website:</p>
        <ol>
          <li>Copy the code above</li>
          <li>Paste it into your website's HTML where you want the chatbot to appear</li>
          <li>The chatbot will automatically handle authentication and token refresh</li>
        </ol>
      </div>
    </div>
  );
};

export default EmbedCodeComponent;
