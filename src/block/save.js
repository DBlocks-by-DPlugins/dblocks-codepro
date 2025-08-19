import { useBlockProps } from '@wordpress/block-editor';
import { RawHTML } from '@wordpress/element';
import { getVariationType, VARIATION_TYPES } from './constants/variations.js';

export default function save({ attributes }) {

	const { content, syntaxHighlight, viewMode, scaleHeightWithContent, editorLanguage, useWrapper } = attributes || {};

	const variationType = getVariationType({ syntaxHighlight, viewMode, scaleHeightWithContent });

	return (
		<>
			{variationType === VARIATION_TYPES.SYNTAX_HIGHLIGHTER ? (
				<div {...useBlockProps.save()}>
					<pre className={`language-${editorLanguage}`}>
						<code>
							<RawHTML>{content}</RawHTML>
						</code>
					</pre>
				</div>
			) : (
				// Advanced Custom HTML variation
				useWrapper ? (
					<div {...useBlockProps.save()}>
						<RawHTML>{content}</RawHTML>
					</div>
				) : (
					<RawHTML>{content}</RawHTML>
				)
			)}
		</>
	);
}
