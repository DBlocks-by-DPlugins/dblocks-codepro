=== DBlocks CodePro ===
Contributors:      dplugins, krstivoja
Tags:              block, html, code, monaco editor, code block
Tested up to:      6.8.2
Stable tag:        1.4.2
License:           GPL-2.0-or-later
License URI:       https://www.gnu.org/licenses/gpl-2.0.html

Advanced Custom HTML Block and Code Syntax Highlightering for sharing code snippets and running code.

== Description ==

[youtube https://www.youtube.com/watch?v=Jec4l5h6pwQ]

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

= 1.4.2 =
content change and added blueprint.json

= 1.4.1 =

changed from wp_kses() to raw $content as wp_kres strips svg

= 1.4.0 =
* Added a Global Settings page
* Added a Settings for Unused Plugins page (next to Disable Plugin)
* Moved Global Settings from the sidebar to the Settings page
* Split block into two variations: Custom HTML and Syntax Highlighting
* Fixed template loading
* Fixed loading in the v2 API when the editor is not in an iframe

= 1.3.2 =
* Added transfrom from HTML Block to CodePro Block


= 1.3.1 =
* Version Bump

= 1.3.0 =
* Added option to edit code outside of the block. That is perfect for small block sizes if you place code for a logo. 
* Added display language when using Syntax Highlighting. You can enable it from sidebar.
* Added copy code button when using Syntax Highlighting. You can enable it from sidebar.
* Topbar is simplified. If Highlighting is on you will see language switch if code is running and Highlighting is off you will see preview and split option. 
* Improved Monaco Editor performance and added loader. 
* Improved compatibility with WP 6.8.1



= 1.2.9 =
* Added option to enable/disable syntax highlighting inside toolbar
* Added option to select language inside toolbar
* Added option to select view mode as dropdown inside toolbar
* Added tooltip for "Use Wrapper"
* Added tooltip for "Activate Syntax Highlighting"
* Updated paths for build script


= 1.2.8 =
* Updated yaml action

= 1.2.7 =
* Updated inspector controls to be compatible with WP 6.7.1. Fixed deprecation warning.
* Updated handling API if permalinks is set to 'Plain'

= 1.2.6 =
* Fixed height of Monaco Editor. WP 6.7.1 added to make it 100vh by default. Now it is fit-content by default.
* Updated monaco editor to the latest version 0.52.0. It was 0.48 before.

= 1.2.5 =
* Added option to scale Monaco Editor height with content
* Fixed height is moved from global option to per curent block option
* Fixed height units expanded to include PX, %, EM, REM. Previously only VH was supported.

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
