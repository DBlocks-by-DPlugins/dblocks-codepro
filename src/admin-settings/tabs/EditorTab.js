import { 
    Panel, 
    PanelBody, 
    SelectControl, 
    __experimentalUnitControl as UnitControl,
    __experimentalSpacer as Spacer
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const EditorTab = ({ settings, updateSetting, THEME_OPTIONS }) => {
    return (
        <Panel>
            <PanelBody 
                title={__('Advanced Custom HTML Settings', 'dblocks-codepro')}
                initialOpen={true}
            >
                <SelectControl
                    label={__('Default Editor Theme', 'dblocks-codepro')}
                    value={settings.theme}
                    options={THEME_OPTIONS}
                    onChange={(value) => updateSetting('theme', value)}
                    help={__('The Monaco editor theme for coding. This affects the editor appearance while writing HTML, CSS, and JavaScript.', 'dblocks-codepro')}
                    __next40pxDefaultSize={true}
                />

                <Spacer marginBottom={4} />

                <UnitControl
                    label={__('Default Editor Font Size', 'dblocks-codepro')}
                    value={settings.editorFontSize}
                    onChange={(value) => updateSetting('editorFontSize', value)}
                    units={[{ value: 'px', label: 'px', default: 14 }]}
                    min={10}
                    max={30}
                    help={__('Font size for text in the Monaco editor. Larger sizes improve readability, smaller sizes show more code.', 'dblocks-codepro')}
                    __next40pxDefaultSize={true}
                />
            </PanelBody>
        </Panel>
    );
};

export default EditorTab;
