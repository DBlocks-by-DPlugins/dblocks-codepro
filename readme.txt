=== DBlocks CodePro ===
Contributors:      dplugins, krstivoja
Tags:              block, html, code, monaco editor
Tested up to:      6.6.2
Stable tag:        1.2.4
License:           GPL-2.0-or-later
License URI:       https://www.gnu.org/licenses/gpl-2.0.html

Advanced HTML Block and Code Syntax Highlighterin in one.

== Description ==


**Enhanced Code Editor for WordPress** transforms the default WordPress block editor into a powerful development environment tailored for coding and content creation. Built on the robust Monaco Editor, this plugin brings advanced code editing features directly into WordPress, making it an essential tool for developers, designers, and content creators who frequently work with code.

### Key Features:

-   **Rich Code Editing**: Leverage the power of Monaco Editor, renowned for its extensive capabilities including syntax highlighting, intelligent code completion, and seamless user experience.
-   **Emmet Integration**: Speed up your HTML/CSS workflow with built-in Emmet support, allowing you to use shorthand for rapid coding.
-   **Theme Customization**: Toggle between light and dark themes to suit your preference or match your working environment, enhancing visibility and reducing eye strain.
-   **Dynamic Syntax Highlighting**: Easily enable or disable syntax highlighting and choose between light or dark themes to best fit the context of your content.
-   **Flexible Editor Configuration**: Adjust font sizes and choose from various programming languages such as HTML, CSS, JavaScript, PHP, and more, catering to diverse development needs.
-   **Multiple Viewing Modes**: Includes 'Code', 'Preview', and 'Split View' modes, enabling you to code and preview content simultaneously or separately, optimizing your workflow.

### Ideal Use Cases:

This plugin is perfect for:

-   **Developers** embedding custom code directly into posts or pages.
-   **Educational platforms** that feature coding tutorials.
-   **Tech bloggers** showcasing programming tips and snippets.

### Why Choose Enhanced Code Editor?

-   **Improved Usability**: With an intuitive interface and adjustable settings, this plugin is designed to enhance productivity and ease of use.
-   **Responsive and Adaptive**: Works seamlessly across different devices and screen sizes, ensuring a consistent editing experience everywhere.
-   **Persistent Settings**: Customizations and settings are saved per user, so your environment is the same each time you log in.

Embrace a superior coding experience within WordPress with **Enhanced Code Editor**. Whether you're a professional developer or a hobbyist, this plugin adapts to your needs, making coding within WordPress a delight.

== Installation ==

This section describes how to install the plugin and get it working.

e.g.

1. Upload the plugin files to the `/wp-content/plugins/dblocks-codepro` directory, or install the plugin through the WordPress plugins screen directly.
2. Activate the plugin through the 'Plugins' screen in WordPress


== Frequently Asked Questions ==

= A question that someone might have =

An answer to that question.

= What about foo bar? =

Answer to foo bar dilemma.

== Screenshots ==

1. Preview with Emmet Abbreviation
2. Dark and Light Theme
3. Split Preview
4. Supported languages

== Changelog ==

= 1.2.4 =
* Updated monaco editor to version 0.52.0
* Updated emmet-monaco-es (for autocomplete) to version 5.5.0 to be compatible with monaco editor 0.52.0

= 1.2.3 =
* Updated monacoe editor loading. 6.6 have removed the class from editor-iframe, that we're using to load monaco editor.
* Updated getSite() function to use new WP Data API


= 1.2.2 =
* Version bump

= 1.2.1 =
* Updated API paths for WP subfolder installations
* Language changes take effect immediately; previously, a reload was required
* Font size changes take effect immediately; previously, a reload was required


= 1.2.0 =
* Updated version number to be higher number, then self hosted one to remove confusion witch is the latest one.

= 1.0.2 =
* Fixed fetching API in subfolder wordpress installation. 

= 1.0.1 =
* Added check to verify if the block category exists.

= 1.0.0 =
* Release
