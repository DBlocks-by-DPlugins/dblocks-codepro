import{registerBlockType}from"@wordpress/blocks";import"./style.scss";import Edit from"./edit";import save from"./save";import CustomIcon from"./component/CustomIcon";import metadata from"./block.json";import transforms from"./transforms";registerBlockType(metadata.name,{icon:CustomIcon,edit:Edit,save:save,transforms:transforms});