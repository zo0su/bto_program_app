import React, { useEffect, useRef, useState, useCallback } from 'react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism-dark.css';
import './CodeEditor.css';

/**
 * 코드 에디터 컴포넌트
 * - 붙여넣기 기능 완전 차단
 * - 타이핑 이벤트 추적
 */
const CodeEditor = ({ 
  value = '', 
  onChange, 
  onTypingEvent,
  language = 'python',
  disabled = false,
  placeholder = '코드를 입력하세요...'
}) => {
  const editorRef = useRef(null);
  const [code, setCode] = useState(value);
  const lastKeyTimeRef = useRef(Date.now());
  const keystrokeCountRef = useRef(0);

  // 붙여넣기 완전 차단
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const preventPaste = (e) => {
      e.preventDefault();
      e.stopPropagation();
      alert('⚠️ 치팅 방지: 붙여넣기가 금지되어 있습니다. 코드를 직접 입력해주세요.');
      return false;
    };

    // 여러 이벤트 리스너로 붙여넣기 차단
    editor.addEventListener('paste', preventPaste, true);
    editor.addEventListener('drop', preventPaste, true);
    
    // 우클릭 메뉴에서 붙여넣기 차단
    editor.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      return false;
    }, true);

    return () => {
      editor.removeEventListener('paste', preventPaste, true);
      editor.removeEventListener('drop', preventPaste, true);
    };
  }, []);

  // Ctrl+V, Ctrl+Shift+V 등 키보드 단축키 차단
  useEffect(() => {
    const preventPasteKeys = (e) => {
      // Ctrl+V, Ctrl+Shift+V, Ctrl+Insert, Shift+Insert 차단
      if (
        (e.ctrlKey || e.metaKey) && 
        (e.key === 'v' || e.key === 'V' || e.key === 'Insert')
      ) {
        e.preventDefault();
        e.stopPropagation();
        alert('⚠️ 치팅 방지: 붙여넣기가 금지되어 있습니다.');
        return false;
      }
      
      // Shift+Insert 차단
      if (e.shiftKey && e.key === 'Insert') {
        e.preventDefault();
        e.stopPropagation();
        alert('⚠️ 치팅 방지: 붙여넣기가 금지되어 있습니다.');
        return false;
      }
    };

    window.addEventListener('keydown', preventPasteKeys, true);
    
    return () => {
      window.removeEventListener('keydown', preventPasteKeys, true);
    };
  }, []);

  // 타이핑 이벤트 추적
  const handleCodeChange = useCallback((newCode) => {
    if (disabled) return;

    const now = Date.now();
    const timeSinceLastKey = now - lastKeyTimeRef.current;
    
    // 키 입력 간격이 1초 이내인 경우에만 카운트
    if (timeSinceLastKey < 1000) {
      keystrokeCountRef.current += 1;
    } else {
      keystrokeCountRef.current = 1;
    }
    
    lastKeyTimeRef.current = now;

    // 타이핑 이벤트 콜백 호출
    if (onTypingEvent) {
      onTypingEvent({
        timestamp: now,
        codeLength: newCode.length,
        keystrokesPerSecond: keystrokeCountRef.current,
        timeElapsed: timeSinceLastKey
      });
    }

    setCode(newCode);
    if (onChange) {
      onChange(newCode);
    }
  }, [onChange, onTypingEvent, disabled]);

  // 키 다운 이벤트 추적
  const handleKeyDown = useCallback((e) => {
    // 백스페이스, Delete는 키 입력으로 간주하지 않음 (정확한 측정을 위해)
    if (e.key === 'Backspace' || e.key === 'Delete') {
      return;
    }
    
    const now = Date.now();
    const timeSinceLastKey = now - lastKeyTimeRef.current;
    
    if (timeSinceLastKey < 1000) {
      keystrokeCountRef.current += 1;
    } else {
      keystrokeCountRef.current = 1;
    }
    
    lastKeyTimeRef.current = now;
  }, []);

  useEffect(() => {
    setCode(value);
  }, [value]);

  return (
    <div className="code-editor-container">
      <div 
        ref={editorRef}
        className="code-editor-wrapper"
        onKeyDown={handleKeyDown}
      >
        <Editor
          value={code}
          onValueChange={handleCodeChange}
          highlight={code => highlight(code, languages[language])}
          padding={10}
          disabled={disabled}
          placeholder={placeholder}
          style={{
            fontFamily: '"Fira code", "Fira Mono", monospace',
            fontSize: 14,
            minHeight: '400px',
            width: '100%',
            backgroundColor: '#1e1e1e',
            color: '#d4d4d4'
          }}
        />
      </div>
      <div className="code-editor-info">
        <span>💡 붙여넣기(Ctrl+V)는 사용할 수 없습니다. 코드를 직접 입력해주세요.</span>
      </div>
    </div>
  );
};

export default CodeEditor;

