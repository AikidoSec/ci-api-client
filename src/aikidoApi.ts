import axios from 'axios';
import { getApiKey } from './configuration.js';
import { outputDebug } from './output.js';

const getApiUrl = () => process.env.AIKIDO_API || 'https://app.aikido.dev';
const getApiHeaders = () => ({
  'Content-Type': 'application/json',
  'X-AIK-API-SECRET': getApiKey(),
});

// #region Scan start
export type TScanApiOptions = {
  repository_id?: string | number;
  base_commit_id?: string;
  head_commit_id?: string;
  branch_name?: string;
  pull_request_metadata?: {
    title?: string;
    url?: string;
  };
  self_managed_scanners?: string[];
  fail_on_dependency_scan?: boolean;
  fail_on_sast_scan?: boolean;
  fail_on_iac_scan?: boolean;
  fail_on_secrets_scan?: boolean;
  minimum_severity?: string;
  version: string;
  is_release_gating?: boolean;
};

export type TStartScanResult = {
  scan_id: number;
};

// Start a scan with options (see: startScanSchema)
// and return the data
export async function startScan(
  data: TScanApiOptions
): Promise<TStartScanResult> {
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
// #endregion

// #region Scan polling
export type TPollIsScanningResult = {
  all_scans_completed: boolean;
  dependency_scan_completed: boolean;
  sast_scan_completed: boolean;
  iac_scan_completed: boolean;
  secrets_scan_completed: boolean;
  sbom_scan_completed?: boolean;
};

type TPollScanCompletedOptions = {
  gate_passed: boolean;
};

type TPollScanFeatureBranchCompletedOptions = {
  new_issues_found: number;
  new_dependency_issues_found: number;
  new_sast_issues_found: number;
  new_iac_issues_found: number;
  new_leaked_secret_issues_found: number;
  diff_url: string;
};

type TPollScanDefaultBranchCompletedOptions = {
  open_issues_found: number;
  issue_links: string[];
};

export type TPollScanFeatureBranchCompletedResult = TPollIsScanningResult &
  TPollScanCompletedOptions &
  TPollScanFeatureBranchCompletedOptions;

export type TPollScanCompletedDefaultBranchResult = TPollIsScanningResult &
  TPollScanCompletedOptions &
  TPollScanDefaultBranchCompletedOptions;

export async function pollScanStatus(
  scanId: number
): Promise<
  | TPollIsScanningResult
  | TPollScanFeatureBranchCompletedResult
  | TPollScanCompletedDefaultBranchResult
> {
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
// #endregion

// #region Upload custom result
export enum TUploadPayloadType {
  Checkov = 'checkov',
  JsonSbom = 'json-sbom',
}

export type TUploadApiOptions = {
  scan_id?: number;
  repository_id: string | number;
  container_image_name?: string;
  payload_type: TUploadPayloadType;
  payload: string;
};

export type TUploadResult = {
  success: number;
};

export async function uploadCustomScanResult(
  data: TUploadApiOptions
): Promise<TUploadResult> {
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
