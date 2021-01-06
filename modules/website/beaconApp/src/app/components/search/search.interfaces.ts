export interface Beacon {
  beaconId: string;
  alleleRequest: any;
  apiVersion: any;
  s3Response: any;
  exists: any;
  datasetAlleleResponses: any;
  error: any;
}
export interface Dataset{
  datasetId: string;
  callCount: number;
  error: any;
  exists: any;
  frequency: number;
  note: any;
  sampleCount: number;
  variantCount: number;
  findIndex: any;
  info: {
    datasetSampleCount: number;
    dateCounts: string[];
    description: string;
    locationCounts: string[];
    locationDateCounts:{};
    name: string;
    sampleDetails: string[];
    sampleFields: string[];
    totalEntries: number;
    variants: string[];
  }

}
