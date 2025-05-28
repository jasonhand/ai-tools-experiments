// TypeScript declaration file for Datadog RUM
interface Window {
  DD_RUM?: {
    init: (config: {
      clientToken: string;
      applicationId: string;
      site: string;
      service: string;
      sessionReplaySampleRate: number;
      defaultPrivacyLevel: string;
    }) => void;
  };
}
