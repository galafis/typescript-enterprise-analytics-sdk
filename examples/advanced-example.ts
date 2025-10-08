import { AnalyticsSDK, Plugin } from '../src/analytics-sdk';

// Definir ConsentStatus localmente para o exemplo, já que não é exportado pelo SDK
enum ConsentStatus {
    GRANTED = 'granted',
    DENIED = 'denied',
    UNKNOWN = 'unknown',
}

// Mock de uma API de dados para simular o envio de eventos
class MockAnalyticsAPI {
    private endpoint: string;

    constructor(endpoint: string) {
        this.endpoint = endpoint;
    }

    async sendEvent(event: any): Promise<void> {
        console.log(`[MockAnalyticsAPI] Enviando evento para ${this.endpoint}:`, JSON.stringify(event, null, 2));
        // Simula uma chamada de API
        return new Promise(resolve => setTimeout(resolve, 100));
    }
}

// Exemplo de uso avançado do SDK de Analytics
async function runAdvancedDemo() {
    console.log("\n==================================================");
    console.log("Demonstração Avançada do SDK de Analytics Enterprise");
    console.log("==================================================");

    // Inicializa o SDK com um nome de aplicação e uma API mock
    const mockAPI = new MockAnalyticsAPI("https://api.example.com/analytics");
    const sdk = new AnalyticsSDK({
        appName: "MyEnterpriseApp",
        batchSize: 3,
        flushInterval: 2000, // 2 segundos
        debug: true,
        enablePersistence: true,
        initialConsent: true,
    });

    // --- 1. Configurar Propriedades Globais ---
    console.log("\n--- 1. Configurando Propriedades Globais ---");
    sdk.setGlobalProperties({ environment: "development", version: "3.0.0", tenantId: "ENT987" });
    // console.log("  Propriedades globais definidas: ", sdk["globalProperties"]); // Removido acesso direto a propriedade privada

    // --- 2. Gerenciar Consentimento ---
    console.log("\n--- 2. Gerenciando Consentimento ---");
    console.log("  Status de consentimento inicial: ", sdk.hasConsent());
    // O método giveConsent não aceita um objeto de consentimento, ele apenas define o consentimento como true.
    // Para gerenciar consentimento granular, o SDK precisaria de um método updateConsent ou similar.
    // Por enquanto, vamos apenas chamar giveConsent.
    sdk.giveConsent(); 
    console.log("  Status de consentimento atualizado: ", sdk.hasConsent());

    // --- 3. Identificar Usuário ---
    console.log("\n--- 3. Identificando Usuário ---");
    sdk.identify("adv_user_456", { email: "advanced.user@example.com", plan: "enterprise", department: "R&D" });
    // console.log("  Usuário identificado: ", sdk["userId"]); // Removido acesso direto a propriedade privada

    // --- 4. Capturar Eventos Personalizados ---
    console.log("\n--- 4. Capturando Eventos Personalizados ---");
    await sdk.track("dashboard_loaded", { dashboardId: "DASH001", widgetsCount: 5 });
    await sdk.track("report_generated", { reportType: "sales_summary", format: "pdf", durationMs: 1200 });
    await sdk.track("data_exported", { dataType: "customer_data", recordCount: 15000, destination: "s3" });
    console.log("  Eventos personalizados capturados.");

    // --- 5. Capturar Page Views com Metadados ---
    console.log("\n--- 5. Capturando Page Views com Metadados ---");
    await sdk.page("/app/reports/sales", { pageTitle: "Sales Report", filtersApplied: ["Q3", "2025"] });
    await sdk.page("/app/settings/profile", { pageTitle: "User Profile Settings" });
    console.log("  Page views capturadas.");

    // --- 6. Simular e Rastrear Erros Críticos ---
    console.log("\n--- 6. Simulando e Rastreando Erros Críticos ---");
    try {
        // Simular um erro de rede ou de processamento
        throw new Error("Network error: Failed to fetch data from external service");
    } catch (e: any) {
        // O SDK não tem um método trackError diretamente, mas podemos enviar um evento de erro
        await sdk.track("error_occurred", { message: e.message, component: "data_ingestion_service", severity: "critical", transactionId: "TXN789" });
        console.log("  Erro crítico rastreado (como evento).");
    }

    // --- 7. Rastrear Performance de Operações Específicas ---
    console.log("\n--- 7. Rastreando Performance de Operações Específicas ---");
    // O SDK não tem um método trackPerformance diretamente, mas podemos enviar eventos de performance
    await sdk.track("performance_metric", { name: "dashboard_render_time", value: 850, dashboardType: "executive", dataPoints: 10000 });
    await sdk.track("performance_metric", { name: "user_login_duration", value: 320, authMethod: "oauth" });
    console.log("  Métricas de performance rastreadas (como eventos).");

    // --- 8. Usar Middleware para Enriquecimento de Dados ---
    console.log("\n--- 8. Usando Middleware para Enriquecimento de Dados ---");
    sdk.use((event, next) => {
        // Adiciona um timestamp de processamento ao evento
        event.context = { ...event.context, processedAt: new Date().toISOString() }; // Corrigido acesso a `payload`
        console.log(`  Middleware: Evento \'${event.event || event.name}\' enriquecido com \'processedAt\'.`);
        next(event);
    });
    await sdk.track("user_action", { action: "click", element: "save_button" });

    // --- 9. Desabilitar e Habilitar Rastreamento Dinamicamente ---
    console.log("\n--- 9. Desabilitando e Habilitando Rastreamento Dinamicamente ---");
    sdk.disableTracking();
    await sdk.track("event_while_disabled", { data: "this_should_not_be_sent" });
    console.log("  Rastreamento desabilitado. Evento \'event_while_disabled\' não deve ser processado.");
    sdk.enableTracking();
    await sdk.track("event_after_enabled", { data: "this_should_be_sent" });
    console.log("  Rastreamento habilitado. Evento \'event_after_enabled\' deve ser processado.");

    console.log("\n==================================================");
    console.log("Demonstração Avançada Concluída.");
    console.log("==================================================\n");
}

// Executar a demonstração
runAdvancedDemo();

