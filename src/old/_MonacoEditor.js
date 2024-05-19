// MonacoEditor Old

import { useEffect, useRef, useState } from "@wordpress/element";
import { emmetHTML } from 'emmet-monaco-es'

export default function MonacoEditor({ height, language, theme, setTheme, value, fontSize, setFontSize, onChange, clientId, dispatch, isSyntaxHighlight }) {
  const { selectBlock } = dispatch('core/block-editor');

  const iframeRef = useRef(null);

  const [monacoInstance, setMonacoInstance] = useState(null);
  const [monacoEditorInstance, setMonacoEditorInstance] = useState(null);

  const [boxShadow, setBoxShadow] = useState('inset 0 0 0 1px #1e1e1e');

  useEffect(() => {
    if (iframeRef?.current) {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument;

      const loader = doc.createElement('div');
      loader.style.display = 'flex';
      loader.style.justifyContent = 'center';
      loader.style.alignItems = 'center';
      loader.style.width = '100%';
      loader.style.height = '100%';
      loader.innerHTML = 'Loading...';
      doc.body.appendChild(loader);

      const style = doc.createElement('style');
      style.textContent = `
            html, body {
                margin: 0;
                padding: 0;
            }
        `;
      doc.head.appendChild(style);

      const link = doc.createElement('link');
      link.href = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.20.0/min/vs/editor/editor.main.min.css';
      link.rel = 'stylesheet';
      doc.head.appendChild(link);

      const script = doc.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.20.0/min/vs/loader.min.js';
      script.onload = () => {
        iframe.contentWindow.require.config({ paths: { 'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor@0.20.0/min/vs' } });
        iframe.contentWindow.require(['vs/editor/editor.main'], function () {
          const container = doc.createElement('div');
          container.style.width = '100%';
          container.style.height = '100%';
          container.style.borderRadius = '2px';
          container.style.boxShadow = 'inset 0 0 0 1px #1e1e1e';
          container.style.outline = '1px solid #0000';
          doc.body.appendChild(container);

          const monaco = iframe.contentWindow.monaco.editor.create(container, {
            theme: theme || 'vs-light',
            language: language || 'html',
            value: value || 'Write HTML...',
            fontSize: fontSize || 14,
            automaticLayout: true,
            minimap: { enabled: false }
          });

          monaco.onDidChangeModelContent(() => {
            if (typeof onChange === 'function') {
              onChange(monaco.getValue());
            }
          });

          monaco.onDidFocusEditorWidget(() => {
            selectBlock(clientId);
            setBoxShadow('0 0 0 var(--wp-admin-border-width-focus) var(--wp-admin-theme-color)');
          });

          monaco.onDidBlurEditorWidget(() => {
            setBoxShadow('inset 0 0 0 1px #1e1e1e');
          });

          doc.body.removeChild(loader);
          setMonacoInstance(iframe.contentWindow.monaco);
          setMonacoEditorInstance(monaco);

          if ((language || 'html') === 'html') {
            emmetHTML(iframe.contentWindow.monaco);
          }

          if (window?.parent?.monacoInstances && Array.isArray(window?.parent?.monacoInstances)) {
            window.parent.monacoInstances.push({
              monaco: iframe.contentWindow.monaco,
              editor: monaco,
              setTheme,
              setFontSize
            });
          } else {
            window.parent.monacoInstances = [{
              monaco: iframe.contentWindow.monaco,
              editor: monaco,
              setTheme,
              setFontSize
            }];
          }
        });
      }
      doc.body.appendChild(script);
    }
  }, [iframeRef]);

  useEffect(() => {
    if (monacoInstance && theme) {
      if (!isSyntaxHighlight && window?.parent?.monacoInstances && Array.isArray(window?.parent?.monacoInstances)) {
        window?.parent?.monacoInstances.map(instance => {
          if (typeof instance?.setTheme === 'function') {
            instance.monaco.editor.setTheme(theme);
            instance.setTheme(theme);
          }
        });
      } else {
        monacoInstance.editor.setTheme(theme);
        if (typeof setTheme === 'function') {
          setTheme(theme);
        }
      }
    }
  }, [monacoInstance, theme]);

  useEffect(() => {
    if (monacoInstance && monacoEditorInstance && language) {
      monacoInstance.editor.setModelLanguage(monacoEditorInstance.getModel(), language)
    }
  }, [monacoInstance, monacoEditorInstance, language]);

  useEffect(() => {
    if (monacoEditorInstance && fontSize) {
      if (!isSyntaxHighlight && window?.parent?.monacoInstances && Array.isArray(window?.parent?.monacoInstances)) {
        window?.parent?.monacoInstances.map(instance => {
          if (typeof instance?.setFontSize === 'function') {
            instance.editor.updateOptions({ fontSize });
            instance.setFontSize(fontSize);
          }
        });
      } else {
        monacoEditorInstance.updateOptions({ fontSize })
        if (typeof setFontSize === 'function') {
          setFontSize(fontSize);
        }
      }
    }
  }, [monacoEditorInstance, fontSize]);

  return (
    <iframe ref={iframeRef} style={{ width: '100%', height, borderRadius: '2px', boxShadow, outline: '1px solid #0000' }}></iframe>
  );
}
