import axios from 'axios';
import { gzipSync } from 'node:zlib';
import { resolveAuth } from './auth/auth.js';
import { outputDebug } from './output.js';
export async function startScan(data) {
    const auth = await resolveAuth();
    const oidcOrApiKeyUrlSegment = auth.withOidc ? 'oidc_continuous_integration' : 'continuous_integration';
    const requestUrl = `${auth.baseUrl}/api/integrations/${oidcOrApiKeyUrlSegment}/scan/repository`;
    const requestConfig = {
        method: 'POST',
        data,
        headers: auth.headers,
    };
    outputDebug(`API request: ${requestUrl}`);
    outputDebug(requestConfig);
    const resultData = (await axios(requestUrl, requestConfig)).data;
    outputDebug(resultData);
    return resultData;
}
export async function pollScanStatus(scanId) {
    const auth = await resolveAuth();
    const oidcOrApiKeyUrlSegment = auth.withOidc ? 'oidc_continuous_integration' : 'continuous_integration';
    const requestUrl = `${auth.baseUrl}/api/integrations/${oidcOrApiKeyUrlSegment}/scan/repository`;
    const requestConfig = {
        method: 'GET',
        params: { scan_id: scanId },
        headers: auth.headers,
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
    const auth = await resolveAuth();
    const oidcOrApiKeyUrlSegment = auth.withOidc ? 'oidc_continuous_integration' : 'continuous_integration';
    const requestUrl = `${auth.baseUrl}/api/integrations/${oidcOrApiKeyUrlSegment}/scan/custom`;
    const requestConfig = {
        method: 'POST',
        data,
        headers: auth.headers,
    };
    outputDebug(`API request: ${requestUrl}`);
    outputDebug(requestConfig);
    const resultData = (await axios(requestUrl, requestConfig)).data;
    outputDebug(resultData);
    return resultData;
}
export async function uploadCodeCoverage(data) {
    const auth = await resolveAuth();
    const oidcOrApiKeyUrlSegment = auth.withOidc ? 'oidc_continuous_integration' : 'continuous_integration';
    const requestUrl = `${auth.baseUrl}/api/integrations/${oidcOrApiKeyUrlSegment}/scan/code_coverage`;
    const requestConfig = {
        method: 'POST',
        data: {
            repository_id: data.repository_id,
            commit_sha: data.commit_sha,
            branch_name: data.branch_name,
            repository_source_paths: data.repository_source_paths,
            eof: data.eof,
            files: data.files.map((file) => ({
                filename: file.filename,
                format: file.format,
                content: gzipSync(file.content).toString('base64'),
            })),
        },
        headers: auth.headers,
    };
    outputDebug(`API request: ${requestUrl}`);
    outputDebug({
        ...requestConfig,
        data: {
            ...requestConfig.data,
            files: requestConfig.data.files.map((file) => ({
                filename: file.filename,
                format: file.format,
                content: `[base64 gzip, ${file.content.length} chars]`,
            })),
        },
    });
    const resultData = (await axios(requestUrl, requestConfig)).data;
    outputDebug(resultData);
    return resultData;
}
