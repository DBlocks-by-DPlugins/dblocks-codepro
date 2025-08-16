import { 
    Panel, 
    PanelBody, 
    SelectControl, 
    ToggleControl,
    __experimentalSpacer as Spacer
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const SyntaxTab = ({ settings, updateSetting, SYNTAX_THEME_OPTIONS }) => {
    return (
        <Panel>
            <PanelBody 
                title={__('Syntax Highlighter Settings', 'dblocks-codepro')}
                initialOpen={true}
            >
                <SelectControl
                    label={__('Syntax Highlighter Editor Theme', 'dblocks-codepro')}
                    value={settings.syntaxTheme}
                    options={SYNTAX_THEME_OPTIONS}
                    onChange={(value) => updateSetting('syntaxTheme', value)}
                    help={__('The color scheme for the Monaco editor in both the block editor and frontend syntax highlighting. Light theme works well with bright designs, dark theme is great for technical content.', 'dblocks-codepro')}
                    __next40pxDefaultSize={true}
                />

                <Spacer marginBottom={4} />

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
            </PanelBody>
        </Panel>
    );
};

export default SyntaxTab;
