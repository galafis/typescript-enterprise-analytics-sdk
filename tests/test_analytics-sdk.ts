
import { AnalyticsSDK } from '../src/analytics-sdk';
import { jest } from '@jest/globals';

describe('AnalyticsSDK', () => {
    let sdk: AnalyticsSDK;
    let consoleLogSpy: any;
    let consoleWarnSpy: any;

    beforeEach(() => {
        sdk = new AnalyticsSDK('test-app');
        // Mock console.log and console.warn to prevent test output pollution
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        // Restore original console methods after each test
        consoleLogSpy.mockRestore();
        consoleWarnSpy.mockRestore();
    });

    it('should initialize with a given appName', () => {
        // Re-initialize SDK to capture the constructor log
        sdk = new AnalyticsSDK('test-app');
        expect(sdk.appName).toBe('test-app');
        expect(consoleLogSpy).toHaveBeenCalledWith('Analytics SDK initialized for app: test-app');
    });

    it('should capture an event', () => {
        sdk.captureEvent('user_login', { userId: '123', method: 'email' });
          expect(consoleLogSpy).toHaveBeenCalledWith("Event:", "user_login", { userId: "123", method: "email" });   });

    it('should capture a page view', () => {
        sdk.capturePageView('/dashboard', { userRole: 'admin' });
               expect(consoleLogSpy).toHaveBeenCalledWith("Page View:", "/dashboard", { userRole: "admin" });});

    it('should identify a user', () => {
        sdk.identifyUser('user456', { email: 'user@example.com', plan: 'premium' });
        expect(consoleLogSpy).toHaveBeenCalledWith('User Identified:', 'user456', { email: 'user@example.com', plan: 'premium' });
    });

    it('should set global properties', () => {
        sdk.setGlobalProperties({ country: 'BR' });
        expect(consoleLogSpy).toHaveBeenCalledWith('Global properties set:', { country: 'BR' });
        // Clear mock to only check the captureEvent call
        consoleLogSpy.mockClear();
        sdk.captureEvent('test_event');
             expect(consoleLogSpy).toHaveBeenCalledWith("Event:", "test_event", { country: "BR" });  });

    it('should track performance metrics', () => {
        sdk.trackPerformance('load_time', 1500);
                expect(consoleLogSpy).toHaveBeenCalledWith("Performance Metric:", "load_time", { value: 1500 }); });

    it('should validate event properties', () => {
        sdk.captureEvent('invalid_event', { invalid_prop: null });
        expect(consoleWarnSpy).toHaveBeenCalledWith('Warning: Event property invalid_prop has a null or undefined value.');
    });

    it('should not capture event if disabled', () => {
        sdk.disableTracking();
        expect(consoleLogSpy).toHaveBeenCalledWith('Tracking disabled.');
        // Clear mock to ensure no further calls after disabling
        consoleLogSpy.mockClear();
        sdk.captureEvent('disabled_event');
        expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it('should re-enable tracking', () => {
        sdk.disableTracking();
        sdk.enableTracking();
        expect(consoleLogSpy).toHaveBeenCalledWith('Tracking enabled.');
        // Clear mock to ensure only the final captureEvent call is checked
        consoleLogSpy.mockClear();
        sdk.captureEvent('enabled_event');
              expect(consoleLogSpy).toHaveBeenCalledWith("Event:", "enabled_event", {});   });
});

