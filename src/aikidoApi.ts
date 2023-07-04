import axios from 'axios';
import { getApiKey } from './configuration.js';
import { TScanApiOptions } from './commands/scan.js';

const getApiHeaders = () => ({ 'X-AIK-API-SECRET': getApiKey() });

type TStartScanResult = {
  scan_id: number;
};

// Start a scan with options (see: startScanSchema)
// and return the data
export async function startScan(
  data: TScanApiOptions
): Promise<TStartScanResult> {
  return (
    await axios(
      `${process.env.AIKIDO_API}/api/integrations/continuous_integration/scan/repository`,
      {
        method: 'POST',
        data,
        headers: getApiHeaders(),
      }
    )
  ).data;
}

type TPollIsScanningResult = {
  all_scans_completed: boolean;
  dependency_scan_completed: boolean;
  sast_scan_completed: boolean;
  iac_scan_completed: boolean;
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
  diff_url: string;
};

type TPollScanDefaultBranchCompletedOptions = {
  open_issues_found: number;
  issue_links: string[];
};

type TPollScanFeatureBranchCompletedResult = TPollIsScanningResult &
  TPollScanCompletedOptions &
  TPollScanFeatureBranchCompletedOptions;

type TPollScanCompletedDefaultBranchResult = TPollIsScanningResult &
  TPollScanCompletedOptions &
  TPollScanDefaultBranchCompletedOptions;

export async function pollScanStatus(
  scanId: number
): Promise<
  | TPollIsScanningResult
  | TPollScanFeatureBranchCompletedResult
  | TPollScanCompletedDefaultBranchResult
> {
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
