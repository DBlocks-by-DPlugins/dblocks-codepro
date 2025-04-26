import { registerBlockType, getBlockType } from '@wordpress/blocks';
import './style.scss';
import Edit from './edit';
import save from './save';
import CustomIcon from './component/CustomIcon';
import metadata from './block.json';
import transforms from './transforms';  // Import transformations

// Add a unique identifier to know which instance of the script is running
const scriptInstanceId = Date.now() + Math.floor(Math.random() * 1000);
console.debug(`[CodePro ${scriptInstanceId}] Script loaded, checking if block "${metadata.name}" exists:`, !!getBlockType(metadata.name));

// Check if block is already registered to prevent duplicate registration error
if (!getBlockType(metadata.name)) {
    console.debug(`[CodePro ${scriptInstanceId}] Registering block "${metadata.name}"`);
    registerBlockType(metadata.name, {
        icon: CustomIcon,
        edit: Edit,
        save,
        transforms,  // Use the imported transformations
    });
    console.debug(`[CodePro ${scriptInstanceId}] Block "${metadata.name}" registered successfully`);
} else {
    console.warn(`[CodePro ${scriptInstanceId}] Block "${metadata.name}" is already registered. Skipping registration.`);
}
