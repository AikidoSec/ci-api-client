import axios from 'axios';
import { getApiKey } from './configuration.js';
const getApiUrl = () => process.env.AIKIDO_API || 'https://app.aikido.dev';
const getApiHeaders = () => ({ 'X-AIK-API-SECRET': getApiKey() });
export async function startScan(data) {
    return (await axios(`${getApiUrl()}/api/integrations/continuous_integration/scan/repository`, {
        method: 'POST',
        data,
        headers: getApiHeaders(),
    })).data;
}
export async function pollScanStatus(scanId) {
    return (await axios(`${getApiUrl()}/api/integrations/continuous_integration/scan/repository`, {
        method: 'GET',
        params: { scan_id: scanId },
        headers: getApiHeaders(),
    })).data;
}
export var TUploadPayloadType;
(function (TUploadPayloadType) {
    TUploadPayloadType["Checkov"] = "checkov";
    TUploadPayloadType["JsonSbom"] = "json-sbom";
})(TUploadPayloadType || (TUploadPayloadType = {}));
export async function uploadCustomScanResult(data) {
    console.log(`${getApiUrl()}/api/integrations/continuous_integration/scan/custom`);
    return (await axios.post(`${process.env.AIKIDO_API}/api/integrations/continuous_integration/scan/custom`, {
        data,
        headers: getApiHeaders(),
    })).data;
}
