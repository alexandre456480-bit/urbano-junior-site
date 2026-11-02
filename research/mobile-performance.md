# Otimiza??o de carregamento mobile ? 02/11/2026

Escopo: primeira tela da p?gina inicial, no breakpoint existente de at? 820 px. CSS, conte?do, efeitos, dura??o das anima??es e intervalo de 5 segundos do carrossel foram preservados. Nenhuma publica??o foi realizada.

## Altera??es

- Preload das fontes it?lica e sem serifa e da fotografia principal apenas no mobile.
- Fotos dos pr?ximos slides recebem prioridade baixa no mobile; o aquecimento antecipado aguarda o carregamento inicial e uma janela ociosa. A vers?o desktop mant?m o aquecimento imediato.
- Fotografia PNG do carrossel com alternativa WebP **sem perda**, mantendo dimens?es e pixels: 569.623 ? 294.798 bytes. O desktop continua usando o PNG original.
- Logo do cabe?alho com candidato de 252 ? 252 px para o mobile, suficiente para 84 CSS px em densidade 3x. O arquivo original permanece como candidato para o desktop e densidades superiores.

## Medi??o local

Lighthouse 13.6.0, Chrome headless 156, perfil mobile padr?o, cache frio e limita??o simulada. Tr?s rodadas sequenciais antes/depois; valores abaixo s?o medianas. Baseline: arquivos originais do commit `977aebb`, sem altera??es de CSS ou conte?do.

| M?trica | Antes | Depois |
| --- | ---: | ---: |
| LCP | 9.54 s | 5.58 s |
| Speed Index | 5.19 s | 5.04 s |
| FCP | 2.33 s | 2.34 s |
| CLS | 0 | 0 |

Esses resultados locais n?o s?o diretamente compar?veis aos 5,4 s de LCP e 3,5 s de Speed Index informados no PageSpeed p?blico: servidor, cache e condi??es de execu??o diferem. O ganho local foi de cerca de 41% no LCP; no Speed Index, cerca de 3%. Os valores p?blicos precisam ser medidos novamente ap?s publica??o.

## Preserva??o visual e funcional

- `node research/check-mobile-performance.cjs`: passou em 320, 390, 600, 768, 820, 821 e 1440 px. Geometria e par?metros das anima??es iguais ao baseline; sem overflow ou erros de p?gina/HTTP.
- Menu mobile, filtro de noivas, abertura/fechamento do modal e avan?o autom?tico de slide ap?s 5 segundos passaram.
- Capturas a 1440 px: pixels id?nticos. A 390 px: pixels id?nticos fora da regi?o do logo, cujo arquivo foi redimensionado.
- Compara??o dos pixels decodificados do PNG e do WebP sem perda: id?nticos.
- `node --check dist/script.js` e `git diff --check`: passaram.

Os relat?rios detalhados locais est?o em `research/qa-mobile-before-{1,2,3}.json`, `research/qa-mobile-after-{1,2,3}.json` e `research/qa-mobile-preservation.json` (ignorados pelo Git).

## Reprodu??o

1. Servir o resultado: `python -m http.server 4173 --bind 127.0.0.1 --directory dist`.
2. Servir o baseline: `node research/qa-baseline-server.cjs` (porta 4174).
3. Rodar Lighthouse para cada porta, sequencialmente: `npx --yes lighthouse http://127.0.0.1:4173/ --only-categories=performance --chrome-flags="--headless --no-sandbox" --output=json --output-path=research/qa-mobile-after.json --quiet`.
4. Executar a verifica??o visual/funcional com o servidor 4173 ativo: `node research/check-mobile-performance.cjs`.

`python research/optimize-mobile.py` regenera os dois arquivos mobile a partir dos originais e aplica o markup de forma idempotente. Requer Pillow, j? dispon?vel no ambiente. Os scripts de verifica??o usam o Playwright existente em `research/node_modules` e o Chrome instalado.
