import Configstore from 'configstore';
import { program } from './index.js';
// Load a new ConfigSture by using the commander program name, which is
// set in the main index.js file
export const getConfigStore = () => {
    return new Configstore(program.name());
};
// Get the globally set apiKey
export const getApiKey = () => {
    return getConfigStore().get('apiKey');
};
// Set the global apiKey
export const setApiKey = (newApiKey) => {
    return getConfigStore().set('apiKey', newApiKey);
};
