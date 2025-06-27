import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import './App.css';

function App() {
  const [inputText, setInputText] = useState('');
  const [conversation, setConversation] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [size, setSize] = useState({ width: 500, height: 600 });
  const [isResizing, setIsResizing] = useState(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const chatRef = useRef(null);
  const [showInfo, setShowInfo] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (customMessage) => {
  const userMessage = customMessage || inputText;
  if (!userMessage.trim()) return;

  setConversation((prev) => [...prev, { sender: 'user', text: userMessage }]);
  setInputText('');
  setIsLoading(true);

  try {
    const response = await axios.post('http://127.0.0.1:8000/predict', {
      message: userMessage,
    });

    const data = response.data;

    if (data.type === 'fallback') {
      setConversation((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: data.message,
          fallbackOptions: data.options,
        }
      ]);
    } else {
      setConversation((prev) => [...prev, { sender: 'bot', text: data.message }]);
    }

  } catch (err) {
    setConversation((prev) => [...prev, { sender: 'bot', text: 'Eroare la server.' }]);
  }
  finally {
    setIsLoading(false);
  }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTo({ 
      top: chatRef.current.scrollHeight, 
      behavior: 'smooth' 
      });
    }
  }, [conversation]);

  useEffect(() => {
  const updateSize = () => {
    if (window.innerWidth < 600) {
      setSize({ width: window.innerWidth * 0.95, height: window.innerHeight * 0.7 });
    } else {
      setSize({ width: 500, height: 600 });
    }
  };

  updateSize();

  window.addEventListener('resize', updateSize);
  return () => window.removeEventListener('resize', updateSize);
}, []);

  const onMouseDown = (e) => {
    e.preventDefault();
    setIsResizing(true);
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const onMouseMove = useCallback((e) => {
    if (!isResizing) return;
    if (window.innerWidth < 600) return;
    const dx = lastMousePos.current.x - e.clientX;
    const dy = lastMousePos.current.y - e.clientY;

    setSize((prev) => ({
      width: Math.min(Math.max(prev.width + dx, 320), window.innerWidth * 0.95),
      height: Math.min(Math.max(prev.height + dy, 400), window.innerHeight * 0.95),
    }));

    lastMousePos.current = { x: e.clientX, y: e.clientY };
  }, [isResizing]);

  const onMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []) 

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  return (
    <>
      {!isOpen && (
        <button className="chat-toggle-button" onClick={() => setIsOpen(true)}>
          <span className="chat-bubble-icon">
            💬
          </span>
        </button>
      )}
      
      <AnimatePresence>
      {isOpen &&(
          <motion.div
            className="chat-window-wrapper"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: 5, y: 50 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{ width: size.width, height: size.height }}
          >
          <div className="resize-handle" onMouseDown={onMouseDown}></div>

          <div className="chat-header">
            <span>MILO Chatbot</span>
            <div className="header-buttons">
              <button className="info-button" onClick={() => setShowInfo((prev) => !prev)}>
                ?
              </button>
            <button className="close-button" onClick={() => setIsOpen(false)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M4 10l8 8 8-8" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            </div>
          </div>

          <AnimatePresence>
          {showInfo && (
            <motion.div
              className="info-box"
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              transition={{ duration: 0.1, ease: 'easeOut' }}
            >
              <p><strong>Salut!</strong> Eu sunt asistentul tău virtual de la <strong>Centrul de Consiliere și Orientare în Carieră (CCOC)</strong> și sunt aici să te îndrum pas cu pas prin toate informațiile utile!</p>

              <p>Te pot ajuta să navighezi printre serviciile pe care CCOC ți le pune la dispoziție:</p>
              <ul>
                <li>Consilierea în carieră</li>
                <li>Consilierea psihologică</li>
                <li>Programul de voluntariat al CCOC</li>
              </ul>

              <p>Scopul meu e să-ți <strong>facilitez accesul</strong> la toate aceste resurse. Nu te sfii să mă întrebi despre programări, cât costă (spoiler: <strong>sunt gratis!</strong>), unde ne găsești, ce beneficii ai, dacă ești eligibil sau orice altceva legat de aceste servicii.</p>

              <p><strong>Important:</strong> Eu răspund la fiecare întrebare individual, așa că nu rețin contextul conversației. Ca să mă folosești la maximum, pune-mi întrebări clare, de genul:</p>
              <ul>
                <li>Ce servicii oferă CCOC?</li>
                <li>Cum mă programez la consiliere psihologică?</li>
                <li>Cât costă consilierea în carieră?</li>
              </ul>

              <p>Sunt aici pentru a-ți oferi <strong>răspunsuri clare, pe înțelesul tău</strong>, și pentru a te ghida astfel încât să beneficiezi din plin de tot suportul oferit de CCOC. <strong>Abia aștept să te ajut!</strong></p>
            </motion.div>
          )}
          </AnimatePresence>
          
          {!showInfo && (
          <div className="chat-window" ref={chatRef}>
            {conversation.length === 0 && (
              <div className="welcome-message">
                Bun venit! Scrie ceva pentru a începe conversația.
              </div>
            )}
            <AnimatePresence initial={false}>
              {conversation.map((msg, idx) => {
                if (msg.sender === 'bot') {
                  return (
                    <motion.div
                      key={idx}
                      className="message-wrapper"
                      initial={{ opacity: 0, scale: 0.9, x: -20 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      layout
                    >
                    <img src="milo-avatar.png" alt="Bot" className="bot-avatar" />
                    <div className="message bot">
                      {msg.text}
                      {msg.fallbackOptions && (
                        <div className="fallback-options">
                          {msg.fallbackOptions.map((opt, i) => (
                            <button key={i} onClick={() => sendMessage(opt.query)}>
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    </motion.div>
                  );
                }

                  return (
                    <motion.div
                      key={idx}
                      className="message user"
                      initial={{ opacity: 0, scale: 0.9, x: 20 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      layout
                    >
                    {msg.text}
                    </motion.div>
                  );
              })}

              {isLoading && (
                <motion.div
                  className="message-wrapper"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  layout
                >
                  <img src="milo-avatar.png" alt="Bot" className="bot-avatar" />
                  <div className="message bot">
                    <div className="typing-indicator">
                      <span>.</span><span>.</span><span>.</span>
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
          )}

          {!showInfo && (
          <div className="input-container">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Scrie un mesaj..."
              rows={1}
            />
            <button onClick={() => sendMessage(inputText)}><span className="arrow-icon">➤</span></button>
          </div>
          )}
        </motion.div>
      )}
      </AnimatePresence>
    </>
  );
}

export default App;