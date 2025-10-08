"use strict";
/**
 * TypeScript Enterprise Analytics SDK
 * Author: Gabriel Demetrios Lafis
 * Year: 2025
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsSDK = void 0;
class AnalyticsSDK {
    constructor(appName) {
        this.globalProperties = {};
        this.trackingEnabled = true;
        this.appName = appName;
        console.log(`Analytics SDK initialized for app: ${this.appName}`);
    }
    log(type, name, properties) {
        if (this.trackingEnabled) {
            const allProperties = Object.assign(Object.assign({}, this.globalProperties), properties);
            console.log(`${type} Captured:`, name, allProperties);
            // Em um cenário real, aqui haveria o envio para um backend de analytics
        }
    }
    captureEvent(eventName, properties) {
        this.validateProperties(properties);
        this.log("Event", eventName, properties);
    }
    capturePageView(pagePath, properties) {
        this.validateProperties(properties);
        this.log("Page View", pagePath, properties);
    }
    identifyUser(userId, traits) {
        console.log("User Identified:", userId, traits);
        // Em um cenário real, aqui haveria o envio para um sistema de CRM/CDP
    }
    setGlobalProperties(properties) {
        this.globalProperties = Object.assign(Object.assign({}, this.globalProperties), properties);
        console.log("Global properties set:", this.globalProperties);
    }
    trackPerformance(metricName, value, properties) {
        this.log("Performance Metric", metricName, Object.assign({ value }, properties));
    }
    disableTracking() {
        this.trackingEnabled = false;
        console.log("Tracking disabled.");
    }
    enableTracking() {
        this.trackingEnabled = true;
        console.log("Tracking enabled.");
    }
    validateProperties(properties) {
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
exports.AnalyticsSDK = AnalyticsSDK;
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
