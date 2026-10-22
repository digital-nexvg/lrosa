# LRosa Acessórios

Boutique digital estática feita com HTML, CSS e JavaScript, sem dependências de build. Para testar localmente, abra `index.html` em um navegador ou sirva a pasta com um servidor estático. As páginas funcionam em hospedagem estática; não há checkout, carrinho, login ou backend.

## Cadastro manual de produtos

Você não precisa alterar os componentes do site para adicionar ou atualizar peças. O catálogo fica separado em `assets/js/products.js`; as informações gerais da loja e as coleções ficam em `assets/js/data.js`.

### Adicionar uma peça

1. Abra `assets/js/products.js` em um editor de texto.
2. Copie o conteúdo de `assets/js/modelo-produto.txt` e cole dentro dos colchetes `[` e `]` de `window.LROSA_DATA.products`.
3. Preencha os dados reais. Ao adicionar mais peças, coloque uma vírgula depois do `}` de cada cadastro, exceto o último. Deixe `[]` quando não houver produtos.
4. Crie uma pasta de imagens com o mesmo slug da peça e coloque a foto principal em `principal.webp`.
5. Salve e atualize o navegador. A peça aparecerá no catálogo, na coleção indicada e na página de detalhes. Se `featured` for `true`, também poderá aparecer entre os destaques da home.

Exemplo de organização das fotos:

```text
assets/images/produtos/
  nome-da-peca/
    principal.webp
    detalhe-01.webp
    detalhe-02.webp
```

O cadastro deve usar os caminhos relativos desde a pasta principal do site, por exemplo `assets/images/produtos/nome-da-peca/principal.webp`. Veja [assets/images/produtos/COMO-ORGANIZAR.md](assets/images/produtos/COMO-ORGANIZAR.md) para orientações sobre as fotos.

### Campos do produto

- `id`: identificador único, sem repetir em outras peças.
- `name`: nome mostrado na loja.
- `slug`: nome para a URL, em minúsculas, sem acentos e com hífens. Também dá nome à pasta das fotos.
- `collection`: `prata-925`, `folheados-18k` ou `rosa-by-glasses`.
- `category`: categoria disponível naquela coleção: Prata 925 aceita `Brincos`, `Cordões`, `Pulseiras`, `Anéis`; Folheados 18K aceita essas categorias e `Conjuntos`; Rosa By Glasses usa `Óculos`.
- `price`: preço atual como número, sem `R$` (por exemplo, `89.90`). Use `null` quando ainda não houver preço confirmado.
- `previousPrice`: preço anterior real como número, ou `null`. Só será mostrado como preço anterior quando for maior que o preço atual.
- `shortDescription` e `description`: textos da peça.
- `image`: caminho da foto principal. O arquivo precisa existir.
- `imageAlt`: descrição da foto para leitores de tela.
- `images`: lista opcional de caminhos das fotos adicionais; use `[]` se não houver.
- `featured`: `true` para incluir entre os destaques da home ou `false` para não destacar.
- `available`: `true` para exibir a peça ou `false` para ocultá-la temporariamente.
- `features`: lista opcional de características confirmadas, por exemplo `["Material confirmado"]`; use `[]` se não houver.
- `order`: número para ordenar a peça dentro da listagem; números menores aparecem primeiro.

Para atualizar preço, altere `price` (e `previousPrice` somente se houver preço anterior real). Para retirar temporariamente uma peça, defina `available: false`; não precisa apagar cadastro nem fotos.

## Configuração da loja

Edite `assets/js/data.js`:

- `settings.whatsappNumber`: telefone internacional com DDI e DDD, somente números (por exemplo, `55` + DDD + telefone). Enquanto estiver vazio, os links de consulta não simulam contato e exibem a informação de configuração pendente.
- `settings.instagramUrl`: endereço oficial do Instagram; vazio mantém a indicação de que será configurado.
- `settings.announcement`: mensagem real opcional para a barra superior; vazio não exibe uma barra comercial.

Os destaques da página inicial são derivados de `featured: true`; catálogo, coleções, detalhes e favoritos compartilham a lista em `assets/js/products.js`. URLs de coleção e produto usam parâmetros legíveis, por exemplo `colecao.html?colecao=prata-925` e `produto.html?slug=nome-do-produto`.

## Identidade visual

O nome em texto no cabeçalho é provisório e centralizado no componente comum em `assets/js/app.js`. Quando a logo oficial estiver disponível, substitua o wordmark nesse componente e adicione os arquivos oficiais de logo e favicon. Nenhuma imagem externa de produto é usada.

## Favoritos

Os favoritos são salvos localmente no navegador em `localStorage` e não representam carrinho ou pedido. A lista é específica do navegador/dispositivo usado.
