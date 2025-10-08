/**
 * TypeScript Enterprise Analytics SDK
 * Author: Gabriel Demetrios Lafis
 * Year: 2025
 *
 * Este SDK de Analytics empresarial oferece funcionalidades avançadas para rastreamento
 * de eventos, gerenciamento de contexto do usuário, suporte a middleware e uma arquitetura
 * de plugins para extensibilidade. Inclui persistência de dados e gerenciamento de consentimento.
 */

import { v4 as uuidv4 } from 'uuid';

// --- Interfaces e Tipos --- //

interface EventProperties extends Record<string, any> {}
interface UserTraits extends EventProperties {}
interface GroupTraits extends EventProperties {}
interface Context extends EventProperties {
    userAgent?: string;
    locale?: string;
    timezone?: string;
    ip?: string;
    screen?: { width: number; height: number; density: number };
    [key: string]: any;
}

interface AnalyticsEvent {
    type: 'track' | 'page' | 'identify' | 'group' | 'alias';
    event?: string; // Para type: 'track'
    name?: string;  // Para type: 'page'
    userId?: string;
    anonymousId: string;
    properties?: EventProperties;
    traits?: UserTraits | GroupTraits;
    context: Context;
    timestamp: string;
    messageId: string;
    integrations?: Record<string, boolean>;
}

type MiddlewareFunction = (event: AnalyticsEvent, next: (event: AnalyticsEvent) => void) => void;

interface Plugin {
    name: string;
    version: string;
    type: 'destination' | 'enrichment' | 'utility';
    load?: (sdk: AnalyticsSDK) => void;
    track?: (event: AnalyticsEvent) => void;
    page?: (event: AnalyticsEvent) => void;
    identify?: (event: AnalyticsEvent) => void;
    group?: (event: AnalyticsEvent) => void;
    alias?: (event: AnalyticsEvent) => void;
}

// --- Configurações do SDK --- //
interface AnalyticsSDKOptions {
    appName: string;
    version?: string;
    batchSize?: number;
    flushInterval?: number; // em milissegundos
    debug?: boolean;
    enablePersistence?: boolean;
    initialConsent?: boolean;
    storageKey?: string;
}

// --- Classe Principal do SDK --- //
class AnalyticsSDK {
    public appName: string;
    private appVersion: string;
    private debug: boolean;
    private trackingEnabled: boolean = true;
    private enablePersistence: boolean;
    private storageKey: string;

    private eventQueue: AnalyticsEvent[] = [];
    private batchSize: number;
    private flushInterval: number;
    private flushTimer: any;

    private userId: string | null = null;
    private anonymousId: string = uuidv4();
    private globalProperties: EventProperties = {};
    private userTraits: UserTraits = {};
    private groupTraits: GroupTraits = {};
    private context: Context = {};

    private middleware: MiddlewareFunction[] = [];
    private plugins: Plugin[] = [];

    private consentGiven: boolean;

    constructor(options: AnalyticsSDKOptions) {
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
            this.anonymousId = uuidv4();
            this.savePersistentData();
        }

