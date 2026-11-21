# Vitrin: página de vendas

Site estático (HTML + CSS + JavaScript puro). Não precisa instalar nada nem rodar build.

```
index.html   → estrutura e textos das seções
styles.css   → visual (cores, tamanhos, vidro fosco)
script.js    → CONFIG com contatos, preços, planos e dúvidas
animations.js → animações (GSAP + ScrollTrigger + Lenis, carregados por CDN)
assets/      → logos, favicons e imagem de compartilhamento (og-image.png)
               logo-mark.webp e logo-wordmark.webp são os originais em alta;
               o site usa as versões reduzidas (logo-mark-96, logo-wordmark-white/navy)
```

## Editar preços, planos e contatos

Abra `script.js`. Tudo fica no objeto `CONFIG`, no topo do arquivo:

- `whatsapp`: só números, no formato `55` + DDD + número (ex.: `5535984733354`).
- `whatsappDisplay`, `instagram` (sem @) e `email`: aparecem no rodapé.
- `messages`: textos que já vêm escritos quando a pessoa abre o WhatsApp.
- `plans`: para cada plano você pode mudar
  - `cash`: o preço à vista (ex.: `447`);
  - `installments`: número de parcelas e valor de cada uma (ex.: `{ count: 3, value: 149 }`);
  - `features`: a lista de itens;
  - `cta`: o texto do botão;
  - `featured: true`: marca o plano do meio com o selo "Mais escolhido" e o botão branco.
- `plansNote`: o texto pequeno que aparece embaixo dos planos.
- `faq`: as perguntas (`q`) e respostas (`a`).

Os cards de planos e as dúvidas são gerados automaticamente a partir do `CONFIG`.
Os outros textos (hero, benefícios, como funciona etc.) ficam direto no `index.html`.

> Nos links do HTML existe um número de WhatsApp "de reserva" (`href="https://wa.me/..."`),
> usado só se o JavaScript não carregar. Se trocar o número, use Localizar e substituir
> no `index.html` também.

## Publicar no Netlify

**Jeito mais rápido (arrastar e soltar):**
1. Acesse https://app.netlify.com/drop e entre na sua conta.
2. Arraste a pasta inteira do projeto (com `index.html`, `styles.css`, `script.js` e `assets/`).
3. Pronto: o Netlify gera um endereço. Em *Domain management* você pode ligar o seu domínio `.com.br`.

**Com GitHub (atualiza sozinho a cada mudança):**
1. Suba a pasta para um repositório no GitHub.
2. No Netlify: *Add new site → Import an existing project* → escolha o repositório.
3. Deixe *Build command* vazio e *Publish directory* como `.` (raiz).

## Depois de publicar

No `index.html`, troque `content="assets/og-image.png"` pelo endereço completo, por exemplo
`https://seudominio.com.br/assets/og-image.png`. Também vale adicionar
`<meta property="og:url" content="https://seudominio.com.br/">` e
`<link rel="canonical" href="https://seudominio.com.br/">`.
Assim a prévia aparece certinha quando alguém compartilhar o link no WhatsApp.
