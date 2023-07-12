import axios from 'axios';
import { getApiKey } from './configuration.js';
import { outputDebug } from './output.js';
const getApiUrl = () => process.env.AIKIDO_API || 'https://app.aikido.dev';
const getApiHeaders = () => ({
    'Content-Type': 'application/json',
    'X-AIK-API-SECRET': getApiKey(),
});
export async function startScan(data) {
    const requestUrl = `${getApiUrl()}/api/integrations/continuous_integration/scan/repository`;
    const requestConfig = {
        method: 'POST',
        data,
        headers: getApiHeaders(),
    };
    outputDebug(`API request: ${requestUrl}`);
    outputDebug(requestConfig);
    const resultData = (await axios(requestUrl, requestConfig)).data;
    outputDebug(resultData);
    return resultData;
}
export async function pollScanStatus(scanId) {
    const requestUrl = `${getApiUrl()}/api/integrations/continuous_integration/scan/repository`;
    const requestConfig = {
        method: 'GET',
        params: { scan_id: scanId },
        headers: getApiHeaders(),
    };
    outputDebug(`API request: ${requestUrl}`);
    outputDebug(requestConfig);
    const resultData = (await axios(requestUrl, requestConfig)).data;
    outputDebug(resultData);
    return resultData;
}
export var TUploadPayloadType;
(function (TUploadPayloadType) {
    TUploadPayloadType["Checkov"] = "checkov";
    TUploadPayloadType["JsonSbom"] = "json-sbom";
})(TUploadPayloadType || (TUploadPayloadType = {}));
export async function uploadCustomScanResult(data) {
    const requestUrl = `${getApiUrl()}/api/integrations/continuous_integration/scan/custom`;
    const requestConfig = {
        method: 'POST',
        data,
        headers: getApiHeaders(),
    };
    outputDebug(`API request: ${requestUrl}`);
    outputDebug(requestConfig);
    const resultData = (await axios(requestUrl, requestConfig)).data;
    outputDebug(resultData);
    return resultData;
}
