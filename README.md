# Urbano Junior — página inicial

Site estático em HTML, CSS e JavaScript. A pasta `dist/` contém todos os arquivos prontos para hospedagem. Não há framework nem instalação de dependências para servir o site.

## Identidade preservada

A refatoração mantém o HTML, os estilos, as imagens, os textos, os botões e a navegação da hero original. Cormorant Garamond e Manrope continuam sendo servidas localmente, com as licenças OFL em `dist/assets/`. A paleta permanece marfim, greige, pedra, nogueira e mocha. `styles.css` conserva a composição original; `home.css` controla as seções refatoradas abaixo da hero.

Os textos auxiliares das novas seções usam 15–16 px, links de apoio 14 px e rótulos 11–12 px. A hero e o cabeçalho conservam seus tamanhos anteriores.

## Estrutura final

1. Hero original.
2. Principais serviços: criação sob medida, festa e ocasiões especiais, noivas e modelagem para marcas, em grid 2×2 no desktop e empilhados no mobile.
3. Portfólio: seis referências ilustrativas em masonry, seis filtros, visualização em modal e CTA contextual para WhatsApp.
4. Diferencial: processo artesanal acompanhado diretamente por Urbano Junior, com fotografias em arco e perspectiva.
5. Como funciona: quatro etapas em cards translúcidos e CTA central.
6. Localização e contato: mapa do estabelecimento, WhatsApp, Instagram e Facebook.
7. Rodapé: links internos, studio, redes e política de privacidade.

As antigas seções de marcas e perguntas frequentes e o formulário foram retirados da home, conforme o novo briefing. O contato abre diretamente o WhatsApp; nenhuma mensagem é enviada automaticamente.

## Fotografias e edição de conteúdo

As fotografias e os nomes do portfólio são ilustrativos, com aviso visível na seção. O Instagram oficial permite consultar os trabalhos reais. Nenhum retrato de banco de imagens é apresentado como sendo Urbano Junior.

Edite `dist/content/home.json` para substituir `src`, `alt`, título, categoria, descrição, proporção e posição das imagens de serviços, portfólio e carrossel. Os dados de contato e o endereço do mapa estão no mesmo arquivo.

Depois de editar esse JSON, rode:

```powershell
python research/refactor-home.py
```

Esse script atualiza o HTML sem tocar na hero ou no cabeçalho. O conteúdo já está no HTML servido, garantindo leitura e links de contato sem JavaScript. O JSON também alimenta os detalhes do modal; se sua requisição falhar, o modal usa o conteúdo do HTML.

As fontes das novas fotos gratuitas do Pexels estão documentadas em `dist/assets/home-photo-sources.json`. As três fotos originais são do Unsplash. Todas estão em arquivos locais; nenhuma fotografia foi incorporada ao CSS.

## Contatos

- WhatsApp: +55 62 98164-7663.
- Instagram: https://www.instagram.com/urbanojr/
- Google Maps: estabelecimento identificado pelo CID `6007956909621646272`, extraído do link fornecido pelo usuário.
- Endereço: Rua C-146, 220, Jardim América, Goiânia — GO, 74255-170, conforme o mapa enviado nesta refatoração. Esse dado substitui o endereço anterior no HTML e nos metadados.
- Facebook: nome fornecido, “Urbano Jr alta costura”. Enquanto a URL direta não for confirmada, o link abre a busca de páginas por esse nome. Substitua `contact.facebook` pela URL oficial e `facebookIsSearch` por `false` no JSON.

## Interações e acessibilidade

O carrossel em arco percorre uma volta em aproximadamente 150 segundos. Aceita arraste e setas do teclado; pausa ao receber foco, ao passar o mouse, ao sair da tela e quando a aba fica oculta. Possui controle explícito de pausa. No tablet e no celular, usa rolagem horizontal nativa com snap. Movimento reduzido desativa a rotação automática e as entradas editoriais.

Os filtros têm estado anunciado e contagem acessível. O modal possui fechamento por botão, Escape e clique externo, retém o foco e devolve-o ao projeto. Sem JavaScript, cada projeto permite abrir a fotografia diretamente. O menu móvel mantém abertura, fechamento e Escape. O botão flutuante original continua disponível.

Uma H1, cinco seções com H2, H3 em serviços, projetos e etapas, idioma pt-BR, alt editável, dimensões de imagens, lazy loading, fontes locais, metadados e JSON-LD. A política de privacidade é uma página interna simples e está incluída no sitemap. A audiência da hospedagem existente deve ser preservada.

## Prévia e verificação

```powershell
python -m http.server 4173 --bind 127.0.0.1 --directory dist
node research/check-home.cjs
```

O QA utiliza o Playwright já instalado em `research/` e o Chrome local. Compara a geometria e a tipografia do cabeçalho e da hero com a versão anterior em 320, 375, 390, 600, 768, 820, 1024, 1440 e 1920 px. Confere transbordamento, imagens, ordem das seções, filtros, serviços, modal e foco, arraste, teclado, movimento e pausa do carrossel, menu móvel, contatos, página de privacidade e leitura sem JavaScript. Nenhuma mensagem é enviada nos testes. Capturas e resultados de QA são arquivos locais ignorados pelo Git.
