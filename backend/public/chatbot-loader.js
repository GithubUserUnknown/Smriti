(function() {
  const config = window.chatbotConfig || {};
  
  // Create chatbot container
  const createChatbotUI = () => {
    const container = document.createElement('div');
    container.className = 'ai-chatbot-widget';
    container.style.cssText = `
      position: fixed;
      ${config.position === 'left' ? 'left: 20px;' : 'right: 20px;'}
      bottom: 20px;
      z-index: 9999;
      transition: all 0.3s ease;
    `;

    // Create toggle button
    const toggleButton = document.createElement('button');
    toggleButton.className = 'ai-chatbot-toggle';
    toggleButton.innerHTML = config.buttonText || 'Chat with AI';
    toggleButton.style.cssText = `
      background-color: ${config.buttonColor || '#007bff'};
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 24px;
      cursor: pointer;
      font-size: 16px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
    `;

    // Create chat window
    const chatWindow = document.createElement('div');
    chatWindow.className = 'ai-chatbot-window';
    chatWindow.style.cssText = `
      display: none;
      width: 380px;
      height: 600px;
      background: ${config.theme === 'dark' ? '#1a1a1a' : '#ffffff'};
      border-radius: 12px;
      box-shadow: 0 8px 16px rgba(0,0,0,0.1);
      overflow: hidden;
      transition: all 0.3s ease;
    `;

    // Create chat header
    const header = document.createElement('div');
    header.style.cssText = `
      background-color: ${config.headerColor || '#007bff'};
      color: white;
      padding: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;
    header.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <img src="${config.avatarUrl || 'default-avatar.png'}" style="width: 32px; height: 32px; border-radius: 50%;" />
        <span>${config.name}</span>
      </div>
      <button class="ai-chatbot-close" style="background: none; border: none; color: white; cursor: pointer;">×</button>
    `;

    // Add components to DOM
    chatWindow.appendChild(header);
    container.appendChild(toggleButton);
    container.appendChild(chatWindow);
    document.body.appendChild(container);

    // Add event listeners
    toggleButton.addEventListener('click', () => {
      chatWindow.style.display = chatWindow.style.display === 'none' ? 'block' : 'none';
      toggleButton.style.display = chatWindow.style.display === 'block' ? 'none' : 'block';
    });

    const closeButton = header.querySelector('.ai-chatbot-close');
    closeButton.addEventListener('click', () => {
      chatWindow.style.display = 'none';
      toggleButton.style.display = 'block';
    });
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createChatbotUI);
  } else {
    createChatbotUI();
  }
})();