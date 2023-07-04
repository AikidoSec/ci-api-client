import axios from 'axios';
import { getApiKey } from './configuration.js';
const getApiHeaders = () => ({ 'X-AIK-API-SECRET': getApiKey() });
// Start a scan with options (see: startScanSchema)
// and return the data
export async function startScan(options) {
    return (await axios(`${process.env.AIKIDO_API}/api/integrations/continuous_integration/scan/repository`, {
        method: 'POST',
        headers: getApiHeaders(),
    })).data;
}
export async function pollScanStatus(scanId) {
    return (await axios.get(`${process.env.AIKIDO_API}/api/integrations/continuous_integration/scan/repository`, {
        params: { scan_id: scanId },
        headers: getApiHeaders(),
    })).data;
}
