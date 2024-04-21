import { registerBlockType } from '@wordpress/blocks';

import './style.scss';
import Edit from './edit';
import save from './save';
import CustomIcon from './component/CustomIcon';
import metadata from './block.json';

registerBlockType( metadata.name, {
	icon: CustomIcon,
	edit: Edit,
	save,
} );
