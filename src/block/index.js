import { registerBlockType } from '@wordpress/blocks';
import './style.scss';
import Edit from './edit';
import metadata from './block.json';
import CustomIcon from './components/CustomIcon';

// Import transforms
import transforms from './transforms';

registerBlockType( metadata.name, {
	icon: CustomIcon,
	edit: Edit,
	// save,
	transforms: transforms
} );
