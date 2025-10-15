# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-10-15

### Added
- Initial release of TypeScript Enterprise Analytics SDK
- Core analytics functionality with event tracking
- Enhanced event tracking with custom properties and metadata
- Middleware support for event processing
- Extensible plugin architecture
- Context management and persistence
- Consent management with granular control (GDPR/LGPD compliant)
- User identification and traits management
- Page view tracking
- Error tracking utilities
- Performance metrics tracking
- Global properties management
- Batch processing and event queuing
- localStorage persistence for user data
- TypeScript typings for all public APIs
- Comprehensive test suite with 80.5% coverage
- GitHub Actions CI/CD pipeline
- Complete API documentation
- Advanced usage examples

### Features

#### Event Tracking
- `track()` / `captureEvent()` - Track custom events
- `page()` / `capturePageView()` - Track page views
- `identify()` / `identifyUser()` - Identify users
- `trackError()` - Track errors with context
- `trackPerformance()` - Track performance metrics
- `group()` - Group users
- `alias()` - Create user aliases

#### Consent Management
- `updateConsent()` - Update consent preferences
- `getConsentStatus()` - Get current consent status
- `giveConsent()` - Grant general consent
- `revokeConsent()` - Revoke consent and clear data
- `hasConsent()` - Check consent status

#### Context & Properties
- `setGlobalProperties()` - Set global event properties
- `getGlobalProperties()` - Get global properties
- `getCurrentUser()` - Get current user information
- Automatic context enrichment (user agent, locale, screen info)

#### Middleware & Plugins
- `use()` - Add middleware for event processing
- `addPlugin()` - Add plugins for integrations
- Support for destination, enrichment, and utility plugins

#### Tracking Control
- `disableTracking()` - Temporarily disable tracking
- `enableTracking()` - Re-enable tracking
- `isTrackingEnabled()` - Check tracking status
- `flushEvents()` - Manually flush pending events
- `shutdown()` - Graceful shutdown with event flush

### Infrastructure
- Jest testing framework
- TypeScript 5.x support
- Node.js 16.x, 18.x, 20.x compatibility
- ESM and CommonJS module support
- Automated testing with GitHub Actions
- Code coverage reporting

### Documentation
- Comprehensive README with bilingual support (PT-BR/EN)
- API reference documentation
- Advanced usage examples
- Architecture diagrams
- Contributing guidelines
- MIT License

[1.0.0]: https://github.com/galafis/typescript-enterprise-analytics-sdk/releases/tag/v1.0.0
