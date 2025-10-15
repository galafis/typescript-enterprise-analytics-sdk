"use strict";
/**
 * TypeScript Enterprise Analytics SDK
 * Author: Gabriel Demetrios Lafis
 * Year: 2025
 *
 * Este SDK de Analytics empresarial oferece funcionalidades avançadas para rastreamento
 * de eventos, gerenciamento de contexto do usuário, suporte a middleware e uma arquitetura
 * de plugins para extensibilidade. Inclui persistência de dados e gerenciamento de consentimento.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsSDK = exports.ConsentStatus = void 0;
const uuid_1 = require("uuid");
// --- Interfaces e Tipos --- //
var ConsentStatus;
(function (ConsentStatus) {
    ConsentStatus["GRANTED"] = "granted";
    ConsentStatus["DENIED"] = "denied";
    ConsentStatus["UNKNOWN"] = "unknown";
})(ConsentStatus || (exports.ConsentStatus = ConsentStatus = {}));
// --- Classe Principal do SDK --- //
class AnalyticsSDK {
    constructor(options) {
        this.trackingEnabled = true;
        this.eventQueue = [];
        this.userId = null;
        this.anonymousId = '';
        this.globalProperties = {};
        this.userTraits = {};
        this.groupTraits = {};
        this.context = {};
        this.middleware = [];
        this.plugins = [];
        this.consentPreferences = {};
        this.appName = options.appName;
        this.appVersion = options.version || '1.0.0';
        this.batchSize = options.batchSize || 10;
        this.flushInterval = options.flushInterval || 5000;
        this.debug = options.debug || false;
        this.enablePersistence = options.enablePersistence !== undefined ? options.enablePersistence : true;
        this.consentGiven = options.initialConsent !== undefined ? options.initialConsent : true;
        this.storageKey = options.storageKey || `analytics_sdk_${this.appName.toLowerCase().replace(/\s/g, '_')}`;
        this.loadPersistentData();
        if (!this.anonymousId) {
            this.anonymousId = (0, uuid_1.v4)();
        }
        this.savePersistentData();
        this.updateContext();
        this.startFlushTimer();
        this.logDebug(`Analytics SDK initialized for app: ${this.appName} (v${this.appVersion})`);
    }
    // --- Gerenciamento de Persistência --- //
    loadPersistentData() {
        if (!this.enablePersistence || typeof localStorage === 'undefined')
            return;
        try {
            const storedData = localStorage.getItem(this.storageKey);
            if (storedData) {
                const { userId, anonymousId, userTraits } = JSON.parse(storedData);
                this.userId = userId;
                this.anonymousId = anonymousId;
                this.userTraits = userTraits || {};
                this.logDebug('Persistent data loaded.');
            }
        }
        catch (error) {
            this.logDebug('AnalyticsSDK: Failed to load persistent data from localStorage', error);
        }
    }
    savePersistentData() {
        if (!this.enablePersistence || typeof localStorage === 'undefined')
            return;
        try {
            const dataToStore = {
                userId: this.userId,
                anonymousId: this.anonymousId,
                userTraits: this.userTraits,
            };
            localStorage.setItem(this.storageKey, JSON.stringify(dataToStore));
            this.logDebug('Persistent data saved.');
        }
        catch (error) {
            this.logDebug('AnalyticsSDK: Failed to save persistent data to localStorage', error);
        }
    }
    clearPersistentData() {
        if (typeof localStorage === 'undefined')
            return;
        try {
            localStorage.removeItem(this.storageKey);
            this.logDebug('Persistent data cleared.');
        }
        catch (error) {
            this.logDebug("AnalyticsSDK: Failed to clear persistent data from localStorage", error);
        }
    }
    // --- Gerenciamento de Contexto --- //
    updateContext() {
        this.context = Object.assign(Object.assign(Object.assign(Object.assign({}, this.context), { appName: this.appName, appVersion: this.appVersion }), (typeof navigator !== 'undefined' && {
            userAgent: navigator.userAgent,
            locale: navigator.language,
        })), (typeof screen !== 'undefined' && {
            screen: { width: screen.width, height: screen.height, density: window.devicePixelRatio || 1 },
        }));
    }
    setContext(newContext) {
        this.context = Object.assign(Object.assign({}, this.context), newContext);
        this.logDebug('Context updated:', this.context);
    }
    // --- Gerenciamento de Eventos (Batching & Flushing) --- //
    startFlushTimer() {
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
        }
        this.flushTimer = setInterval(() => this.flushEvents(), this.flushInterval);
    }
    stopFlushTimer() {
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
            this.flushTimer = null;
        }
    }
    enqueueEvent(event) {
        if (!this.consentGiven) {
            this.logDebug('Event not queued due to missing consent:', event);
            return;
        }
        this.eventQueue.push(event);
        this.logDebug(`Event queued: ${event.type} - ${event.event || event.name || event.userId}. Queue size: ${this.eventQueue.length}`);
        if (this.eventQueue.length >= this.batchSize) {
            this.flushEvents();
        }
    }
    flushEvents() {
        if (this.eventQueue.length === 0) {
            return;
        }
        const eventsToSend = [...this.eventQueue];
        this.eventQueue = [];
        this.logDebug(`Flushing ${eventsToSend.length} events.`);
        // Processar eventos através do middleware
        this.processWithMiddleware(eventsToSend, (processedEvents) => {
            processedEvents.forEach(event => {
                this.sendEventToPlugins(event);
            });
            // Em um cenário real, aqui haveria o envio para um backend de analytics
            // Ex: fetch("/api/analytics", { method: "POST", body: JSON.stringify(processedEvents) });
            // this.logDebug(`Successfully flushed ${processedEvents.length} events.`);
        });
    }
    processWithMiddleware(events, callback) {
        if (this.middleware.length === 0) {
            callback(events);
            return;
        }
        const processedEvents = [];
        let currentIndex = 0;
        const next = (event) => {
            if (currentIndex < this.middleware.length) {
                const currentMiddleware = this.middleware[currentIndex];
                currentIndex++;
                currentMiddleware(event, next);
            }
            else {
                processedEvents.push(event);
            }
        };
        events.forEach(event => {
            currentIndex = 0; // Reset index for each event
            next(event);
        });
        callback(processedEvents);
    }
    sendEventToPlugins(event) {
        this.plugins.forEach(plugin => {
            try {
                switch (event.type) {
                    case 'track':
                        plugin.track && plugin.track(event);
                        break;
                    case 'page':
                        plugin.page && plugin.page(event);
                        break;
                    case 'identify':
                        plugin.identify && plugin.identify(event);
                        break;
                    case 'group':
                        plugin.group && plugin.group(event);
                        break;
                    case 'alias':
                        plugin.alias && plugin.alias(event);
                        break;
                }
            }
            catch (error) {
                this.logDebug(`AnalyticsSDK: Plugin ${plugin.name} failed to process event type ${event.type}:`, error);
            }
        });
    }
    // --- Métodos de Rastreamento de Eventos --- //
    createBaseEvent(type, integrations) {
        return {
            type,
            userId: this.userId || undefined,
            anonymousId: this.anonymousId,
            context: Object.assign(Object.assign({}, this.context), { traits: this.userTraits }), // Incluir userTraits no contexto
            timestamp: new Date().toISOString(),
            messageId: (0, uuid_1.v4)(),
            integrations: integrations || {},
        };
    }
    track(event, properties, integrations) {
        if (!this.trackingEnabled)
            return;
        const mergedProperties = Object.assign(Object.assign({}, this.globalProperties), properties);
        const analyticsEvent = Object.assign(Object.assign({}, this.createBaseEvent('track', integrations)), { event, properties: mergedProperties, payload: mergedProperties });
        this.enqueueEvent(analyticsEvent);
    }
    page(name, properties, integrations) {
        if (!this.trackingEnabled)
            return;
        const mergedProperties = Object.assign(Object.assign({}, this.globalProperties), properties);
        const analyticsEvent = Object.assign(Object.assign({}, this.createBaseEvent('page', integrations)), { name, properties: mergedProperties, payload: mergedProperties });
        this.enqueueEvent(analyticsEvent);
    }
    identify(userId, traits, integrations) {
        if (!this.trackingEnabled)
            return;
        this.userId = userId;
        this.userTraits = Object.assign(Object.assign({}, this.userTraits), traits);
        this.savePersistentData(); // Persistir userId e userTraits
        const analyticsEvent = Object.assign(Object.assign({}, this.createBaseEvent('identify', integrations)), { userId, traits: this.userTraits });
        this.enqueueEvent(analyticsEvent);
        this.logDebug('User identified:', userId, this.userTraits);
    }
    group(groupId, traits, integrations) {
        if (!this.trackingEnabled)
            return;
        this.groupTraits = Object.assign(Object.assign({}, this.groupTraits), traits);
        const analyticsEvent = Object.assign(Object.assign({}, this.createBaseEvent('group', integrations)), { userId: this.userId || undefined, properties: { groupId }, traits: this.groupTraits });
        this.enqueueEvent(analyticsEvent);
        this.logDebug('Group identified:', groupId, this.groupTraits);
    }
    alias(newId, oldId, integrations) {
        if (!this.trackingEnabled)
            return;
        const analyticsEvent = Object.assign(Object.assign({}, this.createBaseEvent('alias', integrations)), { userId: newId, properties: { oldId: oldId || this.userId || this.anonymousId } });
        this.userId = newId; // Atualiza o userId para o novo ID
        this.savePersistentData();
        this.enqueueEvent(analyticsEvent);
        this.logDebug('User aliased:', newId, oldId);
    }
    // --- Gerenciamento de Propriedades Globais --- //
    setGlobalProperties(properties) {
        this.globalProperties = Object.assign(Object.assign({}, this.globalProperties), properties);
        this.logDebug('Global properties set:', this.globalProperties);
    }
    getGlobalProperties() {
        return Object.assign({}, this.globalProperties);
    }
    // --- Métodos Adicionais de Conveniência --- //
    /**
     * Alias para track() - mantém compatibilidade com README
     */
    captureEvent(event, properties, integrations) {
        this.track(event, properties, integrations);
    }
    /**
     * Alias para page() - mantém compatibilidade com README
     */
    capturePageView(name, properties, integrations) {
        this.page(name, properties, integrations);
    }
    /**
     * Alias para identify() - mantém compatibilidade com README
     */
    identifyUser(userId, traits, integrations) {
        this.identify(userId, traits, integrations);
    }
    /**
     * Rastreia erros como eventos
     */
    trackError(error, properties, integrations) {
        this.track('error', Object.assign({ message: error.message, stack: error.stack, name: error.name }, properties), integrations);
    }
    /**
     * Rastreia métricas de performance
     */
    trackPerformance(metricName, value, properties, integrations) {
        this.track('performance_metric', Object.assign({ metricName,
            value }, properties), integrations);
    }
    /**
     * Retorna informações do usuário atual
     */
    getCurrentUser() {
        return {
            userId: this.userId,
            anonymousId: this.anonymousId,
            traits: Object.assign({}, this.userTraits)
        };
    }
    // --- Gerenciamento de Middleware --- //
    use(middleware) {
        this.middleware.push(middleware);
        this.logDebug('Middleware added.');
    }
    // --- Gerenciamento de Plugins --- //
    addPlugin(plugin) {
        this.plugins.push(plugin);
        if (plugin.load) {
            try {
                plugin.load(this);
                this.logDebug(`Plugin ${plugin.name} loaded.`);
            }
            catch (error) {
                this.logDebug(`AnalyticsSDK: Failed to load plugin ${plugin.name}:`, error);
            }
        }
        this.logDebug(`Plugin ${plugin.name} added.`);
    }
    // --- Gerenciamento de Consentimento --- //
    giveConsent() {
        this.consentGiven = true;
        this.enableTracking();
        this.logDebug('Consent given. Tracking enabled.');
    }
    revokeConsent() {
        this.consentGiven = false;
        this.disableTracking();
        this.clearPersistentData(); // Opcional: limpar dados persistentes ao revogar consentimento
        this.logDebug('Consent revoked. Tracking disabled and persistent data cleared.');
    }
    hasConsent() {
        return this.consentGiven;
    }
    /**
     * Atualiza preferências de consentimento granular
     */
    updateConsent(preferences) {
        this.consentPreferences = Object.assign(Object.assign({}, this.consentPreferences), preferences);
        // Se pelo menos uma categoria está granted, damos consentimento geral
        const hasAnyGranted = Object.values(this.consentPreferences).some(status => status === ConsentStatus.GRANTED);
        if (hasAnyGranted && !this.consentGiven) {
            this.giveConsent();
        }
        else if (!hasAnyGranted && this.consentGiven) {
            this.revokeConsent();
        }
        this.logDebug('Consent preferences updated:', this.consentPreferences);
    }
    /**
     * Retorna o status de consentimento atual
     */
    getConsentStatus() {
        return Object.assign({}, this.consentPreferences);
    }
    // --- Controle de Rastreamento --- //
    disableTracking() {
        this.trackingEnabled = false;
        this.stopFlushTimer();
        this.logDebug('Tracking disabled.');
    }
    enableTracking() {
        if (!this.consentGiven) {
            this.logDebug('Cannot enable tracking: consent not given.');
            return;
        }
        this.trackingEnabled = true;
        this.startFlushTimer();
        this.logDebug('Tracking enabled.');
    }
    isTrackingEnabled() {
        return this.trackingEnabled && this.consentGiven;
    }
    // --- Utilitários --- //
    logDebug(...args) {
        if (this.debug) {
            const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
            console.log(`[AnalyticsSDK Debug] ${message}`);
        }
    }
    shutdown() {
        this.logDebug("\nShutting down Analytics SDK: Flushing remaining events and stopping timer...");
        this.flushEvents();
        this.stopFlushTimer();
        this.logDebug("Analytics SDK shutdown complete.");
    }
}
exports.AnalyticsSDK = AnalyticsSDK;
// --- Exemplo de Uso (para demonstração) ---
// Para executar este exemplo, você precisará de um ambiente Node.js e instalar 'uuid':
// npm install uuid
// ts-node analytics-sdk.ts
