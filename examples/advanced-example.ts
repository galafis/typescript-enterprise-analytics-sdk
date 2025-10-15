import { AnalyticsSDK, Plugin, ConsentStatus } from '../src/analytics-sdk';

// Exemplo de plugin customizado
const consoleLogPlugin: Plugin = {
    name: 'ConsoleLogPlugin',
    version: '1.0.0',
    type: 'destination',
    track: (event) => {
        console.log(`[ConsoleLogPlugin] Track Event:`, event.event, event.properties);
    },
    page: (event) => {
        console.log(`[ConsoleLogPlugin] Page View:`, event.name, event.properties);
    },
    identify: (event) => {
        console.log(`[ConsoleLogPlugin] Identify:`, event.userId, event.traits);
    }
};

// Exemplo de uso avançado do SDK de Analytics
async function runAdvancedDemo() {
    console.log("\n==================================================");
    console.log("Demonstração Avançada do SDK de Analytics Enterprise");
    console.log("==================================================");

    // Inicializa o SDK
    const sdk = new AnalyticsSDK({
        appName: "MyEnterpriseApp",
        version: "3.0.0",
        batchSize: 3,
        flushInterval: 2000, // 2 segundos
        debug: true,
        enablePersistence: true,
        initialConsent: true,
    });

    // Adicionar plugin customizado
    sdk.addPlugin(consoleLogPlugin);

    // --- 1. Configurar Propriedades Globais ---
    console.log("\n--- 1. Configurando Propriedades Globais ---");
    sdk.setGlobalProperties({ environment: "development", version: "3.0.0", tenantId: "ENT987" });
    console.log("  Propriedades globais definidas: ", sdk.getGlobalProperties());

    // --- 2. Gerenciar Consentimento ---
    console.log("\n--- 2. Gerenciando Consentimento ---");
    console.log("  Status de consentimento inicial: ", sdk.getConsentStatus());
    sdk.updateConsent({
        analytics: ConsentStatus.GRANTED,
        marketing: ConsentStatus.DENIED,
        personalization: ConsentStatus.GRANTED
    });
    console.log("  Status de consentimento atualizado: ", sdk.getConsentStatus());

    // --- 3. Identificar Usuário ---
    console.log("\n--- 3. Identificando Usuário ---");
    sdk.identifyUser("adv_user_456", { email: "advanced.user@example.com", plan: "enterprise", department: "R&D" });
    console.log("  Usuário identificado: ", sdk.getCurrentUser());

    // --- 4. Capturar Eventos Personalizados ---
    console.log("\n--- 4. Capturando Eventos Personalizados ---");
    sdk.captureEvent("dashboard_loaded", { dashboardId: "DASH001", widgetsCount: 5 });
    sdk.captureEvent("report_generated", { reportType: "sales_summary", format: "pdf", durationMs: 1200 });
    sdk.captureEvent("data_exported", { dataType: "customer_data", recordCount: 15000, destination: "s3" });
    console.log("  Eventos personalizados capturados.");

    // --- 5. Capturar Page Views com Metadados ---
    console.log("\n--- 5. Capturando Page Views com Metadados ---");
    sdk.capturePageView("/app/reports/sales", { pageTitle: "Sales Report", filtersApplied: ["Q3", "2025"] });
    sdk.capturePageView("/app/settings/profile", { pageTitle: "User Profile Settings" });
    console.log("  Page views capturadas.");

    // --- 6. Simular e Rastrear Erros Críticos ---
    console.log("\n--- 6. Simulando e Rastreando Erros Críticos ---");
    try {
        // Simular um erro de rede ou de processamento
        throw new Error("Network error: Failed to fetch data from external service");
    } catch (e: any) {
        sdk.trackError(e, { component: "data_ingestion_service", severity: "critical", transactionId: "TXN789" });
        console.log("  Erro crítico rastreado.");
    }

    // --- 7. Rastrear Performance de Operações Específicas ---
    console.log("\n--- 7. Rastreando Performance de Operações Específicas ---");
    sdk.trackPerformance("dashboard_render_time", 850, { dashboardType: "executive", dataPoints: 10000 });
    sdk.trackPerformance("user_login_duration", 320, { authMethod: "oauth" });
    console.log("  Métricas de performance rastreadas.");

    // --- 8. Usar Middleware para Enriquecimento de Dados ---
    console.log("\n--- 8. Usando Middleware para Enriquecimento de Dados ---");
    sdk.use((event, next) => {
        // Adiciona um timestamp de processamento ao evento
        if (event.properties) {
            event.properties.processedAt = new Date().toISOString();
        }
        console.log(`  Middleware: Evento '${event.event || event.name}' enriquecido com 'processedAt'.`);
        next(event);
    });
    sdk.captureEvent("user_action", { action: "click", element: "save_button" });

    // --- 9. Desabilitar e Habilitar Rastreamento Dinamicamente ---
    console.log("\n--- 9. Desabilitando e Habilitando Rastreamento Dinamicamente ---");
    sdk.disableTracking();
    sdk.captureEvent("event_while_disabled", { data: "this_should_not_be_sent" });
    console.log("  Rastreamento desabilitado. Evento 'event_while_disabled' não deve ser processado.");
    sdk.enableTracking();
    sdk.captureEvent("event_after_enabled", { data: "this_should_be_sent" });
    console.log("  Rastreamento habilitado. Evento 'event_after_enabled' deve ser processado.");

    // Aguardar um pouco para os eventos serem processados
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log("\n==================================================");
    console.log("Demonstração Avançada Concluída.");
    console.log("==================================================\n");
    
    // Shutdown para garantir que todos os eventos sejam processados
    sdk.shutdown();
}

// Executar a demonstração
runAdvancedDemo();

