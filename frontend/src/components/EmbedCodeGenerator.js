import React, { useState, useEffect, useRef } from 'react';
import '../styles/EmbedCodeGenerator.css';

const EmbedCodeGenerator = ({ apiKey, token, personality }) => {
  const [copied, setCopied] = useState(false);
  const [embedSize, setEmbedSize] = useState({ width: 800, height: 600 });
  const [customization, setCustomization] = useState({
    theme: 'light',
    position: 'right',
    buttonColor: '#007bff',
    buttonText: 'Chat with AI',
    headerColor: '#ffffff',
    chatBubbleColor: '#f0f0f0',
    fontFamily: 'Inter, system-ui, sans-serif',
    borderRadius: '12px',
    animation: 'slide',
    messageAlignment: 'right',
    showTimestamp: true,
    showAvatar: true,
    enableEmoji: true,
    enableAttachments: true,
    enableVoice: true,
    glassmorphism: false,
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const previewContainerRef = useRef(null);
  const [previewMode, setPreviewMode] = useState('desktop'); // desktop, tablet, mobile

  const chatbotUrl = process.env.REACT_APP_CHATBOT_URL;

  // Safely handle personality parameters
  const name = personality?.name || 'Chatbot';
  const gender = personality?.gender || 'neutral';
  const age = personality?.age || '';
  const behaviorPrompt = personality?.behaviorPrompt || 'Friendly and helpful';

  useEffect(() => {
    // Validate and set default values for advanced settings if they're undefined
    const validateCustomization = () => {
      const defaults = {
        theme: 'light',
        position: 'right',
        buttonColor: '#007bff',
        buttonText: 'Chat with AI',
        headerColor: '#ffffff',
        chatBubbleColor: '#f0f0f0',
        fontFamily: 'Inter, system-ui, sans-serif',
        borderRadius: '12px',
        animation: 'slide',
        messageAlignment: 'right',
        showTimestamp: true,
        showAvatar: true,
        enableEmoji: true,
        enableAttachments: true,
        enableVoice: true,
        glassmorphism: false
      };

      const newCustomization = { ...customization };
      let hasChanges = false;

      Object.entries(defaults).forEach(([key, defaultValue]) => {
        if (customization[key] === undefined) {
          newCustomization[key] = defaultValue;
          hasChanges = true;
        }
      });

      if (hasChanges) {
        setCustomization(newCustomization);
      }
    };

    validateCustomization();
  }, []); // Run once on component mount

   // Enhanced preview container with device frames
  const getPreviewContainerStyle = () => {
    const baseStyle = {
      backgroundColor: customization.theme === 'dark' ? '#1a1a1a' : '#ffffff',
      padding: '20px',
      borderRadius: '16px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      minHeight: '600px',
      position: 'relative',
      transition: 'all 0.3s ease',
    };

    if (customization.glassmorphism) {
      return {
        ...baseStyle,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
      };
    }

    return baseStyle;
  };



  const embedCode = `<iframe
  src="${chatbotUrl}/chatbot?apiKey=${encodeURIComponent(apiKey)}&token=${encodeURIComponent(token)}
    &name=${encodeURIComponent(name)}
    &gender=${encodeURIComponent(gender)}
    &age=${encodeURIComponent(age)}
    &behaviorPrompt=${encodeURIComponent(behaviorPrompt)}
    &theme=${customization.theme}
    &position=${customization.position}
    &buttonColor=${encodeURIComponent(customization.buttonColor)}
    &buttonText=${encodeURIComponent(customization.buttonText)}
    &headerColor=${encodeURIComponent(customization.headerColor)}
    &chatBubbleColor=${encodeURIComponent(customization.chatBubbleColor)}
    &fontFamily=${encodeURIComponent(customization.fontFamily)}
    &borderRadius=${encodeURIComponent(customization.borderRadius)}
    &animation=${encodeURIComponent(customization.animation)}
    &messageAlignment=${encodeURIComponent(customization.messageAlignment)}
    &showTimestamp=${customization.showTimestamp}
    &showAvatar=${customization.showAvatar}
    &enableEmoji=${customization.enableEmoji}
    &enableAttachments=${customization.enableAttachments}
    &enableVoice=${customization.enableVoice}
    &glassmorphism=${customization.glassmorphism}"
  width="${embedSize.width}"
  height="${embedSize.height}"
  style="border: none; border-radius: ${customization.borderRadius}; box-shadow: ${
    customization.glassmorphism 
      ? '0 8px 32px rgba(31, 38, 135, 0.15)' 
      : '0 4px 12px rgba(0, 0, 0, 0.15)'
  }; transition: all 0.3s ease;"
  allow="microphone; camera"
></iframe>`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  useEffect(() => {
    const initializePreview = () => {
      // Remove any existing previews
      const existingPreviews = previewContainerRef.current?.querySelector('iframe');
      if (existingPreviews) {
        existingPreviews.remove();
      }

      // Create new iframe for preview
      const iframe = document.createElement('iframe');
      const previewUrl = new URL(`${chatbotUrl}/chatbot`);
      
      // Add all parameters to the URL
      const params = {
        apiKey,
        token,
        name,
        gender,
        age,
        behaviorPrompt,
        theme: customization.theme,
        position: customization.position,
        buttonColor: customization.buttonColor,
        buttonText: customization.buttonText,
        headerColor: customization.headerColor,
        chatBubbleColor: customization.chatBubbleColor,
        fontFamily: customization.fontFamily,
        borderRadius: customization.borderRadius,
        animation: customization.animation,
        messageAlignment: customization.messageAlignment,
        showTimestamp: customization.showTimestamp,
        showAvatar: customization.showAvatar,
        enableEmoji: customization.enableEmoji,
        enableAttachments: customization.enableAttachments,
        enableVoice: customization.enableVoice,
        glassmorphism: customization.glassmorphism
      };

      Object.entries(params).forEach(([key, value]) => {
        previewUrl.searchParams.append(key, value);
      });

      iframe.src = previewUrl.toString();
      iframe.style.cssText = `
        width: ${embedSize.width}px;
        height: ${embedSize.height}px;
        border: none;
        border-radius: ${customization.borderRadius};
        box-shadow: ${customization.glassmorphism 
          ? '0 8px 32px rgba(31, 38, 135, 0.15)' 
          : '0 4px 12px rgba(0, 0, 0, 0.15)'};
        transition: all 0.3s ease;
      `;
      iframe.allow = "microphone; camera";

      if (previewContainerRef.current) {
        previewContainerRef.current.appendChild(iframe);
      }
    };

    initializePreview();

    return () => {
      const existingPreviews = previewContainerRef.current?.querySelector('iframe');
      if (existingPreviews) {
        existingPreviews.remove();
      }
    };
  }, [customization, embedSize, apiKey, token, name, gender, age, behaviorPrompt, chatbotUrl]);

  // Device preview toolbar
  const DevicePreviewToolbar = () => (
    <div className="device-preview-toolbar">
      <button 
        className={`device-button ${previewMode === 'desktop' ? 'active' : ''}`}
        onClick={() => setPreviewMode('desktop')}
      >
        <i className="fas fa-desktop"></i>
      </button>
      <button 
        className={`device-button ${previewMode === 'tablet' ? 'active' : ''}`}
        onClick={() => setPreviewMode('tablet')}
      >
        <i className="fas fa-tablet-alt"></i>
      </button>
      <button 
        className={`device-button ${previewMode === 'mobile' ? 'active' : ''}`}
        onClick={() => setPreviewMode('mobile')}
      >
        <i className="fas fa-mobile-alt"></i>
      </button>
    </div>
  );

  // Enhanced customization panel with new options
  const AdvancedCustomizationPanel = () => (
    <div className="advanced-settings-panel">
      <h4>Visual Effects</h4>
      <label className="switch-label">
        <span>Glassmorphism Effect</span>
        <input
          type="checkbox"
          checked={customization.glassmorphism}
          onChange={(e) => setCustomization({ 
            ...customization, 
            glassmorphism: e.target.checked 
          })}
        />
      </label>

      <h4>Animation</h4>
      <select
        value={customization.animation}
        onChange={(e) => setCustomization({ 
          ...customization, 
          animation: e.target.value 
        })}
      >
        <option value="slide">Slide</option>
        <option value="fade">Fade</option>
        <option value="bounce">Bounce</option>
      </select>

      <h4>Features</h4>
      <label className="switch-label">
        <span>Show Timestamps</span>
        <input
          type="checkbox"
          checked={customization.showTimestamp}
          onChange={(e) => setCustomization({ 
            ...customization, 
            showTimestamp: e.target.checked 
          })}
        />
      </label>
      <label className="switch-label">
        <span>Show Avatars</span>
        <input
          type="checkbox"
          checked={customization.showAvatar}
          onChange={(e) => setCustomization({ 
            ...customization, 
            showAvatar: e.target.checked 
          })}
        />
      </label>
      <label className="switch-label">
        <span>Enable Emoji Picker</span>
        <input
          type="checkbox"
          checked={customization.enableEmoji}
          onChange={(e) => setCustomization({ 
            ...customization, 
            enableEmoji: e.target.checked 
          })}
        />
      </label>
      <label className="switch-label">
        <span>Enable Attachments</span>
        <input
          type="checkbox"
          checked={customization.enableAttachments}
          onChange={(e) => setCustomization({ 
            ...customization, 
            enableAttachments: e.target.checked 
          })}
        />
      </label>
      <label className="switch-label">
        <span>Enable Voice Input</span>
        <input
          type="checkbox"
          checked={customization.enableVoice}
          onChange={(e) => setCustomization({ 
            ...customization, 
            enableVoice: e.target.checked 
          })}
        />
      </label>
    </div>
  );

  return (
    <div className="embed-code-generator">
      <h2>Embed Code Generator</h2>
      
      <div className="generator-container">
        <div className="customization-panel">
          <div className="basic-settings">
            <h3>Basic Settings</h3>
            <div className="size-controls">
              <label>
                Width:
                <input
                  type="number"
                  value={embedSize.width}
                  onChange={(e) => setEmbedSize({ ...embedSize, width: e.target.value })}
                  min="300"
                  max="2000"
                />
              </label>
              <label>
                Height:
                <input
                  type="number"
                  value={embedSize.height}
                  onChange={(e) => setEmbedSize({ ...embedSize, height: e.target.value })}
                  min="400"
                  max="1000"
                />
              </label>
            </div>

            <div className="theme-controls">
              <label>
                Theme:
                <select
                  value={customization.theme}
                  onChange={(e) => setCustomization({ ...customization, theme: e.target.value })}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto (System)</option>
                </select>
              </label>

              <label>
                Position:
                <select
                  value={customization.position}
                  onChange={(e) => setCustomization({ ...customization, position: e.target.value })}
                >
                  <option value="right">Bottom Right</option>
                  <option value="left">Bottom Left</option>
                  <option value="center">Center</option>
                </select>
              </label>
            </div>
          </div>

          <div className="advanced-settings">
            <button 
              className="toggle-advanced"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? 'Hide Advanced Settings' : 'Show Advanced Settings'}
            </button>

            {showAdvanced && <AdvancedCustomizationPanel />}
          </div>
        </div>

        <div className="code-preview">
          <h3>Embed Code</h3>
          <pre className="code-block">
            <code>{embedCode}</code>
          </pre>
          <button 
            className={`copy-button ${copied ? 'copied' : ''}`}
            onClick={handleCopy}
          >
            <i className={`fas ${copied ? 'fa-check' : 'fa-copy'}`}></i>
            {copied ? 'Copied!' : 'Copy Code'}
          </button>
        </div>

        <div className="preview-section">
          <h3>Enhanced Live Preview</h3>
          <DevicePreviewToolbar />
          <div 
            className={`preview-container ${previewMode}`}
            style={getPreviewContainerStyle()}
          >
            <div ref={previewContainerRef} className="preview-frame" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmbedCodeGenerator;
