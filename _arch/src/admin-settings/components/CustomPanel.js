import React from 'react';
import { __ } from '@wordpress/i18n';

const CustomPanel = ({ title, children, className = '' }) => {
    return (
        <div className={`custom-panel ${className}`}>
            <h3 className="custom-panel-header">{title}</h3>
            
            <div className="custom-panel-content">
                {children}
            </div>
        </div>
    );
};

export default CustomPanel;
