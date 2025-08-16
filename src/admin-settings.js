import { render } from '@wordpress/element';
import AdminSettings from './admin-settings/AdminSettings';
import './admin-settings/admin-settings.scss';

// Initialize the settings page when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('dblocks-codepro-settings-root');
    if (container) {
        render(<AdminSettings />, container);
    }
});
