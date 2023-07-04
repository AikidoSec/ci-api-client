import Configstore from 'configstore';
import { program } from './index.js';

// Load a new ConfigSture by using the commander program name, which is
// set in the main index.js file
export const getConfigStore = () => {
  return new Configstore(program.name());
};

// Get the apikey set through the cli option or the
// one stored in the configuration
export const getApiKey = () => {
  return program.getOptionValue('apikey')
    ? program.getOptionValue('apikey')
    : getConfigStore().get('apikey');
};

// Set the global apiKey
export const setApiKey = (newApiKey: string) => {
  return getConfigStore().set('apikey', newApiKey);
};
