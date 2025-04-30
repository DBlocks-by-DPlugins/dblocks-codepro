import { registerBlockType, getBlockType } from '@wordpress/blocks';
import './style.scss';
import Edit from './edit';
import save from './save';
import CustomIcon from './component/CustomIcon';
import metadata from './block.json';
import transforms from './transforms';  // Import transformations

const BLOCK_NAME = metadata.name;

// Only register the block if it's not already registered
if (!getBlockType(BLOCK_NAME)) {
    try {
        registerBlockType(BLOCK_NAME, {
            icon: CustomIcon,
            edit: Edit,
            save,
            transforms,  // Use the imported transformations
        });
    } catch (error) {
        console.error(`Failed to register block ${BLOCK_NAME}:`, error);
    }
}
