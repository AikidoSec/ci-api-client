import Configstore from 'configstore';
import { program } from './index.js';
export const getConfigStore = () => {
    return new Configstore(program.name());
};
export const getApiKey = () => {
    return program.getOptionValue('apikey')
        ? program.getOptionValue('apikey')
        : getConfigStore().get('apikey');
};
export const setApiKey = (newApiKey) => {
    return getConfigStore().set('apikey', newApiKey);
};
export const getUseOidc = () => {
    return Boolean(program.getOptionValue('use-oidc')) || String(process.env.USE_OIDC).toLowerCase().trim() === 'true';
};
export const getRegion = () => {
    return String(process.env.AIKIDO_REGION || program.getOptionValue('region') || 'eu')
        .toLowerCase()
        .trim();
};
