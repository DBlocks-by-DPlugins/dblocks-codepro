import { registerBlockType, getBlockType } from '@wordpress/blocks';
import './style.scss';
import Edit from './edit';
import save from './save';
import CustomIcon from './component/CustomIcon';
import metadata from './block.json';
import transforms from './transforms';  // Import transformations

// Only register the block if it's not already registered
if (!getBlockType(metadata.name)) {
    registerBlockType(metadata.name, {
        icon: CustomIcon,
        edit: Edit,
        save,
        transforms,  // Use the imported transformations
    });
}
