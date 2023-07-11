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
    minimum_severity_level?: string;
    version: string;
};
type TStartScanResult = {
    scan_id: number;
};
export declare function startScan(data: TScanApiOptions): Promise<TStartScanResult>;
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
type TPollScanFeatureBranchCompletedResult = TPollIsScanningResult & TPollScanCompletedOptions & TPollScanFeatureBranchCompletedOptions;
type TPollScanCompletedDefaultBranchResult = TPollIsScanningResult & TPollScanCompletedOptions & TPollScanDefaultBranchCompletedOptions;
export declare function pollScanStatus(scanId: number): Promise<TPollIsScanningResult | TPollScanFeatureBranchCompletedResult | TPollScanCompletedDefaultBranchResult>;
export declare enum TUploadPayloadType {
    Checkov = "checkov",
    JsonSbom = "json-sbom"
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
export declare function uploadCustomScanResult(data: TUploadApiOptions): Promise<TUploadResult>;
export {};
