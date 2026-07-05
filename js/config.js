/* ============================================================
   Configuração — William Ribeiro · Advogado Tributarista
   Altere aqui os parâmetros do simulador e o contato.

   MODELO DE CÁLCULO (aferição indireta — IN RFB 2.021/21):
   1) Custo da obra (COD) = área × VAU
      VAU ≈ média dos padrões do CUB da UF + 1% (art. 25, §4º)
   2) RMT (mão de obra presumida) = COD × 20% p/ alvenaria (art. 25, §16)
   3) Fator Social (obra de pessoa física, art. 26, §1º):
      percentual da RMT considerado, conforme área total
   4) INSS estimado = RMT ajustada × 36,8%
      (20% patronal + 8% segurados + 3% RAT + 5,8% terceiros)
   ============================================================ */

const CONFIG = {
  // Número do WhatsApp com DDI + DDD, apenas dígitos. Ex.: "5511999999999"
  whatsappNumber: "5544998897522",

  // Mensagem padrão dos botões "Falar com o advogado"
  whatsappDefaultMessage:
    "Olá, William. Vim pelo seu site e gostaria de uma análise jurídica do INSS da minha obra.",

  // CUB por m² de cada UF — VALORES DE REFERÊNCIA (meados de 2026).
  // O VAU usado no cálculo = CUB da UF + 1% (art. 25, §4º).
  // Atualizar mensalmente com a tabela do Sinduscon de cada estado
  // (portal nacional: www.cub.org.br).
  cubPorUF: {
    AC: 2250, AL: 2150, AP: 2300, AM: 2180, BA: 2200, CE: 2130,
    DF: 2630, ES: 2310, GO: 2160, MA: 2100, MT: 2280, MS: 2350,
    MG: 2390, PA: 2090, PB: 2140, PR: 2620, PE: 2150, PI: 2120,
    RJ: 2530, RN: 2160, RS: 2420, RO: 2320, RR: 2400, SC: 3300,
    SP: 2680, SE: 2140, TO: 2250,
  },
  // Usado se a UF não estiver na tabela
  cubPadrao: 2450,

  // Percentual de mão de obra sobre o custo da obra (alvenaria, art. 25 §16)
  percentualMaoDeObra: 0.20,

  // Alíquota total sobre a RMT: 20% + 8% + 3% (RAT) + 5,8% (terceiros)
  aliquotaTotal: 0.368,

  // Simplificação para reforma/ampliação: área equivalente reduzida
  fatorEquivalenciaReforma: 0.5,

  // Fator Social (art. 26, §1º) — percentual da RMT considerado, por área
  fatorSocial: [
    { ateM2: 100, fator: 0.20 },
    { ateM2: 200, fator: 0.40 },
    { ateM2: 300, fator: 0.55 },
    { ateM2: 400, fator: 0.70 },
    { ateM2: Infinity, fator: 0.90 },
  ],
};
