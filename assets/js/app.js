(function () {
  "use strict";

  const data = window.LROSA_DATA;
  const products = data.products;
  const collections = data.collections;
  const page = document.body.dataset.page;
  const favoritesKey = "lrosa-favorites";
  const catalogUrl = "catalogo.html";
  const collectionUrl = (id) => `colecao.html?colecao=${encodeURIComponent(id)}`;

  function readFavorites() {
    try {
      const stored = window.localStorage.getItem(favoritesKey);
      const ids = stored ? JSON.parse(stored) : [];
      if (!Array.isArray(ids) || !ids.every((id) => typeof id === "string")) {
        throw new TypeError("O formato salvo para os favoritos é inválido.");
      }
      return { ids, error: null };
    } catch (error) {
      console.error("Não foi possível carregar os favoritos.", error);
      return { ids: [], error };
    }
  }

  function saveFavorites(ids) {
    try {
      window.localStorage.setItem(favoritesKey, JSON.stringify(ids));
      return null;
    } catch (error) {
      console.error("Não foi possível salvar os favoritos.", error);
      return error;
    }
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[character]);
  }

  function normalize(value) {
    return String(value ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("pt-BR")
      .trim();
  }

  function formatPrice(price) {
    if (typeof price !== "number" || !Number.isFinite(price)) return "";
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(price);
  }

  function getCollection(id) {
    return collections.find((collection) => collection.id === id);
  }

  function whatsappUrl(message) {
    const phone = data.settings.whatsappNumber.replace(/\D/g, "");
    if (!phone) return null;
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  }

  function productWhatsappUrl(product) {
    const price = formatPrice(product.price);
    const message = `Olá! Vim pelo site da LRosa Acessórios e gostaria de saber mais sobre o produto ${product.name}${price ? `, no valor de ${price}` : ""}. Ele está disponível?`;
    return whatsappUrl(message);
  }

  function currentCollection() {
    const params = new URLSearchParams(window.location.search);
    return getCollection(params.get("colecao")) || collections[0];
  }

  function icon(name) {
    const paths = {
      search: '<circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.2 4.2"/>',
      heart: '<path d="M20.4 8.7c0 5.1-8.4 10.1-8.4 10.1S3.6 13.8 3.6 8.7a4.4 4.4 0 0 1 8.4-1.8 4.4 4.4 0 0 1 8.4 1.8Z"/>',
      menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
      arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
      whatsapp: '<path d="M20.1 11.5a8.6 8.6 0 0 1-12.7 7.6L3 20l.9-4.2a8.6 8.6 0 1 1 16.2-4.3Z"/><path d="M8 7.8c.2-.5.5-.5.8-.5h.5c.2 0 .4.1.5.4l.7 1.7c.1.2.1.4-.1.6l-.5.6c-.2.2-.2.4-.1.6.4.8 1.1 1.5 1.9 1.9.2.1.4.1.6-.1l.7-.8c.2-.2.4-.2.6-.1l1.6.8c.2.1.4.2.4.4 0 .3-.2 1.1-.7 1.5-.5.5-1.2.7-1.9.6-1.1-.2-2.3-.8-3.5-1.9-1.5-1.3-2.4-2.9-2.6-3.9-.2-.8 0-1.4.4-1.8Z"/>'
    };
    return `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${paths[name]}</svg>`;
  }

  function header() {
    const activeCollection = page === "collection" ? currentCollection().id : "";
    const links = [
      { label: "Início", href: "index.html", active: page === "home" },
      { label: "Prata 925", href: collectionUrl("prata-925"), active: activeCollection === "prata-925" },
      { label: "Folheados 18K", href: collectionUrl("folheados-18k"), active: activeCollection === "folheados-18k" },
      { label: "Rosa By Glasses", href: collectionUrl("rosa-by-glasses"), active: activeCollection === "rosa-by-glasses" },
      { label: "Catálogo", href: catalogUrl, active: page === "catalog" },
      { label: "Cupom promocional", href: "cupons.html", active: page === "coupons" }
    ];
    const favoriteState = readFavorites();
    const headerNode = document.getElementById("site-header");
    headerNode.innerHTML = `
      ${data.settings.announcement ? `<div class="announcement">${escapeHtml(data.settings.announcement)}</div>` : ""}
      <header class="site-header">
        <div class="header-inner">
          <a class="wordmark" href="index.html" aria-label="${escapeHtml(data.settings.brand)} — início">
            <img class="wordmark-image" src="assets/images/logo.jpg" alt="LRosa Acessórios">
          </a>
          <button class="menu-toggle icon-button" type="button" aria-label="Abrir menu" aria-expanded="false" aria-controls="main-nav">${icon("menu")}</button>
          <nav class="main-nav" id="main-nav" aria-label="Menu principal">
            ${links.map((item) => `<a href="${item.href}"${item.active ? ' aria-current="page"' : ""}>${item.label}</a>`).join("")}
          </nav>
          <div class="header-actions">
            <form class="header-search" role="search" action="${catalogUrl}">
              <label class="visually-hidden" for="header-query">Buscar produtos</label>
              <input id="header-query" type="search" name="q" placeholder="Buscar peças" autocomplete="off">
              <button class="icon-button" type="submit" aria-label="Buscar">${icon("search")}</button>
            </form>
            <a class="favorites-link" href="favoritos.html" aria-label="Favoritos, ${favoriteState.ids.length} itens">
              ${icon("heart")}<span>Favoritos</span><span class="favorite-count" aria-live="polite">${favoriteState.ids.length}</span>
            </a>
          </div>
        </div>
      </header>`;
  }

  function footer() {
    document.getElementById("site-footer").innerHTML = `
      <footer class="site-footer">
        <div class="footer-inner">
          <div class="footer-brand">
            <a class="wordmark wordmark-footer" href="index.html" aria-label="${escapeHtml(data.settings.brand)} — início"><img class="wordmark-image" src="assets/images/logo.jpg" alt="LRosa Acessórios"></a>
            <p>Uma boutique digital para descobrir peças que combinam com você.</p>
          </div>
          <div class="footer-column">
            <h2>Explore</h2>
            <a href="${catalogUrl}">Catálogo</a>
            ${collections.map((item) => `<a href="${collectionUrl(item.id)}">${escapeHtml(item.name)}</a>`).join("")}
            <a href="cupons.html">Cupom promocional</a>
          </div>
          <div class="footer-column">
            <h2>Fale com a gente</h2>
            ${data.settings.instagramUrl ? `<a href="${escapeHtml(data.settings.instagramUrl)}" target="_blank" rel="noopener noreferrer">@lrosa.acessorios</a>` : '<span class="muted">Instagram em breve</span>'}
            ${data.settings.whatsappNumber ? `<a href="${whatsappUrl(`Olá! Vim pelo site da ${data.settings.brand} e gostaria de conversar.`)}" target="_blank" rel="noopener noreferrer">WhatsApp</a>` : '<span class="muted">WhatsApp em configuração</span>'}
            <a href="politicas.html">Políticas da loja</a>
          </div>
        </div>
        <div class="footer-bottom"><span>© ${new Date().getFullYear()} ${escapeHtml(data.settings.brand)}</span><span>Feito para descobrir com calma.</span></div>
      </footer>`;
  }

  function card(product, favoriteIds) {
    const collection = getCollection(product.collection);
    const isFavorite = favoriteIds.includes(product.id);
    const price = formatPrice(product.price);
    const image = product.image
      ? `<img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.imageAlt || product.name)}" loading="lazy">`
      : '<span class="image-placeholder" aria-hidden="true">L<span>R</span></span>';
    return `<article class="product-card">
      <div class="product-image">${image}<button class="favorite-toggle${isFavorite ? " is-favorite" : ""}" type="button" data-favorite="${escapeHtml(product.id)}" aria-pressed="${isFavorite}" aria-label="${isFavorite ? "Remover" : "Adicionar"} ${escapeHtml(product.name)} ${isFavorite ? "dos" : "aos"} favoritos">${icon("heart")}</button></div>
      <div class="product-card-copy">
        ${collection ? `<p class="eyebrow">${escapeHtml(collection.name)}</p>` : ""}
        <h3><a href="produto.html?slug=${encodeURIComponent(product.slug)}">${escapeHtml(product.name)}</a></h3>
        ${price ? `<p class="product-price">${price}</p>` : ""}
        <a class="text-link" href="produto.html?slug=${encodeURIComponent(product.slug)}">Ver detalhes ${icon("arrow")}</a>
      </div>
    </article>`;
  }

  function emptyState(title, message, actionLabel, actionHref) {
    return `<section class="empty-state">
      <span class="empty-mark" aria-hidden="true">L</span>
      <p class="eyebrow">Um espaço à sua espera</p>
      <h2>${escapeHtml(title)}</h2>
      <p>${escapeHtml(message)}</p>
      ${actionLabel ? `<a class="button button-outline" href="${actionHref}">${escapeHtml(actionLabel)}</a>` : ""}
    </section>`;
  }

  function renderHome(root) {
    const featured = products
      .filter((product) => product.featured && product.available !== false)
      .sort((a, b) => (a.featuredOrder ?? 0) - (b.featuredOrder ?? 0))
      .slice(0, 4);
    root.innerHTML = `
      <section class="hero">
        <div class="hero-copy">
          <p class="eyebrow">LRosa Acessórios</p>
          <h1>Detalhes que<br><em>falam por você.</em></h1>
          <p>Encontre acessórios para expressar seu estilo, com uma curadoria feita para acompanhar a sua história.</p>
          <a class="button button-dark" href="${catalogUrl}">Explorar coleções ${icon("arrow")}</a>
        </div>
        <div class="hero-art">
          <img class="hero-image" src="assets/images/home.jpg" alt="Acessórios delicados sobre uma composição em tons de rosa" fetchpriority="high">
        </div>
      </section>
      <section class="section-block collections-section">
        <div class="section-heading"><div><p class="eyebrow">Escolha seu universo</p><h2>Coleções</h2></div><a class="text-link" href="${catalogUrl}">Ver catálogo ${icon("arrow")}</a></div>
        <div class="collection-grid">
          ${collections.map((collection, index) => `<a class="collection-card collection-card-${index + 1}" href="${collectionUrl(collection.id)}"><span class="collection-index">0${index + 1}</span><span class="collection-card-name">${escapeHtml(collection.name)}</span><span class="collection-card-arrow">${icon("arrow")}</span></a>`).join("")}
        </div>
      </section>
      <section class="section-block featured-section">
        <div class="section-heading"><div><p class="eyebrow">Com carinho, para você</p><h2>Destaques da LRosa</h2></div><a class="text-link" href="${catalogUrl}">Descobrir todas as peças ${icon("arrow")}</a></div>
        ${featured.length ? `<div class="product-grid">${featured.map((product) => card(product, readFavorites().ids)).join("")}</div>` : emptyState("Nossa vitrine está sendo preparada.", "Em breve, você poderá conhecer por aqui as peças selecionadas pela LRosa. Nenhum produto está disponível para compra neste momento.", "Conhecer as coleções", collectionUrl("prata-925"))}
      </section>
      <section class="section-block categories-section">
        <div class="section-heading"><div><p class="eyebrow">Encontre o que combina com você</p><h2>Explore por categoria</h2></div></div>
        <div class="category-list">${["Brincos", "Cordões", "Pulseiras", "Anéis", "Conjuntos"].map((category) => `<a href="${catalogUrl}?categoria=${encodeURIComponent(category)}">${escapeHtml(category)} ${icon("arrow")}</a>`).join("")}</div>
      </section>
      <section class="story-band">
        <p class="eyebrow">LRosa Acessórios</p><h2>Um jeito especial de<br><em>escolher o que é seu.</em></h2>
        <p>Uma boutique digital feita para você conhecer cada detalhe e conversar diretamente com a Leilane sobre as peças.</p>
        <a class="button button-light" href="${catalogUrl}">Conhecer o catálogo ${icon("arrow")}</a>
      </section>
      <section class="contact-strip"><div><p class="eyebrow">Atendimento próximo</p><h2>Vamos encontrar sua próxima favorita?</h2></div>${data.settings.whatsappNumber ? `<a class="button button-dark" target="_blank" rel="noopener noreferrer" href="${whatsappUrl(`Olá! Vim pelo site da ${data.settings.brand} e gostaria de conhecer as peças.`)}">Conversar pelo WhatsApp ${icon("arrow")}</a>` : '<p class="muted">O contato pelo WhatsApp estará disponível assim que o número da loja for configurado.</p>'}</section>`;
  }

  function renderCatalog(root, collection) {
    const params = new URLSearchParams(window.location.search);
    const selectedCollection = collection?.id || params.get("colecao") || "";
    const availableProducts = products.filter((product) => product.available !== false);
    const scopedProducts = availableProducts.filter((product) => !selectedCollection || product.collection === selectedCollection);
    const scopedCollection = getCollection(selectedCollection);
    const categories = scopedCollection ? scopedCollection.categories : [...new Set(scopedProducts.map((product) => product.category))].sort();
    const hasPrices = scopedProducts.some((product) => typeof product.price === "number");
    const selectedCategory = params.get("categoria") || "";
    root.innerHTML = `
      <section class="page-intro">
        <p class="eyebrow">${scopedCollection ? "Nossa curadoria" : "Descubra a LRosa"}</p>
        <h1>${scopedCollection ? escapeHtml(scopedCollection.name) : "Catálogo"}</h1>
        <p>${scopedCollection ? escapeHtml(scopedCollection.description) : "Explore as peças disponíveis e encontre aquela que tem tudo a ver com você."}</p>
      </section>
      <section class="catalog-section" aria-labelledby="catalog-heading">
        <h2 class="visually-hidden" id="catalog-heading">Produtos e filtros</h2>
        <form class="filters" id="catalog-filters">
          <label class="filter-search">Buscar por nome<input type="search" name="q" value="${escapeHtml(params.get("q") || "")}" placeholder="Ex.: brinco delicado"></label>
          ${!scopedCollection ? `<label>Coleção<select name="colecao"><option value="">Todas as coleções</option>${collections.map((item) => `<option value="${item.id}"${selectedCollection === item.id ? " selected" : ""}>${escapeHtml(item.name)}</option>`).join("")}</select></label>` : ""}
          ${categories.length ? `<label>Categoria<select name="categoria"><option value="">Todas as categorias</option>${categories.map((item) => `<option value="${escapeHtml(item)}"${selectedCategory === item ? " selected" : ""}>${escapeHtml(item)}</option>`).join("")}</select></label>` : ""}
          ${hasPrices ? `<label>Preço mínimo<input name="min" type="number" min="0" step="0.01" inputmode="decimal" value="${escapeHtml(params.get("min") || "")}" placeholder="R$"></label><label>Preço máximo<input name="max" type="number" min="0" step="0.01" inputmode="decimal" value="${escapeHtml(params.get("max") || "")}" placeholder="R$"></label>` : ""}
          <label>Ordenar por<select name="ordem"><option value="">Relevância</option><option value="menor"${params.get("ordem") === "menor" ? " selected" : ""}>Menor preço</option><option value="maior"${params.get("ordem") === "maior" ? " selected" : ""}>Maior preço</option><option value="nome"${params.get("ordem") === "nome" ? " selected" : ""}>Nome</option></select></label>
          <button class="button button-outline filter-clear" type="reset">Limpar filtros</button>
        </form>
        <p class="result-count" id="result-count" aria-live="polite"></p>
        <div id="catalog-results" class="product-grid"></div>
      </section>`;

    const form = root.querySelector("#catalog-filters");
    const results = root.querySelector("#catalog-results");
    const count = root.querySelector("#result-count");
    function updateResults() {
      const values = new FormData(form);
      let filtered = availableProducts.filter((product) => {
        const effectiveCollection = values.get("colecao") || selectedCollection;
        const inCollection = !effectiveCollection || product.collection === effectiveCollection;
        const inCategory = !values.get("categoria") || product.category === values.get("categoria");
        const matchesName = normalize(product.name).includes(normalize(values.get("q")));
        const aboveMin = !values.get("min") || (typeof product.price === "number" && product.price >= Number(values.get("min")));
        const belowMax = !values.get("max") || (typeof product.price === "number" && product.price <= Number(values.get("max")));
        return inCollection && inCategory && matchesName && aboveMin && belowMax;
      });
      filtered.sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity));
      const sort = values.get("ordem");
      if (sort === "menor") filtered.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
      if (sort === "maior") filtered.sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity));
      if (sort === "nome") filtered.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
      count.textContent = `${filtered.length} ${filtered.length === 1 ? "produto encontrado" : "produtos encontrados"}`;
      results.innerHTML = filtered.length
        ? filtered.map((product) => card(product, readFavorites().ids)).join("")
        : `<div class="catalog-empty">${emptyState("Nenhuma peça encontrada.", "Tente ajustar sua busca ou volte em breve para conhecer as novidades da LRosa.", "Limpar filtros", "#")}</div>`;
    }
    form.addEventListener("input", updateResults);
    form.addEventListener("change", (event) => {
      if (event.target.name === "colecao" && !scopedCollection) {
        const next = event.target.value;
        window.location.href = next ? collectionUrl(next) : catalogUrl;
        return;
      }
      updateResults();
    });
    form.addEventListener("reset", () => window.setTimeout(updateResults));
    results.addEventListener("click", (event) => {
      const clear = event.target.closest(".catalog-empty .button");
      if (clear) {
        event.preventDefault();
        form.reset();
        form.querySelector('[name="q"]').value = "";
        form.querySelector('[name="categoria"]')?.value && (form.querySelector('[name="categoria"]').value = "");
        updateResults();
      }
    });
    updateResults();
  }

  function renderCollection(root) {
    const collection = currentCollection();
    document.title = `${collection.name} | LRosa Acessórios`;
    const meta = document.querySelector('meta[name="description"]');
    meta?.setAttribute("content", collection.description);
    if (collection.id === "rosa-by-glasses") {
      root.innerHTML = `<section class="collection-preparing"><p class="eyebrow">${escapeHtml(collection.name)}</p><h1>Um novo olhar<br><em>está chegando.</em></h1><p>${escapeHtml(collection.description)} No momento, ainda não temos produtos cadastrados nesta coleção.</p><a class="button button-dark" href="${catalogUrl}">Conhecer as outras coleções ${icon("arrow")}</a></section>`;
      return;
    }
    renderCatalog(root, collection);
  }

  function renderProduct(root) {
    const slug = new URLSearchParams(window.location.search).get("slug");
    const product = products.find((item) => item.slug === slug && item.available !== false);
    if (!product) {
      root.innerHTML = `<section class="page-intro"><p class="eyebrow">LRosa Acessórios</p><h1>Esta peça ainda não está disponível.</h1><p>O produto pode ter sido removido ou o endereço não está correto.</p><a class="button button-outline" href="${catalogUrl}">Voltar ao catálogo</a></section>`;
      return;
    }
    const collection = getCollection(product.collection);
    const price = formatPrice(product.price);
    const favoriteIds = readFavorites().ids;
    const wa = productWhatsappUrl(product);
    const allImages = [...new Set([product.image, ...(product.images || [])].filter(Boolean))];
    document.title = `${product.name} | LRosa Acessórios`;
    document.querySelector('meta[name="description"]')?.setAttribute("content", product.shortDescription || product.description || product.name);
    root.innerHTML = `
      <nav class="breadcrumbs" aria-label="Navegação estrutural"><a href="index.html">Início</a><span>/</span><a href="${collectionUrl(product.collection)}">${escapeHtml(collection?.name || "Coleção")}</a><span>/</span><span aria-current="page">${escapeHtml(product.name)}</span></nav>
      <section class="product-detail">
        <div class="detail-gallery">${allImages.length ? allImages.map((image, index) => `<img src="${escapeHtml(image)}" alt="${escapeHtml(index === 0 ? product.imageAlt || product.name : `${product.name} — imagem ${index + 1}`)}" ${index ? 'loading="lazy"' : ""}>`).join("") : '<div class="product-image detail-placeholder"><span class="image-placeholder" aria-hidden="true">L<span>R</span></span></div>'}</div>
        <div class="detail-copy"><p class="eyebrow">${escapeHtml(collection?.name || "")}${product.category ? ` · ${escapeHtml(product.category)}` : ""}</p>
          <h1>${escapeHtml(product.name)}</h1>${price ? `<p class="detail-price">${price}${typeof product.previousPrice === "number" && product.previousPrice > product.price ? `<span class="old-price">${formatPrice(product.previousPrice)}</span>` : ""}</p>` : ""}
          ${product.shortDescription ? `<p class="detail-short">${escapeHtml(product.shortDescription)}</p>` : ""}
          ${product.description ? `<div class="detail-description"><h2>Sobre a peça</h2><p>${escapeHtml(product.description)}</p></div>` : ""}
          ${product.features?.length ? `<div class="detail-description"><h2>Características</h2><ul>${product.features.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></div>` : ""}
          ${wa ? `<a class="button button-dark button-wide" href="${wa}" target="_blank" rel="noopener noreferrer">Consultar pelo WhatsApp ${icon("arrow")}</a>` : '<p class="setup-note">O WhatsApp da loja ainda será configurado. Entre em contato assim que os dados da loja estiverem disponíveis.</p>'}
          <button class="button button-outline button-wide favorite-detail${favoriteIds.includes(product.id) ? " is-favorite" : ""}" type="button" data-favorite="${escapeHtml(product.id)}" aria-pressed="${favoriteIds.includes(product.id)}">${icon("heart")} ${favoriteIds.includes(product.id) ? "Remover dos favoritos" : "Salvar nos favoritos"}</button>
        </div>
      </section>`;
  }

  function renderFavorites(root) {
    const state = readFavorites();
    const saved = products.filter((product) => state.ids.includes(product.id) && product.available !== false);
    root.innerHTML = `<section class="page-intro"><p class="eyebrow">Sua seleção pessoal</p><h1>Favoritos</h1><p>Guarde por aqui as peças que chamaram a sua atenção. Seus favoritos ficam salvos neste navegador.</p></section>
      ${state.error ? '<p class="storage-warning" role="alert">Não foi possível acessar os favoritos salvos neste navegador. Verifique as configurações de armazenamento e tente novamente.</p>' : ""}
      ${saved.length ? `<section class="product-grid favorites-grid">${saved.map((product) => card(product, state.ids)).join("")}</section>` : emptyState("Ainda não há favoritos salvos.", "Quando você salvar uma peça, ela aparecerá aqui para consultar com calma.", "Explorar o catálogo", catalogUrl)}`;
  }

  function renderCoupons(root) {
    root.innerHTML = `<section class="coupon-page"><div class="coupon-seal" aria-hidden="true">L<span>R</span></div><p class="eyebrow">Um carinho da LRosa</p><h1>Um mimo especial está sendo preparado para você.</h1><p>No momento, não temos cupons promocionais disponíveis. Em breve, você poderá encontrar condições especiais por aqui.</p><a class="button button-dark" href="index.html">Voltar para a loja ${icon("arrow")}</a><a class="text-link" href="${collectionUrl("prata-925")}">Conhecer as coleções</a></section>`;
  }

  function renderPolicies(root) {
    const pending = "As condições oficiais desta política serão publicadas após confirmação da proprietária da loja.";
    root.innerHTML = `<section class="page-intro"><p class="eyebrow">Informações da loja</p><h1>Políticas</h1><p>Estamos organizando as informações para que você possa consultar com clareza antes de falar com a LRosa.</p></section>
      <section class="policy-list">
        <article id="privacidade"><p class="eyebrow">01</p><h2>Privacidade</h2><p>${pending}</p></article>
        <article id="trocas"><p class="eyebrow">02</p><h2>Trocas e devoluções</h2><p>${pending}</p></article>
        <article id="entrega"><p class="eyebrow">03</p><h2>Entregas</h2><p>${pending}</p></article>
      </section>`;
  }

  function refreshFavoriteControls() {
    const state = readFavorites();
    document.querySelectorAll("[data-favorite]").forEach((button) => {
      const active = state.ids.includes(button.dataset.favorite);
      button.classList.toggle("is-favorite", active);
      button.setAttribute("aria-pressed", String(active));
      if (button.classList.contains("favorite-detail")) button.innerHTML = `${icon("heart")} ${active ? "Remover dos favoritos" : "Salvar nos favoritos"}`;
      else button.setAttribute("aria-label", `${active ? "Remover" : "Adicionar"} ${button.closest(".product-card")?.querySelector("h3")?.textContent || "produto"} ${active ? "dos" : "aos"} favoritos`);
    });
    document.querySelectorAll(".favorite-count").forEach((count) => { count.textContent = String(state.ids.length); });
  }

  function bindGlobalEvents() {
    const menuToggle = document.querySelector(".menu-toggle");
    menuToggle?.addEventListener("click", () => {
      const expanded = menuToggle.getAttribute("aria-expanded") === "true";
      menuToggle.setAttribute("aria-expanded", String(!expanded));
      menuToggle.setAttribute("aria-label", expanded ? "Abrir menu" : "Fechar menu");
      document.querySelector(".main-nav")?.classList.toggle("is-open", !expanded);
    });
    const searchForm = document.querySelector(".header-search");
    const searchInput = searchForm?.querySelector('input[type="search"]');
    searchForm?.querySelector("button")?.addEventListener("click", (event) => {
      if (window.matchMedia("(max-width: 900px)").matches && !searchForm.classList.contains("search-open")) {
        event.preventDefault();
        searchForm.classList.add("search-open");
        searchInput?.focus();
      }
    });
    document.addEventListener("click", (event) => {
      const button = event.target.closest("[data-favorite]");
      if (!button) return;
      const state = readFavorites();
      if (state.error) {
        showNotice("Não foi possível acessar os favoritos neste navegador.");
        return;
      }
      const id = button.dataset.favorite;
      const next = state.ids.includes(id) ? state.ids.filter((savedId) => savedId !== id) : [...state.ids, id];
      const error = saveFavorites(next);
      if (error) {
        showNotice("Não foi possível salvar a alteração. Verifique o armazenamento do navegador.");
        return;
      }
      refreshFavoriteControls();
      if (page === "favorites") renderFavorites(document.querySelector(".page-content"));
      showNotice(next.includes(id) ? "Peça adicionada aos favoritos." : "Peça removida dos favoritos.");
    });
  }

  function showNotice(message) {
    let notice = document.getElementById("site-notice");
    if (!notice) {
      notice = document.createElement("div");
      notice.id = "site-notice";
      notice.className = "site-notice";
      notice.setAttribute("role", "status");
      document.body.append(notice);
    }
    notice.textContent = message;
    notice.classList.add("is-visible");
    window.clearTimeout(showNotice.timeout);
    showNotice.timeout = window.setTimeout(() => notice.classList.remove("is-visible"), 2600);
  }

  function whatsappFloat() {
    const url = whatsappUrl(`Olá! Vim pelo site da ${data.settings.brand} e gostaria de conhecer as peças.`);
    if (!url) return;
    const link = document.createElement("a");
    link.className = "whatsapp-float";
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("aria-label", "Conversar com a LRosa pelo WhatsApp");
    link.innerHTML = `${icon("whatsapp")}<span class="whatsapp-float-copy"><strong>Fale com a gente</strong><small>Estamos no WhatsApp</small></span>`;
    document.body.append(link);
  }

  const root = document.querySelector(".page-content");
  header();
  footer();
  whatsappFloat();
  bindGlobalEvents();
  if (page === "home") renderHome(root);
  if (page === "catalog") renderCatalog(root);
  if (page === "collection") renderCollection(root);
  if (page === "product") renderProduct(root);
  if (page === "favorites") renderFavorites(root);
  if (page === "coupons") renderCoupons(root);
  if (page === "policies") renderPolicies(root);
})();
