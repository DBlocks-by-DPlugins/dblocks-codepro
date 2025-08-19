const defaultConfig = require('@wordpress/scripts/config/webpack.config');
const path = require('path');

module.exports = {
    ...defaultConfig,
            entry: {
            index: path.resolve(process.cwd(), 'src', 'index.js'),
            'admin-settings': path.resolve(process.cwd(), 'src', 'admin-settings.js'),
            view: path.resolve(process.cwd(), 'src', 'frontend', 'view.js'),
        },
    devServer: {
        ...defaultConfig.devServer,
        allowedHosts: 'dblocks.local', // This can also be set to a url i.e "dev-site.dev'
    },
};