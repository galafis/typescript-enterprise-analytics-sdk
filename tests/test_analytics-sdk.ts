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

describe('AnalyticsSDK', () => {
    let sdk: AnalyticsSDK;
    let consoleLogSpy: jest.SpiedFunction<typeof console.log>;
    let consoleWarnSpy: jest.SpiedFunction<typeof console.warn>;
    let consoleErrorSpy: jest.SpiedFunction<typeof console.error>;

    beforeEach(() => {
        jest.useFakeTimers();
        localStorageMock.clear(); // Clear localStorage before each test

        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        sdk = new AnalyticsSDK({
            appName: 'test-app',
            batchSize: 3,
            flushInterval: 100, // 100ms for faster testing
            debug: true,
            enablePersistence: true,
            initialConsent: true,
            storageKey: 'test_analytics_sdk_storage'
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

    it('should initialize with given options and load/save anonymousId', () => {
        expect(sdk.appName).toBe('test-app');
        expect(sdk.isTrackingEnabled()).toBe(true);
        expect(localStorageMock.getItem('test_analytics_sdk_storage')).not.toBeNull();
        const storedData = JSON.parse(localStorageMock.getItem('test_analytics_sdk_storage') || '{}');
        expect(storedData.anonymousId).toBeDefined();
        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('[AnalyticsSDK Debug] Analytics SDK initialized for app: test-app (v1.0.0)'));
    });

    it('should identify a user and persist data', () => {
        sdk.identify('user123', { email: 'user@example.com', plan: 'premium' });
        expect(sdk['userId']).toBe('user123');
        expect(sdk['userTraits']).toEqual({ email: 'user@example.com', plan: 'premium' });
        const storedData = JSON.parse(localStorageMock.getItem('test_analytics_sdk_storage') || '{}');
        expect(storedData.userId).toBe('user123');
        expect(storedData.userTraits).toEqual({ email: 'user@example.com', plan: 'premium' });
        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('[AnalyticsSDK Debug] User identified: user123'));
    });

    it('should track an event and queue it', () => {
        sdk.track('user_login', { method: 'email' });
        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('[AnalyticsSDK Debug] Event queued: track - user_login. Queue size: 1'));
        expect(sdk['eventQueue'].length).toBe(1);
    });

    it('should flush events when batch size is reached', () => {
        sdk.track('event1');
        sdk.track('event2');
        sdk.track('event3'); // This should trigger a flush
        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('[AnalyticsSDK Debug] Flushing 3 events.'));
        expect(sdk['eventQueue'].length).toBe(0);
    });

    it('should flush events periodically', () => {
        sdk.track('event1');
        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('[AnalyticsSDK Debug] Event queued: track - event1. Queue size: 1'));
        consoleLogSpy.mockClear();
        jest.advanceTimersByTime(sdk['flushInterval']);
        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('[AnalyticsSDK Debug] Flushing 1 events.'));
        expect(sdk['eventQueue'].length).toBe(0);
    });

    it('should capture a page view', () => {
        sdk.page('/dashboard', { userRole: 'admin' });
        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('[AnalyticsSDK Debug] Event queued: page - /dashboard. Queue size: 1'));
    });

    it('should set global properties', () => {
        sdk.setGlobalProperties({ country: 'BR' });
        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('[AnalyticsSDK Debug] Global properties set:'));
        sdk.track('test_event');
        const queuedEvent = sdk['eventQueue'][0];
        expect(queuedEvent.properties).toEqual({ country: 'BR' });
    });

    it('should update context with system info', () => {
        expect(sdk['context'].userAgent).toBe(navigatorMock.userAgent);
        expect(sdk['context'].locale).toBe(navigatorMock.language);
        expect(sdk['context'].screen).toEqual({ width: screenMock.width, height: screenMock.height, density: screenMock.devicePixelRatio });
        sdk.setContext({ customKey: 'customValue' });
        expect(sdk['context'].customKey).toBe('customValue');
    });

    it('should handle middleware correctly', () => {
        const middleware1: MiddlewareFunction = (event, next) => {
            event.properties = { ...event.properties, m1: true };
            next(event);
        };
        const middleware2: MiddlewareFunction = (event, next) => {
            event.properties = { ...event.properties, m2: true };
            next(event);
        };
        sdk.use(middleware1);
        sdk.use(middleware2);

        sdk.track('middleware_test', { initial: true });
        sdk.flushEvents();

        // Since plugins are called after middleware, we can check the event passed to a mock plugin
        const mockPlugin: Plugin = {
            name: 'MockPlugin',
            version: '1.0.0',
            type: 'destination',
            track: jest.fn(),
        };
        sdk.addPlugin(mockPlugin);
        sdk.track('middleware_test_2', { initial: true });
        sdk.flushEvents();

        const processedEvent = (mockPlugin.track as Mock).mock.calls[0][0] as AnalyticsEvent;
        expect(processedEvent.properties).toEqual(expect.objectContaining({ initial: true, m1: true, m2: true }));
    });

    it('should call appropriate plugin methods for different event types', () => {
        const mockPlugin: Plugin = {
            name: 'MockPlugin',
            version: '1.0.0',
            type: 'destination',
            track: jest.fn(),
            page: jest.fn(),
            identify: jest.fn(),
            group: jest.fn(),
            alias: jest.fn(),
        };
        sdk.addPlugin(mockPlugin);

        sdk.track('test_track');
        sdk.page('test_page');
        sdk.identify('test_user');
        sdk.group('test_group');
        sdk.alias('new_id', 'old_id');
        sdk.flushEvents();

        expect(mockPlugin.track).toHaveBeenCalledTimes(1);
        expect(mockPlugin.page).toHaveBeenCalledTimes(1);
        expect(mockPlugin.identify).toHaveBeenCalledTimes(1);
        expect(mockPlugin.group).toHaveBeenCalledTimes(1);
        expect(mockPlugin.alias).toHaveBeenCalledTimes(1);
    });

    it('should manage consent correctly', () => {
        sdk.revokeConsent();
        expect(sdk.isTrackingEnabled()).toBe(false);
        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('[AnalyticsSDK Debug] Consent revoked. Tracking disabled and persistent data cleared.'));
        sdk.track('event_no_consent');
        expect(sdk['eventQueue'].length).toBe(0);
        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('[AnalyticsSDK Debug] Event not queued due to missing consent:'));

        sdk.giveConsent();
        expect(sdk.isTrackingEnabled()).toBe(true);
        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('[AnalyticsSDK Debug] Consent given. Tracking enabled.'));
        sdk.track('event_with_consent');
        expect(sdk['eventQueue'].length).toBe(1);
    });

    it('should disable and enable tracking', () => {
        sdk.disableTracking();
        expect(sdk.isTrackingEnabled()).toBe(false);
        sdk.track('disabled_event');
        expect(sdk['eventQueue'].length).toBe(0);

        sdk.enableTracking();
        expect(sdk.isTrackingEnabled()).toBe(true);
        sdk.track('enabled_event');
        expect(sdk['eventQueue'].length).toBe(1);
    });

    it('should alias a user and update userId', () => {
        const initialAnonymousId = sdk['anonymousId'];
        sdk.identify('old_user_id');
        sdk.alias('new_user_id');
        expect(sdk['userId']).toBe('new_user_id');
        const storedData = JSON.parse(localStorageMock.getItem('test_analytics_sdk_storage') || '{}');
        expect(storedData.userId).toBe('new_user_id');
        // Check that the alias event was queued with correct oldId
        sdk.flushEvents();
        const aliasEvent = sdk['eventQueue'].find(e => e.type === 'alias');
        // This part is tricky because flushEvents clears the queue. We need to capture it before flush.
        // Let's re-test this by checking the plugin call.

        const mockPlugin: Plugin = {
            name: 'AliasPlugin',
            version: '1.0.0',
            type: 'destination',
            alias: jest.fn(),
        };
        sdk.addPlugin(mockPlugin);
        sdk.identify('user_for_alias_test');
        sdk.alias('final_user_id', 'user_for_alias_test');
        sdk.flushEvents();
        expect(mockPlugin.alias).toHaveBeenCalledWith(expect.objectContaining({
            userId: 'final_user_id',
            properties: { oldId: 'user_for_alias_test' }
        }));
    });

    it('should shutdown correctly, flushing remaining events and stopping timer', () => {
        sdk.track('event_before_shutdown');
        expect(sdk['eventQueue'].length).toBe(1);
        sdk.shutdown();
        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('[AnalyticsSDK Debug] Shutting down Analytics SDK: Flushing remaining events and stopping timer...'));
        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('[AnalyticsSDK Debug] Flushing 1 events.'));
        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('[AnalyticsSDK Debug] Analytics SDK shutdown complete.'));
        expect(sdk['eventQueue'].length).toBe(0);
        expect(sdk['flushTimer']).toBeNull();
    });
});

