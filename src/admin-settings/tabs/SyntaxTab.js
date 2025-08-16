import {
    SelectControl,
    ToggleControl,
    __experimentalUnitControl as UnitControl,
    __experimentalSpacer as Spacer
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import CustomPanel from '../components/CustomPanel';

const SyntaxTab = ({ settings, updateSetting, SYNTAX_THEME_OPTIONS }) => {
    return (
        <>
            <CustomPanel title={__('Syntax Highlighter Settings', 'dblocks-codepro')}>
                <SelectControl
                    label={__('Editor Theme', 'dblocks-codepro')}
                    value={settings.syntaxTheme}
                    options={SYNTAX_THEME_OPTIONS}
                    onChange={(value) => updateSetting('syntaxTheme', value)}                    
                    __next40pxDefaultSize={true}
                />

                <Spacer marginBottom={4} />

                <UnitControl
                    label={__('Indent Width', 'dblocks-codepro')}
                    value={settings.indentWidth}
                    onChange={(value) => updateSetting('indentWidth', value)}
                    units={[
                        { value: 'px', label: 'px', default: 4 },
                        { value: 'em', label: 'em', default: 0.25 },
                        { value: 'rem', label: 'rem', default: 0.25 }
                    ]}
                    help={__('The width of indentation (tabs and spaces) in the code editor. Default is 4px.', 'dblocks-codepro')}
                    __next40pxDefaultSize={true}
                />

                <Spacer marginBottom={4} />

                <UnitControl
                    label={__('Font Size', 'dblocks-codepro')}
                    value={settings.fontSize}
                    onChange={(value) => updateSetting('fontSize', value)}
                    units={[
                        { value: 'px', label: 'px', default: 14 },
                        { value: 'em', label: 'em', default: 0.875 },
                        { value: 'rem', label: 'rem', default: 0.875 }
                    ]}
                    help={__('The font size for code text in the syntax highlighter. Default is 14px.', 'dblocks-codepro')}
                    __next40pxDefaultSize={true}
                />

                <Spacer marginBottom={4} />

                <UnitControl
                    label={__('Line Height', 'dblocks-codepro')}
                    value={settings.lineHeight}
                    onChange={(value) => updateSetting('lineHeight', value)}
                    units={[
                        { value: 'px', label: 'px', default: 20 },
                        { value: 'em', label: 'em', default: 1.25 },
                        { value: 'rem', label: 'rem', default: 1.25 }
                    ]}
                    help={__('The height of each line of code. Default is 20px.', 'dblocks-codepro')}
                    __next40pxDefaultSize={true}
                />

                <Spacer marginBottom={4} />

                <UnitControl
                    label={__('Letter Spacing', 'dblocks-codepro')}
                    value={settings.letterSpacing}
                    onChange={(value) => updateSetting('letterSpacing', value)}
                    units={[
                        { value: 'px', label: 'px', default: 0 },
                        { value: 'em', label: 'em', default: 0 },
                        { value: 'rem', label: 'rem', default: 0 }
                    ]}
                    help={__('The spacing between individual characters. Default is 0px (normal spacing).', 'dblocks-codepro')}
                    __next40pxDefaultSize={true}
                />

                <Spacer marginBottom={4} />

                <ToggleControl
                    label={__('Word Wrap', 'dblocks-codepro')}
                    checked={settings.wordWrap}
                    onChange={(value) => updateSetting('wordWrap', value)}
                    help={__('Enable word wrapping so long lines of code wrap to the next line instead of creating horizontal scrollbars.', 'dblocks-codepro')}
                />

                <Spacer marginBottom={4} />

                <ToggleControl
                    label={__('Display Row Numbers', 'dblocks-codepro')}
                    checked={settings.displayRowNumbers}
                    onChange={(value) => updateSetting('displayRowNumbers', value)}
                    help={__('Show line numbers on the left side of code blocks for easier reference and debugging.', 'dblocks-codepro')}
                />
            </CustomPanel>

            <CustomPanel title={__('Front End Highlighter Settings', 'dblocks-codepro')}>
                <ToggleControl
                    label={__('Display Language Label', 'dblocks-codepro')}
                    checked={settings.displayLanguage}
                    onChange={(value) => updateSetting('displayLanguage', value)}
                    help={__('Show the programming language name (like "JavaScript", "PHP", etc.) on code blocks to help visitors understand what type of code they\'re viewing.', 'dblocks-codepro')}
                />

                <Spacer marginBottom={4} />

                <ToggleControl
                    label={__('Show Copy Button', 'dblocks-codepro')}
                    checked={settings.copyButton}
                    onChange={(value) => updateSetting('copyButton', value)}
                    help={__('Display a convenient copy button on code blocks, allowing visitors to easily copy code snippets to their clipboard with one click.', 'dblocks-codepro')}
                />
            </CustomPanel>
        </>
    );
};

export default SyntaxTab;
