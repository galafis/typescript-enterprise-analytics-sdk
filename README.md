# Enterprise Analytics SDK with TypeScript

![TypeScript](https://img.shields.io/badge/TypeScript-4.x-blue?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Runtime-Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Jest](https://img.shields.io/badge/Tests-Jest-C21325?style=for-the-badge&logo=jest&logoColor=white)
![Mermaid](https://img.shields.io/badge/Diagrams-Mermaid-orange?style=for-the-badge&logo=mermaid&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)

---

## 🇧🇷 SDK de Analytics Enterprise com TypeScript

Este repositório apresenta um **Software Development Kit (SDK) robusto e escalável para analytics empresarial, desenvolvido com TypeScript**. O objetivo é fornecer um conjunto de ferramentas e componentes reutilizáveis que permitam a desenvolvedores e cientistas de dados integrar capacidades analíticas avançadas em suas aplicações web e de backend. O SDK foca em **coleta de dados, processamento, visualização e integração com plataformas de analytics**, garantindo tipagem forte, manutenibilidade e alta performance.

### 🎯 Objetivo

O principal objetivo deste projeto é **fornecer um SDK completo e bem documentado** que acelere o desenvolvimento de soluções de analytics em ambientes empresariais. Serão abordados desde a arquitetura do SDK, padrões de design, exemplos de uso em diferentes contextos (frontend e backend), até a integração com APIs de dados e ferramentas de visualização, com ênfase em **rastreamento de eventos aprimorado, suporte a middleware, arquitetura de plugins, gerenciamento de contexto, persistência e consentimento**.

### ✨ Destaques

- **Rastreamento de Eventos Aprimorado**: Mecanismos flexíveis para capturar e processar eventos de usuário e sistema, com a capacidade de adicionar propriedades customizadas e metadados ricos a cada evento.
- **Suporte a Middleware**: Uma arquitetura de middleware que permite interceptar e modificar eventos antes que sejam processados ou enviados, possibilitando validação, enriquecimento e filtragem de dados de analytics.
- **Arquitetura de Plugins Extensível**: Um sistema de plugins que facilita a integração com diversas plataformas de analytics de terceiros (e.g., Google Analytics, Mixpanel, Segment) e a adição de funcionalidades customizadas sem modificar o core do SDK.
- **Gerenciamento de Contexto e Persistência**: Funcionalidades para gerenciar o contexto do usuário e da sessão, persistindo dados importantes (como IDs de usuário e propriedades globais) entre sessões e recarregamentos de página, garantindo uma visão consistente do comportamento do usuário.
- **Gerenciamento de Consentimento**: Implementação de mecanismos para respeitar as preferências de privacidade do usuário, permitindo o controle granular sobre quais dados são coletados e processados, em conformidade com regulamentações como GDPR e LGPD.
- **Tipagem Forte com TypeScript**: Garante maior segurança, manutenibilidade e refatoração de código, reduzindo erros em tempo de desenvolvimento.
- **Modularidade e Reusabilidade**: Componentes bem definidos que podem ser facilmente integrados em diversas aplicações, promovendo a reutilização e padronização.
- **Código Profissional**: Exemplos de código bem estruturados, seguindo as melhores práticas da indústria, com foco em clareza, eficiência e documentação interna.
- **Testes Incluídos**: Módulos de código validados através de testes unitários e de integração, garantindo a correção e a robustez das implementações.

### 🚀 Benefícios do SDK em Ação

Este SDK de Analytics Enterprise com TypeScript oferece uma solução completa para as necessidades de coleta e processamento de dados analíticos. Os benefícios são demonstrados através de:

1.  **Flexibilidade na Coleta de Dados**: O rastreamento de eventos aprimorado permite que as equipes de produto e marketing definam e capturem exatamente os dados de que precisam, com a granularidade necessária para análises aprofundadas.

2.  **Qualidade e Governança de Dados**: A arquitetura de middleware e o gerenciamento de consentimento garantem que os dados coletados sejam válidos, enriquecidos e estejam em conformidade com as políticas de privacidade, melhorando a qualidade e a confiabilidade dos insights.

3.  **Extensibilidade e Integração Simplificada**: O sistema de plugins permite que o SDK se adapte facilmente a novas ferramentas de analytics ou requisitos de negócios, sem a necessidade de reescrever grandes partes do código, economizando tempo e recursos de desenvolvimento.

4.  **Experiência do Usuário Consistente**: O gerenciamento de contexto e persistência assegura que a jornada do usuário seja rastreada de forma coesa, mesmo através de múltiplas sessões, fornecendo uma visão 360º do comportamento.

5.  **Desenvolvimento Ágil e Manutenível**: A tipagem forte do TypeScript e a modularidade do código resultam em um SDK mais fácil de desenvolver, testar e manter, reduzindo a dívida técnica e acelerando a entrega de novas funcionalidades analíticas.

---

## 🇬🇧 Enterprise Analytics SDK with TypeScript

This repository presents a **robust and scalable Software Development Kit (SDK) for enterprise analytics, developed with TypeScript**. The goal is to provide a set of reusable tools and components that enable developers and data scientists to integrate advanced analytical capabilities into their web and backend applications. The SDK focuses on **data collection, processing, visualization, and integration with analytics platforms**, ensuring strong typing, maintainability, and high performance.

### 🎯 Objective

The main objective of this project is to **provide a complete and well-documented SDK** that accelerates the development of analytics solutions in enterprise environments. It will cover everything from the SDK architecture, design patterns, usage examples in different contexts (frontend and backend), to integration with data APIs and visualization tools, with an emphasis on **enhanced event tracking, middleware support, plugin architecture, context management, persistence, and consent**.

### ✨ Highlights

- **Enhanced Event Tracking**: Flexible mechanisms to capture and process user and system events, with the ability to add custom properties and rich metadata to each event.
- **Middleware Support**: A middleware architecture that allows intercepting and modifying events before they are processed or sent, enabling validation, enrichment, and filtering of analytics data.
- **Extensible Plugin Architecture**: A plugin system that facilitates integration with various third-party analytics platforms (e.g., Google Analytics, Mixpanel, Segment) and the addition of custom functionalities without modifying the SDK's core.
- **Context Management and Persistence**: Features to manage user and session context, persisting important data (like user IDs and global properties) across sessions and page reloads, ensuring a consistent view of user behavior.
- **Consent Management**: Implementation of mechanisms to respect user privacy preferences, allowing granular control over which data is collected and processed, in compliance with regulations like GDPR and LGPD.
- **Strong Typing with TypeScript**: Ensures greater safety, maintainability, and code refactoring, reducing errors during development.
- **Modularity and Reusability**: Well-defined components that can be easily integrated into various applications, promoting reuse and standardization.
- **Professional Code**: Well-structured code examples, following industry best practices, with a focus on clarity, efficiency, and internal documentation.
- **Tests Included**: Code modules validated through unit and integration tests, ensuring the correctness and robustness of the implementations.

### 📊 Visualization

![Analytics SDK Architecture](diagrams/analytics_sdk_architecture.png)

*Diagrama ilustrativo da arquitetura do SDK de Analytics Empresarial, destacando os principais módulos e o fluxo de dados.*


---

## 🛠️ Tecnologias Utilizadas / Technologies Used

| Categoria         | Tecnologia      | Descrição                                                                 |
| :---------------- | :-------------- | :------------------------------------------------------------------------ |
| **Linguagem**     | TypeScript      | Linguagem principal para o desenvolvimento do SDK, oferecendo tipagem forte. |
| **Runtime**       | Node.js         | Ambiente de execução para o SDK (backend) e ferramentas de desenvolvimento. |
| **Testes**        | Jest            | Framework de testes para garantir a robustez e a correção do SDK.         |
| **Gerenciamento de Pacotes** | npm / Yarn      | Para gerenciar dependências e scripts do projeto.                         |
| **Diagramação**   | Mermaid         | Para criação de diagramas de arquitetura e fluxo de dados no README.      |

---

## 📁 Repository Structure

```
typescript-enterprise-analytics-sdk/
├── src/           # Código fonte do SDK (módulos, componentes, utilitários)
├── data/          # Dados de exemplo e mockups para testes e demonstrações
├── images/        # Imagens e diagramas para o README e documentação
├── tests/         # Testes unitários e de integração para o SDK
├── docs/          # Documentação adicional, guias de uso e exemplos
├── config/        # Arquivos de configuração (e.g., para diferentes ambientes)
├── scripts/       # Scripts utilitários para build, teste e deploy do SDK
├── package.json   # Metadados do projeto e dependências
├── tsconfig.json  # Configurações do compilador TypeScript
└── README.md      # Este arquivo
```

---

## 🚀 Getting Started

Para começar, clone o repositório e explore os diretórios `src/` e `docs/` para exemplos detalhados e instruções de uso. Certifique-se de ter as dependências necessárias instaladas.

### Pré-requisitos

- Node.js (versão LTS recomendada)
- npm ou Yarn (gerenciador de pacotes)

### Instalação

```bash
git clone https://github.com/GabrielDemetriosLafis/typescript-enterprise-analytics-sdk.git
cd typescript-enterprise-analytics-sdk

# Instalar dependências
npm install  # ou yarn install

# Compilar o TypeScript
npm run build # ou yarn build
```

### Exemplo de Uso Avançado (TypeScript)

O exemplo abaixo demonstra a inicialização do `AnalyticsSDK`, a configuração de propriedades globais, a identificação de usuários, a captura de eventos e page views, o rastreamento de erros, o gerenciamento de performance e o controle de consentimento. Este código ilustra como as funcionalidades avançadas do SDK podem ser utilizadas para coletar e gerenciar dados analíticos de forma eficaz.

```typescript
import { AnalyticsSDK } from './src/analytics-sdk';
import { ConsentStatus } from './src/consent-manager';

// Exemplo de uso (para demonstração, não para ser executado em produção)
async function runDemo() {
    console.log("\n==================================================");
    console.log("Demonstração do SDK de Analytics Enterprise com TypeScript");
    console.log("==================================================");

    const sdk = new AnalyticsSDK("MyEnterpriseApp");

    // --- 1. Configurar Propriedades Globais ---
    console.log("\n--- 1. Configurando Propriedades Globais ---");
    sdk.setGlobalProperties({ environment: "production", version: "2.1.0", tenantId: "ORG123" });
    console.log("  Propriedades globais definidas.");

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
    sdk.identifyUser("user123", { email: "user@example.com", plan: "premium", signupDate: new Date().toISOString() });
    console.log("  Usuário identificado: user123");

    // --- 4. Capturar Eventos e Page Views ---
    console.log("\n--- 4. Capturando Eventos e Page Views ---");
    sdk.captureEvent("product_viewed", { productId: "P123", category: "Electronics", price: 1299.99 });
    sdk.capturePageView("/products/P123", { referrer: "homepage", pageTitle: "Product Detail" });
    sdk.captureEvent("add_to_cart", { productId: "P123", quantity: 1 });
    console.log("  Eventos e page views capturados.");

    // --- 5. Simular e Rastrear Erros ---
    console.log("\n--- 5. Simulando e Rastreando Erros ---");
    try {
        // Simular um erro que seria capturado pelo SDK
        throw new Error("Falha na API de produtos: status 500");
    } catch (e: any) {
        sdk.trackError(e, { component: "product_api", severity: "critical", endpoint: "/api/products" });
        console.log("  Erro rastreado.");
    }

    // --- 6. Rastrear Performance ---
    console.log("\n--- 6. Rastreando Performance ---");
    sdk.trackPerformance("page_load_time", 1500, { page: "/dashboard" });
    sdk.trackPerformance("api_response_time", 250, { api: "/api/data", method: "GET" });
    console.log("  Métricas de performance rastreadas.");

    // --- 7. Usar Middleware (exemplo: filtrar eventos) ---
    console.log("\n--- 7. Usando Middleware (filtrando eventos de teste) ---");
    sdk.use((event, next) => {
        if (event.name === "test_event") {
            console.log("  Middleware: Evento 'test_event' bloqueado.");
            return; // Bloqueia o evento
        }
        next(event);
    });
    sdk.captureEvent("test_event", { data: "should_not_pass" });
    sdk.captureEvent("another_event", { data: "should_pass" });

    // --- 8. Desabilitar e Habilitar Rastreamento ---
    console.log("\n--- 8. Desabilitando e Habilitando Rastreamento ---");
    sdk.disableTracking();
    sdk.captureEvent("event_while_disabled");
    console.log("  Rastreamento desabilitado. Evento 'event_while_disabled' não deve ser processado.");
    sdk.enableTracking();
    sdk.captureEvent("event_after_enabled");
    console.log("  Rastreamento habilitado. Evento 'event_after_enabled' deve ser processado.");

    console.log("\n==================================================");
    console.log("Demonstração Concluída.");
    console.log("==================================================");
}

// Executar a demonstração
runDemo();
```

---

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues, enviar pull requests ou sugerir melhorias. Por favor, siga as diretrizes de contribuição.

---

## 📝 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

