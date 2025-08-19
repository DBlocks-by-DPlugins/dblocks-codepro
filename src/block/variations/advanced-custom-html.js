import { __ } from '@wordpress/i18n';
import { Fragment, RawHTML } from '@wordpress/element';

export default function AdvancedCustomHtml({ viewMode, syntaxHighlight, scaleHeightWithContent, content }) {
	return (
		<>
			{/* <p>View Mode: {viewMode || 'Not set'}</p> */}
			<RawHTML>{content}</RawHTML>	
		</>
	);
}