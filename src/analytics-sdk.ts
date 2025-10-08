
/**
 * TypeScript Enterprise Analytics SDK
 * Author: Gabriel Demetrios Lafis
 * Year: 2025
 */

interface EventProperties extends Record<string, any> {}

class AnalyticsSDK {
    public appName: string;
    private globalProperties: EventProperties = {};
    private trackingEnabled: boolean = true;

    constructor(appName: string) {
        this.appName = appName;
        console.log(`Analytics SDK initialized for app: ${this.appName}`);
    }

    private log(type: string, name: string, properties?: EventProperties) {
        if (this.trackingEnabled) {
            const allProperties = { ...this.globalProperties, ...properties };
            console.log(`${type}:`, name, allProperties);
            // Em um cenário real, aqui haveria o envio para um backend de analytics
        }
    }

    public captureEvent(eventName: string, properties?: EventProperties): void {
        this.validateProperties(properties);
        this.log("Event", eventName, properties);
    }

    public capturePageView(pagePath: string, properties?: EventProperties): void {
        this.validateProperties(properties);
        this.log("Page View", pagePath, properties);
    }

    public identifyUser(userId: string, traits?: EventProperties): void {
        console.log("User Identified:", userId, traits);
        // Em um cenário real, aqui haveria o envio para um sistema de CRM/CDP
    }

    public setGlobalProperties(properties: EventProperties): void {
        this.globalProperties = { ...this.globalProperties, ...properties };
        console.log("Global properties set:", this.globalProperties);
    }

    public trackPerformance(metricName: string, value: number, properties?: EventProperties): void {
        this.log("Performance Metric", metricName, { value, ...properties });
    }

    public disableTracking(): void {
        this.trackingEnabled = false;
        console.log("Tracking disabled.");
    }

    public enableTracking(): void {
        this.trackingEnabled = true;
        console.log("Tracking enabled.");
    }

    private validateProperties(properties?: EventProperties): void {
        if (properties) {
            for (const key in properties) {
                if (properties.hasOwnProperty(key)) {
                    const value = properties[key];
                    if (value === null || typeof value === 'undefined') {
                        console.warn(`Warning: Event property ${key} has a null or undefined value.`);
                    }
                }
            }
        }
    }
}

// Exemplo de uso (para demonstração, não para ser executado em produção)
if (require.main === module) {
    const sdk = new AnalyticsSDK("MyEnterpriseApp");

    sdk.setGlobalProperties({ environment: "development", version: "1.0.0" });

    sdk.identifyUser("user123", { email: "user@example.com", plan: "premium" });

    sdk.captureEvent("product_viewed", { productId: "P123", category: "Electronics" });
    sdk.capturePageView("/products/P123", { referrer: "homepage" });

    sdk.trackPerformance("page_load_time", 1500);

    sdk.disableTracking();
    sdk.captureEvent("should_not_be_tracked");
    sdk.enableTracking();
    sdk.captureEvent("should_be_tracked_again");
}

export { AnalyticsSDK };

