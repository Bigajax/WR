/* ============================================================
   Simulador de INSS de Obras
   Estimativa preliminar — sem caráter de parecer jurídico.
   Fluxo: 1. Dados da obra → 2. Estimativa preliminar → 3. Análise no WhatsApp
   ============================================================ */

(function () {
  const form = document.getElementById("simForm");
  if (!form) return;

  const card = document.getElementById("simCard");
  const panels = Array.from(form.querySelectorAll(".sim__panel"));
  const steps = Array.from(card.querySelectorAll(".sim__step"));
  const errorMsg = document.getElementById("simError");
  const resultBox = document.getElementById("simResult");

  let currentStep = 1;
  let estimativaAtual = null;
  let riscoAtual = null;

  const anoAtual = new Date().getFullYear();

  const brl = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  // Preenche o seletor de ano de início (ano atual até 1970)
  const anoSelect = document.getElementById("anoInicio");
  for (let a = anoAtual; a >= 1970; a--) {
    const opt = document.createElement("option");
    opt.value = String(a);
    opt.textContent = String(a);
    anoSelect.appendChild(opt);
  }

  /* ---------- Dropdown custom (estilo Apple) ---------- */

  const dropdowns = [];

  function closeAllDropdowns(except) {
    dropdowns.forEach((d) => { if (d !== except) d.close(); });
  }

  function enhanceSelect(select) {
    const wrap = document.createElement("div");
    wrap.className = "dropdown";
    select.parentNode.insertBefore(wrap, select);
    wrap.appendChild(select);
    select.tabIndex = -1;
    select.classList.add("dropdown__native");

    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "dropdown__trigger";
    trigger.setAttribute("role", "combobox");
    trigger.setAttribute("aria-haspopup", "listbox");
    trigger.setAttribute("aria-expanded", "false");
    const fieldLabel = select.closest(".field")?.querySelector("label");
    if (fieldLabel) trigger.setAttribute("aria-label", fieldLabel.textContent.trim());

    const label = document.createElement("span");
    label.className = "dropdown__label";
    trigger.appendChild(label);

    trigger.insertAdjacentHTML(
      "beforeend",
      '<svg class="dropdown__chevron" viewBox="0 0 12 8" aria-hidden="true"><path d="M1 1l5 5 5-5" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    );

    const menu = document.createElement("ul");
    menu.className = "dropdown__menu";
    menu.setAttribute("role", "listbox");

    const options = [];
    Array.from(select.options).forEach((opt, i) => {
      if (opt.disabled) return;
      const li = document.createElement("li");
      li.className = "dropdown__option";
      li.setAttribute("role", "option");
      li.id = `${select.id}-opt-${i}`;
      li.dataset.value = opt.value;
      li.textContent = opt.text;
      menu.appendChild(li);
      options.push(li);
    });

    wrap.appendChild(trigger);
    wrap.appendChild(menu);

    let activeIndex = -1;
    let typeBuffer = "";
    let typeTimer = null;

    function sync() {
      const sel = select.options[select.selectedIndex];
      const isPlaceholder = !select.value;
      label.textContent = sel ? sel.text : "";
      label.classList.toggle("is-placeholder", isPlaceholder);
      options.forEach((li) =>
        li.classList.toggle("is-selected", !isPlaceholder && li.dataset.value === select.value)
      );
    }

    function setActive(i) {
      if (!options.length) return;
      activeIndex = Math.max(0, Math.min(i, options.length - 1));
      options.forEach((li, j) => li.classList.toggle("is-active", j === activeIndex));
      trigger.setAttribute("aria-activedescendant", options[activeIndex].id);
      options[activeIndex].scrollIntoView({ block: "nearest" });
    }

    function isOpen() { return wrap.classList.contains("is-open"); }

    function open() {
      closeAllDropdowns(api);
      wrap.classList.add("is-open");
      trigger.setAttribute("aria-expanded", "true");
      const selIdx = options.findIndex((li) => li.classList.contains("is-selected"));
      setActive(selIdx >= 0 ? selIdx : 0);
    }

    function close() {
      wrap.classList.remove("is-open");
      trigger.setAttribute("aria-expanded", "false");
      trigger.removeAttribute("aria-activedescendant");
    }

    function choose(i) {
      const li = options[i];
      if (!li) return;
      select.value = li.dataset.value;
      select.dispatchEvent(new Event("input", { bubbles: true }));
      select.dispatchEvent(new Event("change", { bubbles: true }));
      sync();
      close();
      trigger.focus();
    }

    trigger.addEventListener("click", () => (isOpen() ? close() : open()));

    trigger.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        isOpen() ? setActive(activeIndex + 1) : open();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        isOpen() ? setActive(activeIndex - 1) : open();
      } else if ((e.key === "Enter" || e.key === " ") && isOpen()) {
        e.preventDefault();
        choose(activeIndex);
      } else if (e.key === "Escape" && isOpen()) {
        e.stopPropagation();
        close();
      } else if (e.key === "Home" && isOpen()) {
        e.preventDefault();
        setActive(0);
      } else if (e.key === "End" && isOpen()) {
        e.preventDefault();
        setActive(options.length - 1);
      } else if (e.key === "Tab") {
        close();
      } else if (e.key.length === 1 && /\S/.test(e.key)) {
        typeBuffer += e.key.toLowerCase();
        clearTimeout(typeTimer);
        typeTimer = setTimeout(() => (typeBuffer = ""), 600);
        const idx = options.findIndex((li) =>
          li.textContent.toLowerCase().startsWith(typeBuffer)
        );
        if (idx >= 0) {
          if (!isOpen()) open();
          setActive(idx);
        }
      }
    });

    // Mantém o foco no gatilho enquanto interage com o menu
    menu.addEventListener("mousedown", (e) => e.preventDefault());
    menu.addEventListener("click", (e) => {
      const li = e.target.closest(".dropdown__option");
      if (li) choose(options.indexOf(li));
    });
    menu.addEventListener("mousemove", (e) => {
      const li = e.target.closest(".dropdown__option");
      if (li) {
        const i = options.indexOf(li);
        if (i !== activeIndex) setActive(i);
      }
    });

    sync();

    const api = { close, sync };
    dropdowns.push(api);
    return api;
  }

  form.querySelectorAll("select").forEach(enhanceSelect);

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".dropdown")) closeAllDropdowns();
  });

  form.addEventListener("reset", () => {
    setTimeout(() => dropdowns.forEach((d) => d.sync()), 0);
  });

  /* ---------- Navegação entre etapas ---------- */

  function showStep(n) {
    currentStep = n;
    panels.forEach((p) => p.classList.toggle("is-active", Number(p.dataset.panel) === n));
    steps.forEach((s, i) => {
      s.classList.toggle("is-active", i + 1 === n);
      s.classList.toggle("is-done", i + 1 < n);
    });
    errorMsg.hidden = true;
    card.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function validateStep(n) {
    const panel = panels.find((p) => Number(p.dataset.panel) === n);
    let valid = true;

    panel.querySelectorAll("input[required], select[required]").forEach((el) => {
      const ok = el.checkValidity() && el.value.trim() !== "";
      el.classList.toggle("is-invalid", !ok);
      if (!ok) valid = false;
    });

    errorMsg.hidden = valid;
    return valid;
  }

  form.addEventListener("click", (e) => {
    if (e.target.matches("[data-next]")) {
      if (!validateStep(currentStep)) return;
      if (currentStep === 1) renderPrevia();
      showStep(currentStep + 1);
    }
    if (e.target.matches("[data-prev]")) {
      showStep(currentStep - 1);
    }
  });

  // Limpa o destaque de erro ao corrigir o campo
  form.addEventListener("input", (e) => {
    e.target.classList.remove("is-invalid");
  });

  /* ---------- Máscara do WhatsApp ---------- */

  const whatsInput = document.getElementById("whatsapp");
  whatsInput.addEventListener("input", () => {
    let d = whatsInput.value.replace(/\D/g, "").slice(0, 11);
    if (d.length > 6) {
      whatsInput.value = `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
    } else if (d.length > 2) {
      whatsInput.value = `(${d.slice(0, 2)}) ${d.slice(2)}`;
    } else {
      whatsInput.value = d;
    }
  });

  /* ---------- Cálculo da estimativa ---------- */

  function coletarObra() {
    return {
      area: parseFloat(form.area.value) || 0,
      tipoObra: form.tipoObra.value,
      tipoObraLabel: form.tipoObra.options[form.tipoObra.selectedIndex].text,
      anoInicio: parseInt(form.anoInicio.value, 10) || anoAtual,
      uf: form.uf.value,
      cidade: form.cidade.value.trim(),
    };
  }

  function calcular(obra) {
    // Aferição indireta simplificada (IN RFB 2.021/21) — parâmetros no config.js
    const ehReforma = obra.tipoObra === "reforma-ampliacao";
    const areaEquivalente = ehReforma
      ? obra.area * CONFIG.fatorEquivalenciaReforma
      : obra.area;

    // VAU da UF informada = CUB do estado + 1% (art. 25, §4º)
    const cub = CONFIG.cubPorUF[obra.uf] || CONFIG.cubPadrao;
    const vau = cub * 1.01;
    const custoObra = areaEquivalente * vau;
    const rmtCheia = custoObra * CONFIG.percentualMaoDeObra;
    const fatorSocial = CONFIG.fatorSocial.find((f) => obra.area <= f.ateM2).fator;
    const rmtAjustada = rmtCheia * fatorSocial;
    const estimativa = rmtAjustada * CONFIG.aliquotaTotal;

    // Regra de decadência: obra iniciada há 5 anos ou mais (anoInicio <= anoAtual - 5)
    const decadenciaPossivel = obra.anoInicio <= anoAtual - 5;
    const idade = anoAtual - obra.anoInicio;

    return {
      estimativa,
      vau,
      custoObra,
      rmtCheia,
      rmtAjustada,
      fatorSocial,
      areaEquivalente,
      ehReforma,
      decadenciaPossivel,
      idade,
    };
  }

  function avaliarRisco(calc) {
    if (calc.decadenciaPossivel) {
      return {
        nivel: "Alto",
        classe: "alto",
        detalhe:
          "Obra iniciada há mais de 5 anos. Débito, multa e o direito à decadência precisam ser verificados juridicamente antes de qualquer declaração.",
      };
    }
    if (calc.idade >= 2) {
      return {
        nivel: "Médio",
        classe: "medio",
        detalhe:
          "Obra em andamento há alguns anos. Definir o enquadramento correto agora reduz a chance de arbitramento pela Receita.",
      };
    }
    return {
      nivel: "Baixo",
      classe: "baixo",
      detalhe:
        "Obra recente. É o momento ideal para planejar a declaração e evitar o valor arbitrado.",
    };
  }

  /* ---------- Etapa 2 — renderiza a prévia na tela ---------- */

  function renderPrevia() {
    const obra = coletarObra();
    const calc = calcular(obra);
    const risco = avaliarRisco(calc);

    estimativaAtual = calc;
    riscoAtual = risco;

    document.getElementById("prevEstimativa").textContent = brl.format(calc.estimativa);

    // Passo a passo da conta, em linguagem simples
    const areaTxt = calc.ehReforma
      ? `${calc.areaEquivalente.toLocaleString("pt-BR")} m² (área equivalente da reforma)`
      : `${obra.area.toLocaleString("pt-BR")} m²`;
    document.getElementById("expCusto").textContent = brl.format(calc.custoObra);
    document.getElementById("expArea").textContent = areaTxt;
    document.getElementById("expVau").textContent = brl.format(calc.vau);
    document.getElementById("expRmt").textContent = brl.format(calc.rmtCheia);
    document.getElementById("expFator").textContent =
      `${Math.round(calc.fatorSocial * 100)}%`;
    document.getElementById("expRmtAjustada").textContent = brl.format(calc.rmtAjustada);
    document.getElementById("expInss").textContent = brl.format(calc.estimativa);

    const badge = document.getElementById("prevRisco");
    badge.textContent = risco.nivel;
    badge.className = `risk-badge risk-badge--${risco.classe}`;
    document.getElementById("prevRiscoDetalhe").textContent = risco.detalhe;

    document.getElementById("prevDecadencia").hidden = !calc.decadenciaPossivel;
  }

  /* ---------- Submissão — etapa 3 (contato) ---------- */

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validateStep(3)) return;

    const obra = coletarObra();
    const calc = estimativaAtual || calcular(obra);
    const risco = riscoAtual || avaliarRisco(calc);

    const nome = form.nome.value.trim();

    document.getElementById("resEstimativa").textContent = brl.format(calc.estimativa);

    const riscoBadge = document.getElementById("resRisco");
    riscoBadge.textContent = risco.nivel;
    riscoBadge.className = `risk-badge risk-badge--${risco.classe}`;
    document.getElementById("resRiscoDetalhe").textContent = risco.detalhe;

    document.getElementById("resDecadencia").hidden = !calc.decadenciaPossivel;

    // Link do WhatsApp com resumo da simulação
    const msg =
      `Olá, William. Fiz a simulação no site e gostaria de receber a análise jurídica da minha obra.\n` +
      `Nome: ${nome}\n` +
      `Cidade/UF: ${obra.cidade}/${obra.uf}\n` +
      `Área construída: ${obra.area} m²\n` +
      `Tipo de obra: ${obra.tipoObraLabel}\n` +
      `Ano de início: ${obra.anoInicio}\n` +
      `Estimativa preliminar do INSS: ${brl.format(calc.estimativa)}\n` +
      `Risco fiscal: ${risco.nivel}` +
      (calc.decadenciaPossivel ? `\nObra com possível decadência (mais de 5 anos)` : "");

    document.getElementById("resWhatsBtn").href =
      `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(msg)}`;

    // Exibe o resultado no lugar do formulário
    form.hidden = true;
    card.querySelector(".sim__progress").hidden = true;
    resultBox.hidden = false;
    card.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  /* ---------- Refazer simulação ---------- */

  document.getElementById("resRestart").addEventListener("click", () => {
    resultBox.hidden = true;
    form.hidden = false;
    card.querySelector(".sim__progress").hidden = false;
    form.reset();
    estimativaAtual = null;
    riscoAtual = null;
    showStep(1);
  });
})();
