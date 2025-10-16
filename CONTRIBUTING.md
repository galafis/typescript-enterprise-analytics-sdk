# Guia de Contribuição

Obrigado por considerar contribuir para o TypeScript Enterprise Analytics SDK! Este documento fornece diretrizes para contribuir com o projeto.

## 🚀 Como Começar

### Pré-requisitos

- Node.js (versão 16.x ou superior)
- npm ou yarn
- Git

### Configuração do Ambiente de Desenvolvimento

1. Faça um fork do repositório
2. Clone seu fork:
   ```bash
   git clone https://github.com/seu-usuario/typescript-enterprise-analytics-sdk.git
   cd typescript-enterprise-analytics-sdk
   ```

3. Instale as dependências:
   ```bash
   npm install
   ```

4. Crie uma branch para sua feature/correção:
   ```bash
   git checkout -b feature/minha-nova-feature
   ```

## 🧪 Desenvolvimento

### Compilar o Projeto

```bash
npm run build
```

### Executar Testes

```bash
# Executar todos os testes
npm test

# Executar testes com cobertura
npm run test:coverage
```

### Executar Exemplos

```bash
npm run demo:advanced
```

## 📝 Diretrizes de Código

### Padrões de Código

- Use TypeScript para todo novo código
- Siga as configurações do TypeScript definidas em `tsconfig.json`
- Mantenha a tipagem forte - evite `any` quando possível
- Documente funções públicas com JSDoc

### Convenções de Nomenclatura

- Use `camelCase` para variáveis e funções
- Use `PascalCase` para classes e interfaces
- Use `UPPER_CASE` para constantes
- Prefixe métodos privados com `private`

### Estrutura de Commits

Usamos commits convencionais:

```
tipo(escopo): descrição curta

Descrição mais detalhada (opcional)

Fixes #123
```

Tipos válidos:
- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Alterações na documentação
- `style`: Formatação, ponto e vírgula faltando, etc
- `refactor`: Refatoração de código
- `test`: Adição ou correção de testes
- `chore`: Tarefas de manutenção

## ✅ Checklist de Pull Request

Antes de submeter um PR, certifique-se de que:

- [ ] O código compila sem erros (`npm run build`)
- [ ] Todos os testes passam (`npm test`)
- [ ] A cobertura de testes não diminuiu
- [ ] O código está documentado
- [ ] Foram adicionados testes para novas funcionalidades
- [ ] O README foi atualizado se necessário
- [ ] Os commits seguem as convenções
- [ ] A branch está atualizada com a main

## 🐛 Reportar Bugs

Ao reportar bugs, inclua:

- Descrição clara do problema
- Passos para reproduzir
- Comportamento esperado vs atual
- Versão do Node.js e do SDK
- Logs ou mensagens de erro relevantes

## 💡 Sugerir Funcionalidades

Para sugerir novas funcionalidades:

1. Verifique se já não existe uma issue sobre o assunto
2. Descreva o caso de uso
3. Explique como a funcionalidade deveria funcionar
4. Se possível, forneça exemplos de código

## 🔍 Processo de Revisão

1. Um maintainer revisará seu PR
2. Podem ser solicitadas alterações
3. Uma vez aprovado, o PR será mergeado
4. Sua contribuição será incluída no próximo release

## 📄 Licença

Ao contribuir, você concorda que suas contribuições serão licenciadas sob a mesma licença MIT do projeto.

## 🤝 Código de Conduta

- Seja respeitoso e construtivo
- Aceite feedback de forma profissional
- Foque no que é melhor para a comunidade
- Mostre empatia com outros membros da comunidade

## 📞 Contato

Se tiver dúvidas, abra uma issue ou entre em contato com os maintainers.

---

**Obrigado por contribuir! 🎉**
