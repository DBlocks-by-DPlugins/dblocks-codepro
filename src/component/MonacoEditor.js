import { useEffect, useRef, useState } from "@wordpress/element";

export default function MonacoEditor({ height, language, theme, value, fontSize, onChange }) {
  const iframeRef = useRef(null);

  const [monacoInstance, setMonacoInstance] = useState(null);
  const [monacoEditorInstance, setMonacoEditorInstance] = useState(null);

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

          doc.body.removeChild(loader);
          setMonacoInstance(iframe.contentWindow.monaco);
          setMonacoEditorInstance(monaco);
        });
      }
      doc.body.appendChild(script);
    }
  }, [iframeRef]);

  useEffect(() => {
    if (monacoInstance && theme) {
      monacoInstance.editor.setTheme(theme)
    }
  }, [monacoInstance, theme]);

  useEffect(() => {
    if (monacoInstance && monacoEditorInstance && language) {
      monacoInstance.editor.setModelLanguage(monacoEditorInstance.getModel(), language)
    }
  }, [monacoInstance, monacoEditorInstance, language]);

  useEffect(() => {
    if (monacoEditorInstance && fontSize) {
      monacoEditorInstance.updateOptions({ fontSize })
    }
  }, [monacoEditorInstance, fontSize]);

  // useEffect(() => {
  //   if (monacoInstance && monacoEditorInstance && value) {
  //     monacoEditorInstance.getModel().setValue(value)
  //   }
  // }, [monacoEditorInstance, value]);

  return (
    <iframe ref={iframeRef} style={{ width: '100%', height, borderRadius: '2px', boxShadow: 'inset 0 0 0 1px #1e1e1e', outline: '1px solid #0000' }}></iframe>
  );
}
