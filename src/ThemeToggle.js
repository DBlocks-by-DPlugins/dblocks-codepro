import { PanelBody, ToggleControl } from '@wordpress/components';

const ThemeToggle = ({ theme, setTheme }) => {
    const toggleTheme = () => {
        setTheme(theme === 'vs-light' ? 'vs-dark' : 'vs-light');
    };

    return (
        <PanelBody title="Editor Settings">
            <ToggleControl
                label="Dark Mode"
                checked={theme === 'vs-dark'}
                onChange={toggleTheme}
            />
        </PanelBody>
    );
};

export default ThemeToggle;
