import { AnalyticsSDK, AnalyticsEvent, MiddlewareFunction, Plugin } from '../src/analytics-sdk';
import type { Mock } from 'jest-mock';

// Mock localStorage
const localStorageMock = (() => {
    let store: { [key: string]: string } = {};
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => { store[key] = value.toString(); },
        removeItem: (key: string) => { delete store[key]; },
        clear: () => { store = {}; }
    };
})();

// Mock navigator and screen for context testing
const navigatorMock = {
    userAgent: 'Mozilla/5.0 (Test; OS) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36',
    language: 'en-US',
};

const screenMock = {
    width: 1920,
    height: 1080,
    devicePixelRatio: 2,
};

Object.defineProperty(global, 'localStorage', { value: localStorageMock });
Object.defineProperty(global, 'navigator', { value: navigatorMock });
Object.defineProperty(global, 'screen', { value: screenMock });
Object.defineProperty(global, 'window', { value: { devicePixelRatio: 2 } });

describe('AnalyticsSDK Integration Tests', () => {
    let sdk: AnalyticsSDK;
    let consoleLogSpy: jest.SpiedFunction<typeof console.log>;
    let consoleWarnSpy: jest.SpiedFunction<typeof console.warn>;
    let consoleErrorSpy: jest.SpiedFunction<typeof console.error>;

    // Mock Plugin for integration tests
    const mockDestinationPlugin: Plugin = {
        name: 'MockDestination',
        version: '1.0.0',
        type: 'destination',
        track: jest.fn(async (event: AnalyticsEvent) => { /* console.log('MockDestination track:', event.event); */ }),
        page: jest.fn(async (event: AnalyticsEvent) => { /* console.log('MockDestination page:', event.event); */ }),
        identify: jest.fn(async (event: AnalyticsEvent) => { /* console.log('MockDestination identify:', event.userId); */ }),
        group: jest.fn(async (event: AnalyticsEvent) => { /* console.log('MockDestination group:', event.groupId); */ }),
        alias: jest.fn(async (event: AnalyticsEvent) => { /* console.log('MockDestination alias:', event.userId, event.properties?.oldId); */ }),
    };

    beforeEach(() => {
        jest.useFakeTimers();
        localStorageMock.clear();

        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        sdk = new AnalyticsSDK({
            appName: 'integration-test-app',
            batchSize: 2,
            flushInterval: 50, // Faster flush for tests
            debug: true,
            enablePersistence: true,
            initialConsent: true,
            storageKey: 'integration_analytics_sdk_storage'
        });

        // Reset mock functions for plugins
        (mockDestinationPlugin.track as Mock)?.mockClear();
        (mockDestinationPlugin.page as Mock)?.mockClear();
        (mockDestinationPlugin.identify as Mock)?.mockClear();
        (mockDestinationPlugin.group as Mock)?.mockClear();
        (mockDestinationPlugin.alias as Mock)?.mockClear();

        sdk.addPlugin(mockDestinationPlugin);
        
        // Add enrichment via middleware instead
        sdk.use((event, next) => {
            event.properties = { ...event.properties, enriched: true, processedBy: 'MockEnrichment' };
            next(event);
        });
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        sdk.shutdown();
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
        consoleLogSpy.mockRestore();
        consoleWarnSpy.mockRestore();
        consoleErrorSpy.mockRestore();
    });

    it('should process events through middleware and enrichment plugins before sending to destination', async () => {
        const middleware1: MiddlewareFunction = (event, next) => {
            event.properties = { ...event.properties, m1: true };
            next(event);
        };
        sdk.use(middleware1);

        sdk.track('integration_event', { initial: true });
        sdk.track('another_integration_event');

        jest.advanceTimersByTime(sdk['flushInterval']);
        await Promise.resolve(); // Allow promises to resolve

        expect((mockDestinationPlugin.track as Mock)).toHaveBeenCalledTimes(2);

        const firstEvent = ((mockDestinationPlugin.track as Mock).mock.calls[0][0]) as AnalyticsEvent;
        expect(firstEvent.event).toBe('integration_event');
        expect(firstEvent.properties).toEqual(expect.objectContaining({ initial: true, m1: true, enriched: true, processedBy: 'MockEnrichment' }));

        const secondEvent = ((mockDestinationPlugin.track as Mock).mock.calls[1][0]) as AnalyticsEvent;
        expect(secondEvent.event).toBe('another_integration_event');
        expect(secondEvent.properties).toEqual(expect.objectContaining({ m1: true, enriched: true, processedBy: 'MockEnrichment' }));
    });

    it('should persist user and anonymous IDs and reload them correctly after shutdown/reinitialization', async () => {
        const initialAnonymousId = sdk['anonymousId'];
        sdk.identify('persisted_user_id', { plan: 'pro' });
        sdk.track('event_before_shutdown');
        
        jest.advanceTimersByTime(sdk['flushInterval']);
        await Promise.resolve();

        sdk.shutdown();

        // Simulate app restart by creating a new SDK instance with the same storage key
        const newSdk = new AnalyticsSDK({
            appName: 'integration-test-app',
            batchSize: 2,
            flushInterval: 50,
            debug: true,
            enablePersistence: true,
            initialConsent: true,
            storageKey: 'integration_analytics_sdk_storage'
        });

        expect(newSdk['anonymousId']).toBe(initialAnonymousId);
        expect(newSdk['userId']).toBe('persisted_user_id');
        expect(newSdk['userTraits']).toEqual({ plan: 'pro' });

        newSdk.track('event_after_restart');
        newSdk.shutdown(); // Clean up newSdk
    });

    it('should handle consent revocation and re-granting correctly, including clearing persisted data', async () => {
        sdk.identify('user_for_consent_test');
        sdk.track('event_with_consent');
        jest.advanceTimersByTime(sdk['flushInterval']);
        await Promise.resolve();
        expect((mockDestinationPlugin.track as Mock)).toHaveBeenCalledTimes(1);
        (mockDestinationPlugin.track as Mock).mockClear();

        sdk.revokeConsent();
        expect(sdk.isTrackingEnabled()).toBe(false);
        expect(localStorageMock.getItem('integration_analytics_sdk_storage')).toBeNull(); // Persisted data should be cleared

        sdk.track('event_without_consent');
        jest.advanceTimersByTime(sdk['flushInterval']);
        await Promise.resolve();
        expect((mockDestinationPlugin.track as Mock)).not.toHaveBeenCalled(); // No events sent

        sdk.giveConsent();
        expect(sdk.isTrackingEnabled()).toBe(true);
        sdk.track('event_after_regrant');
        jest.advanceTimersByTime(sdk['flushInterval']);
        await Promise.resolve();
        expect((mockDestinationPlugin.track as Mock)).toHaveBeenCalledTimes(1);
        const eventAfterRegrant = ((mockDestinationPlugin.track as Mock).mock.calls[0][0]) as AnalyticsEvent;
        expect(eventAfterRegrant.event).toBe('event_after_regrant');
        expect(eventAfterRegrant.userId).toBeUndefined(); // userId should be cleared after revokeConsent
    });

    it('should correctly merge global properties and event properties, with event properties taking precedence', async () => {
        sdk.setGlobalProperties({ os: 'Linux', appVersion: '1.0.0' });
        sdk.track('test_event_properties', { os: 'Windows', feature: 'new' });
        sdk.track('another_event_properties', { feature: 'old' });

        jest.advanceTimersByTime(sdk['flushInterval']);
        await Promise.resolve();

        expect((mockDestinationPlugin.track as Mock)).toHaveBeenCalledTimes(2);

        const firstEvent = ((mockDestinationPlugin.track as Mock).mock.calls[0][0]) as AnalyticsEvent;
        expect(firstEvent.properties).toEqual(expect.objectContaining({
            os: 'Windows', // Event property takes precedence
            appVersion: '1.0.0',
            feature: 'new',
            enriched: true,
            processedBy: 'MockEnrichment'
        }));

        const secondEvent = ((mockDestinationPlugin.track as Mock).mock.calls[1][0]) as AnalyticsEvent;
        expect(secondEvent.properties).toEqual(expect.objectContaining({
            os: 'Linux', // Global property is used
            appVersion: '1.0.0',
            feature: 'old',
            enriched: true,
            processedBy: 'MockEnrichment'
        }));
    });

    it('should handle multiple plugins of different types correctly', async () => {
        const anotherDestinationPlugin: Plugin = {
            name: 'AnotherDestination',
            version: '1.0.0',
            type: 'destination',
            track: jest.fn(),
        };
        sdk.addPlugin(anotherDestinationPlugin);

        sdk.track('multi_plugin_event');
        jest.advanceTimersByTime(sdk['flushInterval']);
        await Promise.resolve();

        expect((mockDestinationPlugin.track as Mock)).toHaveBeenCalledTimes(1);
        expect((anotherDestinationPlugin.track as Mock)).toHaveBeenCalledTimes(1);

        const destinationEvent1 = ((mockDestinationPlugin.track as Mock).mock.calls[0][0]) as AnalyticsEvent;
        expect(destinationEvent1.properties).toEqual(expect.objectContaining({ enriched: true, processedBy: 'MockEnrichment' }));

        const destinationEvent2 = ((anotherDestinationPlugin.track as Mock).mock.calls[0][0]) as AnalyticsEvent;
        expect(destinationEvent2.properties).toEqual(expect.objectContaining({ enriched: true, processedBy: 'MockEnrichment' }));
    });
});

