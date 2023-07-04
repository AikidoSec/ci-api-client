import Ajv from 'ajv';
import axios from 'axios';
import { InvalidArgumentError } from 'commander';
import { getApiKey } from './configuration.js';
const startScanSchema = {
    type: 'object',
    properties: {
        repo_id: { type: 'string' },
        base_commit_id: { type: 'string' },
        head_commit_id: { type: 'string' },
        branch_name: { type: 'string' },
        pull_request_metadata: {
            type: 'object',
            properties: {
                url: { type: 'string' },
                title: { type: 'string' },
            },
        },
        self_managed_scanners: { type: 'array' },
        fail_on_dependency_scan: { type: 'boolean' },
        fail_on_sast_scan: { type: 'boolean' },
        fail_on_iac_scan: { type: 'boolean' },
        minimum_severity: { enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
    },
    required: ['repo_id', 'base_commit_id', 'head_commit_id', 'branch_name'],
    additionalProperties: false,
};
const getApiHeaders = () => ({ 'X-AIK-API-SECRET': getApiKey() });
// Start a scan with options (see: startScanSchema)
// and return the data
export async function startScan(options) {
    // Validate the incoming service options before sending them to the API
    const jsonValidator = new Ajv.default();
    const valid = jsonValidator.validate(startScanSchema, options);
    if (!valid) {
        throw new InvalidArgumentError('Invalid startScan.options');
    }
    return (await axios(`${process.env.AIKIDO_API}/api/integrations/continuous_integration/scan/repository`, {
        method: 'POST',
        headers: getApiHeaders(),
    })).data;
}
export async function pollScanStatus(scanId) {
    // if (isNaN(parseInt(scanId))) {
    //   throw new InvalidArgumentError('Invalid pollScanStatus.scanId');
    // }
    return (await axios.get(`${process.env.AIKIDO_API}/api/integrations/continuous_integration/scan/repository`, {
        params: { scan_id: scanId },
        headers: getApiHeaders(),
    })).data;
}
