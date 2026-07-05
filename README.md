# WR — William Ribeiro · Advogado Tributarista

Landing page de advocacia tributária especializada em INSS de obras (SERO, regularização e CND).

## Stack
Site estático: HTML + CSS + JavaScript puro, sem dependências.

- `index.html` — página única (hero, problema, atuação, exemplo, como funciona, simulador, sobre, CTA)
- `css/styles.css` — estilos (tema escuro + dourado, glassmorphism, responsivo)
- `js/config.js` — parâmetros do simulador (WhatsApp, CUB por UF, alíquotas da IN RFB 2.021/21)
- `js/simulator.js` — simulador de INSS de obra em 3 etapas
- `js/main.js` — interações gerais

## Rodar localmente
```bash
npx serve .
```

## Manutenção
- **WhatsApp:** número em `js/config.js`
- **CUB:** atualizar mensalmente os valores por UF em `js/config.js` (fonte: Sinduscon / cub.org.br)
- **OAB:** substituir os placeholders `[OAB/PR nº XXXX]` no `index.html`
