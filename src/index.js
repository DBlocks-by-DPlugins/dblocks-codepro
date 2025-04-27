import { registerBlockType } from '@wordpress/blocks';
import './style.scss';
import Edit from './edit';
import save from './save';
import CustomIcon from './component/CustomIcon';
import metadata from './block.json';
import transforms from './transforms';  // Import transformations

registerBlockType(metadata.name, {
    icon: CustomIcon,
    edit: Edit,
    save,
    transforms,  // Use the imported transformations
});
