// Edit.js

import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { RawHTML } from '@wordpress/element';
import { useState, useEffect } from 'react';
import { Panel, PanelBody, ToggleControl, SelectControl, __experimentalUnitControl as UnitControl } from '@wordpress/components';
import './editor.scss';
import BlockControlsComponent from './component/BlockControls.js';
import MonacoEditor from './component/MonacoEditor.js';

export default function Edit({ attributes, setAttributes, clientId }) {
  const blockProps = useBlockProps();
  const [content, setContent] = useState(attributes.content || '<h2>Test</h2>');
  const [viewMode, setViewModeInternal] = useState(attributes.viewMode);
  const [theme, setTheme] = useState(attributes.theme || 'vs-light');
  const [syntaxHighlight, setSyntaxHighlight] = useState(attributes.syntaxHighlight);
  const [syntaxHighlightTheme, setSyntaxHighlightTheme] = useState(attributes.syntaxHighlightTheme || 'light');
  const [editorLanguage, setEditorLanguage] = useState(attributes.editorLanguage || 'html');
  const [fontSize, setFontSize] = useState(attributes.editorFontSize);

  const toggleUseWrapper = () => {
    setAttributes({ useWrapper: !attributes.useWrapper });
  };

  const setViewMode = (newMode) => {
    setAttributes({ viewMode: newMode });
    setViewModeInternal(newMode);
  };


  const handleEditorChange = (value) => {
    setContent(value);
    setAttributes({ content: value });
  };

  const toggleTheme = async () => {
    const newTheme = theme === 'vs-light' ? 'vs-dark' : 'vs-light';
    try {
      const response = await fetch('/wp-json/dblocks-codepro/v1/theme', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': wpApiSettings.nonce
        },
        body: JSON.stringify({ theme: newTheme })
      });

      if (!response.ok) throw new Error('Network response was not ok.');
      setTheme(newTheme);
      setAttributes({ theme: newTheme });
    } catch (error) {
      console.error('Failed to update theme:', error);
    }
  };

  const toggleSyntaxHighlightTheme = async () => {
    const newSyntaxTheme = syntaxHighlightTheme === 'light' ? 'dark' : 'light';
    try {
      const response = await fetch('/wp-json/dblocks-codepro/v1/syntax-theme/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': wpApiSettings.nonce
        },
        body: JSON.stringify({ syntaxTheme: newSyntaxTheme })
      });

      if (!response.ok) throw new Error('Network response was not ok.');
      setSyntaxHighlightTheme(newSyntaxTheme);  // Update local state for instant UI update
      setAttributes({ syntaxHighlightTheme: newSyntaxTheme });  // Update block attributes for persistence
    } catch (error) {
      console.error('Failed to update syntax theme:', error);
    }
  };


  const toggleSyntaxHighlight = () => {
    setSyntaxHighlight(!syntaxHighlight);
    setAttributes({ syntaxHighlight: !syntaxHighlight });
  };


  const changeEditorLanguage = (language) => {
    setEditorLanguage(language);
    setAttributes({ editorLanguage: language });
  };

  const setFontSizeAndUpdate = newSize => {
    fetch('/wp-json/dblocks-codepro/v1/editor-font-size/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-WP-Nonce': wpApiSettings.nonce  // Ensure this is correctly configured
      },
      body: JSON.stringify({ editorFontSize: newSize })
    })
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok.');
        return response.json();
      })
      .then(data => {
        setFontSize(newSize);
        setAttributes({ editorFontSize: newSize });
      })
      .catch(error => {
        console.error('Failed to update editor font size:', error);
      });
  };

  useEffect(() => {
    fetch('/wp-json/dblocks-codepro/v1/theme')
      .then(response => response.json())
      .then(data => {
        setTheme(data);
        setAttributes({ theme: data });
      })
      .catch(error => console.error('Error fetching theme:', error));

    fetch('/wp-json/dblocks-codepro/v1/syntax-theme/')
      .then(response => response.json())
      .then(data => {
        setSyntaxHighlightTheme(data);
        setAttributes({ syntaxHighlightTheme: data });
      })
      .catch(error => console.error('Error fetching syntax theme:', error));

    fetch('/wp-json/dblocks-codepro/v1/editor-font-size/')
      .then(response => response.json())
      .then(data => {
        // console.log("Fetched font size:", data);  // Check the fetched font size
        setFontSize(data);
        setAttributes({ editorFontSize: data });
      })
      .catch(error => console.error('Error fetching editor font size:', error));
  }, []);

  useEffect(() => {
    setAttributes({ theme, syntaxHighlight, syntaxHighlightTheme, editorLanguage, fontSize });
  }, [theme, syntaxHighlight, syntaxHighlightTheme, editorLanguage, fontSize]);

  return (
    <>
      <InspectorControls>
        <Panel>
          <PanelBody title="Code Editor Settings">
            <ToggleControl
              label="Dark Mode"
              checked={theme === 'vs-dark'}
              onChange={toggleTheme}
            />
            <UnitControl
              label="Font Size"
              value={fontSize}
              onChange={setFontSizeAndUpdate}
              units={[{ value: 'px', label: 'Pixels', default: 14 }]}
              min={12}
              max={24}
            />
          </PanelBody>
          <PanelBody title="Content Settings">
            <ToggleControl
              label="Use Wrapper"
              checked={attributes.useWrapper}
              onChange={toggleUseWrapper}
            />
          </PanelBody>
          <PanelBody title="Syntax Highlighting">
            <ToggleControl
              label="Activate Syntax Highlighting"
              checked={syntaxHighlight}
              onChange={toggleSyntaxHighlight}
            />
            {syntaxHighlight && (
              <>
                <ToggleControl
                  label="Dark Theme"
                  checked={syntaxHighlightTheme === 'dark'}
                  onChange={toggleSyntaxHighlightTheme}
                />
                <SelectControl
                  label="Language"
                  value={editorLanguage}
                  options={[
                    { label: 'HTML', value: 'html' },
                    { label: 'CSS', value: 'css' },
                    { label: 'SCSS', value: 'scss' },
                    { label: 'JavaScript', value: 'js' },
                    { label: 'PHP', value: 'php' },
                    { label: 'TypeScript', value: 'typescript' },
                    { label: 'Bash', value: 'bash' },
                    { label: 'Twig', value: 'twig' },
                    { label: 'YAML', value: 'yaml' },
                    { label: 'Plaintext', value: 'plaintext' },
                    { label: 'JSON', value: 'json' }
                  ]}
                  onChange={changeEditorLanguage}
                />
              </>
            )}

          </PanelBody>
        </Panel>
      </InspectorControls>

      <div {...blockProps}>
        {syntaxHighlight ? (
          <MonacoEditor
            height="30vh"
            language={editorLanguage}
            theme={`vs-${syntaxHighlightTheme}`}
            value={content}
            onChange={handleEditorChange}
            clientId={clientId}
            dispatch={wp.data.dispatch}
            isSyntaxHighlight={true}
          />
        ) : (
          <>
            <BlockControlsComponent viewMode={viewMode} setViewMode={setViewMode} />
            {viewMode === 'code' && (
              <MonacoEditor
                height="30vh"
                language="html"
                theme={theme}
                setTheme={setTheme}
                value={content}
                fontSize={parseFloat(fontSize)}
                setFontSize={setFontSize}
                onChange={handleEditorChange}
                clientId={clientId}
                dispatch={wp.data.dispatch}
              />
            )}
            {viewMode === 'preview' && attributes.useWrapper && (
              <RawHTML>{content}</RawHTML>
            )}
            {viewMode === 'split' && (
              <>
                <MonacoEditor
                  height="30vh"
                  language="html"
                  theme={theme}
                  setTheme={setTheme}
                  value={content}
                  fontSize={parseFloat(fontSize)}
                  setFontSize={setFontSize}
                  onChange={handleEditorChange}
                  clientId={clientId}
                  dispatch={wp.data.dispatch}
                />

                {attributes.useWrapper ? (
                  <RawHTML>{content}</RawHTML>
                ) : null}

              </>
            )}

          </>
        )}
      </div>

      {viewMode === 'preview' && !attributes.useWrapper && (
        <RawHTML>{content}</RawHTML>
      )}

      {viewMode === 'split' && !attributes.useWrapper && (
        <RawHTML>{content}</RawHTML>
      )}
    </>
  );
}