        this.updateContext();
        this.startFlushTimer();
        this.logDebug(`Analytics SDK initialized for app: ${this.appName} (v${this.appVersion})`);
    }

    // --- Gerenciamento de Persistência --- //
    private loadPersistentData(): void {
        if (!this.enablePersistence || typeof localStorage === 'undefined') return;
        try {
            const storedData = localStorage.getItem(this.storageKey);
            if (storedData) {
                const { userId, anonymousId, userTraits } = JSON.parse(storedData);
                this.userId = userId;
                this.anonymousId = anonymousId;
                this.userTraits = userTraits || {};
                this.logDebug('Persistent data loaded.');
            }
        } catch (error) {
            this.logDebug('AnalyticsSDK: Failed to load persistent data from localStorage', error);
        }
    }

    private savePersistentData(): void {
        if (!this.enablePersistence || typeof localStorage === 'undefined') return;
        try {
            const dataToStore = {
                userId: this.userId,
                anonymousId: this.anonymousId,
                userTraits: this.userTraits,
            };
            localStorage.setItem(this.storageKey, JSON.stringify(dataToStore));
            this.logDebug('Persistent data saved.');
        } catch (error) {
            this.logDebug('AnalyticsSDK: Failed to save persistent data to localStorage', error);
        }
    }

    private clearPersistentData(): void {
        if (typeof localStorage === 'undefined') return;
        try {
            localStorage.removeItem(this.storageKey);
            this.logDebug('Persistent data cleared.');
        } catch (error) {
            this.logDebug("AnalyticsSDK: Failed to clear persistent data from localStorage", error);
        }
    }

    // --- Gerenciamento de Contexto --- //
    private updateContext(): void {
        this.context = {
            ...this.context,
            appName: this.appName,
            appVersion: this.appVersion,
            // Adicionar informações do navegador/dispositivo se disponível
            ...(typeof navigator !== 'undefined' && {
                userAgent: navigator.userAgent,
                locale: navigator.language,
            }),
            ...(typeof screen !== 'undefined' && {
                screen: { width: screen.width, height: screen.height, density: window.devicePixelRatio || 1 },
            }),
            // Outras informações de contexto podem ser adicionadas aqui
            // Ex: ip (geralmente coletado no backend), timezone, etc.
        };
    }

    public setContext(newContext: Partial<Context>): void {
        this.context = { ...this.context, ...newContext };
        this.logDebug('Context updated:', this.context);
    }

    // --- Gerenciamento de Eventos (Batching & Flushing) --- //
    private startFlushTimer(): void {
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
        }
        this.flushTimer = setInterval(() => this.flushEvents(), this.flushInterval);
    }

    private stopFlushTimer(): void {
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
            this.flushTimer = null;
        }
    }

    private enqueueEvent(event: AnalyticsEvent): void {
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

    private flushEvents(): void {
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

    private processWithMiddleware(events: AnalyticsEvent[], callback: (events: AnalyticsEvent[]) => void): void {
        if (this.middleware.length === 0) {
            callback(events);
            return;
        }

        const processedEvents: AnalyticsEvent[] = [];
        let currentIndex = 0;

        const next = (event: AnalyticsEvent) => {
            if (currentIndex < this.middleware.length) {
                const currentMiddleware = this.middleware[currentIndex];
                currentIndex++;
                currentMiddleware(event, next);
            } else {
                processedEvents.push(event);
            }
        };

        events.forEach(event => {
            currentIndex = 0; // Reset index for each event
            next(event);
        });
        callback(processedEvents);
    }

    private sendEventToPlugins(event: AnalyticsEvent): void {
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
            } catch (error) {
                this.logDebug(`AnalyticsSDK: Plugin ${plugin.name} failed to process event type ${event.type}:`, error);
            }
        });
    }

    // --- Métodos de Rastreamento de Eventos --- //

    private createBaseEvent(type: AnalyticsEvent['type'], integrations?: Record<string, boolean>): AnalyticsEvent {
        return {
            type,
            userId: this.userId || undefined,
            anonymousId: this.anonymousId,
            context: { ...this.context, traits: this.userTraits }, // Incluir userTraits no contexto
            timestamp: new Date().toISOString(),
            messageId: uuidv4(),
            integrations: integrations || {},
        };
    }

    public track(event: string, properties?: EventProperties, integrations?: Record<string, boolean>): void {
        if (!this.trackingEnabled) return;
        const analyticsEvent = { ...this.createBaseEvent('track', integrations), event, properties };
        this.enqueueEvent(analyticsEvent);
    }

    public page(name?: string, properties?: EventProperties, integrations?: Record<string, boolean>): void {
        if (!this.trackingEnabled) return;
        const analyticsEvent = { ...this.createBaseEvent('page', integrations), name, properties };
        this.enqueueEvent(analyticsEvent);
    }

    public identify(userId: string, traits?: UserTraits, integrations?: Record<string, boolean>): void {
        if (!this.trackingEnabled) return;
        this.userId = userId;
        this.userTraits = { ...this.userTraits, ...traits };
        this.savePersistentData(); // Persistir userId e userTraits
        const analyticsEvent = { ...this.createBaseEvent('identify', integrations), userId, traits: this.userTraits };
        this.enqueueEvent(analyticsEvent);
        this.logDebug('User identified:', userId, this.userTraits);
    }

    public group(groupId: string, traits?: GroupTraits, integrations?: Record<string, boolean>): void {
        if (!this.trackingEnabled) return;
        this.groupTraits = { ...this.groupTraits, ...traits };
        const analyticsEvent = { ...this.createBaseEvent('group', integrations), userId: this.userId || undefined, properties: { groupId }, traits: this.groupTraits };
        this.enqueueEvent(analyticsEvent);
        this.logDebug('Group identified:', groupId, this.groupTraits);
    }

    public alias(newId: string, oldId?: string, integrations?: Record<string, boolean>): void {
        if (!this.trackingEnabled) return;
        const analyticsEvent = { ...this.createBaseEvent('alias', integrations), userId: newId, properties: { oldId: oldId || this.userId || this.anonymousId } };
        this.userId = newId; // Atualiza o userId para o novo ID
        this.savePersistentData();
        this.enqueueEvent(analyticsEvent);
        this.logDebug('User aliased:', newId, oldId);
    }

    // --- Gerenciamento de Propriedades Globais --- //
    public setGlobalProperties(properties: EventProperties): void {
        this.globalProperties = { ...this.globalProperties, ...properties };
        this.logDebug('Global properties set:', this.globalProperties);
    }

    // --- Gerenciamento de Middleware --- //
    public use(middleware: MiddlewareFunction): void {
        this.middleware.push(middleware);
        this.logDebug('Middleware added.');
    }

    // --- Gerenciamento de Plugins --- //
    public addPlugin(plugin: Plugin): void {
        this.plugins.push(plugin);
        if (plugin.load) {
            try {
                plugin.load(this);
                this.logDebug(`Plugin ${plugin.name} loaded.`);
            } catch (error) {
                this.logDebug(`AnalyticsSDK: Failed to load plugin ${plugin.name}:`, error);
            }
        }
        this.logDebug(`Plugin ${plugin.name} added.`);
    }

    // --- Gerenciamento de Consentimento --- //
    public giveConsent(): void {
        this.consentGiven = true;
        this.enableTracking();
        this.logDebug('Consent given. Tracking enabled.');
    }

    public revokeConsent(): void {
        this.consentGiven = false;
        this.disableTracking();
        this.clearPersistentData(); // Opcional: limpar dados persistentes ao revogar consentimento
        this.logDebug('Consent revoked. Tracking disabled and persistent data cleared.');
    }

    public hasConsent(): boolean {
        return this.consentGiven;
    }

    // --- Controle de Rastreamento --- //
    public disableTracking(): void {
        this.trackingEnabled = false;
        this.stopFlushTimer();
        this.logDebug('Tracking disabled.');
    }

    public enableTracking(): void {
        if (!this.consentGiven) {
            this.logDebug('Cannot enable tracking: consent not given.');
            return;
        }
        this.trackingEnabled = true;
        this.startFlushTimer();
        this.logDebug('Tracking enabled.');
    }

    public isTrackingEnabled(): boolean {
        return this.trackingEnabled && this.consentGiven;
    }

    // --- Utilitários --- //
    private logDebug(...args: any[]): void {
        if (this.debug) {
            console.log(`[AnalyticsSDK Debug]`, ...args);
        }
    }

    public shutdown(): void {
        this.logDebug("\nShutting down Analytics SDK: Flushing remaining events and stopping timer...");
        this.flushEvents();
        this.stopFlushTimer();
        this.logDebug("Analytics SDK shutdown complete.");
    }
}

// --- Exemplo de Uso (para demonstração) ---
// Para executar este exemplo, você precisará de um ambiente Node.js e instalar 'uuid':
// npm install uuid
// ts-node analytics-sdk.ts



export { AnalyticsSDK, AnalyticsEvent, EventProperties, UserTraits, GroupTraits, Context, MiddlewareFunction, Plugin };

