import axios from 'axios';
import { getApiKey } from './configuration.js';
import { TScanApiOptions } from './commands/scan.js';

const getApiHeaders = () => ({ 'X-AIK-API-SECRET': getApiKey() });

// Start a scan with options (see: startScanSchema)
// and return the data
export async function startScan(options: TScanApiOptions) {
  return (
    await axios(
      `${process.env.AIKIDO_API}/api/integrations/continuous_integration/scan/repository`,
      {
        method: 'POST',
        headers: getApiHeaders(),
      }
    )
  ).data;
}

export async function pollScanStatus(scanId: number) {
  return (
    await axios.get(
      `${process.env.AIKIDO_API}/api/integrations/continuous_integration/scan/repository`,
      {
        params: { scan_id: scanId },
        headers: getApiHeaders(),
      }
    )
  ).data;
}
