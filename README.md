# Urbano Junior — página inicial

Site estático em HTML, CSS e JavaScript. A pasta `dist/` contém todos os arquivos prontos para hospedagem. Não há framework nem instalação de dependências para servir o site.

## Página de links e formulário

- `dist/links.html`: página para campanhas e redes sociais, com mini hero, fotografia de alta-costura, logo e cinco links diretos. A apresentação prioriza celulares e mantém uma coluna central no desktop.
- `dist/formulario.html`: solicitação de atendimento com nome, serviço, ocasião, data, detalhes e referência. `dist/formulario.js` valida os campos e apresenta a mensagem para revisão; o botão seguinte abre o WhatsApp de Urbano Junior. O visitante confirma o envio no próprio WhatsApp. Não há banco de dados, envio automático ou persistência local dos dados.
- `dist/links.css` e `dist/formulario.css`: estilos exclusivos das duas páginas, com as fontes locais e a paleta do site. As páginas estão com `noindex, follow`, para uso direto em campanhas sem competir com as páginas de serviços nos resultados de busca.

Com `dist/` servido localmente, acesse `/links.html` e `/formulario.html`. Na Vercel, `cleanUrls` também permite `/links` e `/formulario`. A política de privacidade descreve o funcionamento do formulário. Não foram adicionados pixels de publicidade ou serviços de coleta.

## Identidade preservada

A hero mantém a frase “Sua identidade, desenhada sob medida.”, com tipografia menor. Os demais títulos e textos usam descrições diretas, sem slogans. Cormorant Garamond e Manrope continuam sendo servidas localmente, com as licenças OFL em `dist/assets/`. A hero usa marfim, os serviços usam areia (`#e8dfd2`) e o portfólio usa pedra clara (`#efefeb`). `styles.css` conserva os estilos de base; `home.css` controla os ajustes da hero e das demais seções.

Os textos auxiliares das seções usam 15–16 px, links de apoio 14 px e rótulos 11–12 px. O título da hero usa 52–88 px conforme a largura da tela. O cabeçalho conserva seus tamanhos anteriores.

## Estrutura final

1. Hero com título reduzido.
2. Principais serviços: criação sob medida, festa e ocasiões especiais, noivas e modelagem para marcas, em grid 2×2 no desktop e empilhados no mobile.
3. Portfólio: 57 imagens do acervo em masonry, seis categorias e filtro Todos, exibição progressiva, visualização em modal e CTA contextual para WhatsApp.
4. Diferencial: processo artesanal acompanhado diretamente por Urbano Junior, com fotografias em arco e perspectiva.
5. Como funciona: quatro etapas em cards translúcidos e CTA central.
6. Localização e contato: mapa do estabelecimento, WhatsApp, Instagram e Facebook.
7. Rodapé: links internos, studio, redes e política de privacidade.

As antigas seções de marcas e perguntas frequentes e o formulário foram retirados da home, conforme o novo briefing. O contato abre diretamente o WhatsApp; nenhuma mensagem é enviada automaticamente.

## Fotografias e edição de conteúdo

O portfólio utiliza fotografias e croquis fornecidos nas pastas locais do projeto, selecionados após a revisão das seis pastas de `img/`. Foram retiradas desta seção as referências ilustrativas anteriores. Retratos e encontros sem relação direta com as peças foram mantidos fora da seleção. As outras seções da home não foram alteradas por essa atualização.

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

O QA utiliza o Playwright já instalado em `research/` e o Chrome local. Compara a geometria e a tipografia do cabeçalho com a versão anterior em 320, 375, 390, 600, 768, 820, 1024, 1440 e 1920 px. Confere transbordamento, imagens, ordem das seções, filtros, serviços, modal e foco, arraste, teclado, movimento e pausa do carrossel, menu móvel, contatos, página de privacidade e leitura sem JavaScript. Nenhuma mensagem é enviada nos testes. Capturas e resultados de QA são arquivos locais ignorados pelo Git.


## Páginas de serviços e noivas

`dist/servicos.html` reúne os serviços. `dist/vestidos-de-noiva-sob-medida-em-goiania.html` apresenta o serviço de vestidos de noiva sob medida, as imagens locais de `img/noivas`, organizadas em vestidos, tecidos e processo de criação, sete perguntas frequentes e contatos. Os arquivos `services.css` e `services.js` controlam os cards e o menu expansível; `noivas.css` contém os estilos exclusivos da página de noivas.

O destino de cada card está em `services[].href` no JSON. Noivas abre a página dedicada; os outros serviços mantém o acesso ao portfólio até receberem suas próprias páginas. As novas páginas estão no sitemap e possuem metadados próprios. A página de noivas inclui dados estruturados de serviço, negócio local, navegação e FAQ, com respostas iguais às visíveis na página. Não foram executados testes nem realizadas capturas nesta alteração, conforme solicitado.


## URLs e dados estruturados

A página de noivas está em `/vestidos-de-noiva-sob-medida-em-goiania`, com o arquivo HTML de mesmo nome em `dist/`. O `vercel.json` preserva `cleanUrls` e redireciona permanentemente `/noivas` e `/noivas.html` para essa URL. Links, URLs canônicas, Open Graph, sitemap e identificadores do JSON-LD seguem as URLs sem extensão.

`research/update-schema.py` regenera os schemas e metadados sem alterar o conteúdo visual. Os grafos conectam o negócio local, estilista, site e páginas; a inicial e serviços incluem catálogo e entidades de serviço. A página de noivas inclui serviço, breadcrumbs, galeria e imagens com dimensões, além do FAQ extraído das respostas visíveis. Não são criados horários, coordenadas, avaliações ou preços sem dados confirmados.

O domínio oficial é `https://urbanojunior.com/`. Execute `python research/update-schema.py` para gerar metadados, sitemap e robots com esse domínio. O parâmetro `--base-url` permite uma substituição explícita quando necessária. Após usar o gerador antigo de conteúdo da home, execute novamente esse script para sincronizar os dados estruturados com o HTML atual. Os redirecionamentos dependem de uma hospedagem compatível com a configuração da Vercel.


## Página Sobre

A seção “Referência na Alta Costura” apresenta três imagens selecionadas de `img/altacostura`, com acesso à página dedicada.

## Alta Costura

`dist/alta-costura-em-goiania.html` apresenta criação autoral sob medida em Goiânia. A composição editorial usa imagens de `img/altacostura` copiadas para `dist/assets/altacostura`, além do croqui original de alta costura. Os estilos próprios estão em `dist/alta-costura.css`; a tipografia, navegação, contato e componentes de serviços seguem o site existente.

A página inclui acervo, detalhes das peças, relação entre desenho e criação, etapas do projeto, oito perguntas frequentes e contato do studio. Está vinculada ao menu, rodapé, diretório de serviços, Sobre e Noivas. O gerador `research/update-schema.py` mantém a URL canônica, sitemap, catálogo e entidades de serviço, estilista, negócio local, galeria e FAQ. Os dados das perguntas vêm das respostas visíveis. Não há preços, prazos fixos, avaliações ou certificações inventados.

Conteúdo direto, identificação do responsável e informações locais consistentes seguem as orientações do Google sobre conteúdo útil e buscas com IA: https://developers.google.com/search/docs/fundamentals/ai-optimization-guide e https://developers.google.com/search/docs/fundamentals/creating-helpful-content. A marcação não garante posicionamento nem menções em respostas de IA.

### Acervo do Sobre

Abra `dist/sobre.html` diretamente ou use o link Sobre no menu e no rodapé. A página utiliza croquis e fotografias das pastas `img/croquis`, `img/junior-urbano` e `img/altacostura`, copiados para as respectivas pastas de assets. O acervo é apresentado em galeria de folhas, seleção de alta costura e uma composição do croqui de noiva com a peça. Não foram acrescentados datas de carreira, formação, prêmios ou eventos sem confirmação.

`sobre.css` contém os estilos exclusivos. `sobre.js` controla as entradas ao rolar, os dois carrosséis e a ampliação dos croquis em diálogo. Tudo funciona sem dependências ou requisições de JSON. Com JavaScript desativado, as imagens continuam disponíveis por links e as galerias têm rolagem nativa. A preferência por movimento reduzido é respeitada.

A navegação mantém arquivos `.html` relativos para abertura local. O gerador `research/update-schema.py` inclui a página Sobre, a identidade do estilista, seus desenhos e perguntas sobre o trabalho, além de preservar a página no sitemap. Não foram realizados testes ou capturas de tela nesta alteração.


## Festas e ocasiões especiais

`dist/vestidos-de-festa-sob-medida-em-goiania.html` usa o layout de Noivas, com oito imagens selecionadas após a análise das 17 imagens de `img/outras`. Os arquivos selecionados ficam em `dist/assets/festas/`. A página contém hero, galeria de modelos, registros de modelagem e acabamento, quatro etapas, seis perguntas frequentes e contato. `festas.css` limita os ajustes à nova página e preserva o vestido inteiro na hero desktop.

Os cards existentes na home e em Serviços apontam diretamente para a página. Menu, rodapé, JSON da home, gerador de dados estruturados e sitemap incluem a nova URL. Não houve publicação nem revisão visual no navegador nesta alteração.


### Projetos de festas

A galeria da página de Festas foi ampliada para a seção “Projetos”, com 27 imagens: 12 registros de vestidos, três de modelagem, um detalhe e 11 croquis. A seleção reúne imagens relacionadas ao serviço de `img/outras`, `img/croquis` e `img/altacostura`, sem a jaqueta de alfaiataria nem recortes repetidos da mesma fotografia.

`dist/festas-projetos.js` controla os filtros, a exibição inicial de nove imagens, o botão para mostrar mais e o diálogo com anterior/próxima, setas do teclado e fechamento por Escape. A navegação ampliada percorre todas as imagens da categoria selecionada. Sem JavaScript, todas as imagens e seus links continuam acessíveis. O schema da galeria é gerado a partir das 27 imagens presentes no HTML.


## Criação sob medida

`dist/roupas-sob-medida-em-goiania.html` reutiliza o layout responsivo, os filtros e a ampliação de imagens da página de Festas. O arquivo `sob-medida.css` aplica somente os ajustes desta página; `festas.css` e `festas-projetos.js` continuam compartilhados. A galeria reúne 43 imagens de peças, vestidos, modelagem, detalhes e croquis, com nove imagens iniciais por filtro e acesso progressivo às demais. Sem JavaScript, as imagens e os links permanecem acessíveis.

A palavra-chave principal é “roupas sob medida em Goiânia”, usada no título, descrição, URL canônica, H1, apresentação do serviço e pergunta frequente contextualizada. Os textos explicam escopo, materiais, provas, orçamento, prazos e agendamento, com identificação de Urbano Junior e endereço consistente. A página inclui oito respostas visíveis sincronizadas ao FAQ, entidades de serviço, negócio local, pessoa, website, galeria e breadcrumbs. A URL foi incorporada ao sitemap, menus e cards existentes, sem alterar o design desses cards.

As orientações consultadas foram https://developers.google.com/search/docs/fundamentals/ai-optimization-guide e https://developers.google.com/search/docs/fundamentals/creating-helpful-content. Não há credenciais, avaliações, preços ou prazos fixos inventados. A conferência desta alteração abrangeu estrutura, arquivos, dimensões, links e JSON-LD; não houve revisão visual no navegador nem publicação.


## Portfólio da home: acervo por categoria

A seção mantém título, filtros, masonry, modal e contato. O acervo atual reúne 57 imagens únicas: 13 de Noivas, 11 de Festa, quatro de Sob medida, seis de Alta Costura, 15 Croquis e oito de Modelagem. As categorias se alternam na listagem geral para representar todo o trabalho na primeira visualização. Os cards preservam proporções e cores; não há nomes de arquivos como legendas.

Com JavaScript, a seção mostra inicialmente 12 imagens e permite carregar mais 12 por vez. Os filtros exibem contagens. A ampliação percorre toda a categoria escolhida, inclusive fotos ainda não exibidas no grid, por botões, setas do teclado ou gesto horizontal na imagem. O modal mantém descrição, link para o serviço e contato; Escape e clique fora fecham a ampliação e devolvem o foco. Sem JavaScript, todos os links e imagens estão no HTML.

O JSON `dist/content/home.json` é a fonte do acervo. Para atualizar somente o portfólio e seu modal, execute `python research/portfolio_home.py`; depois execute `python research/update-schema.py` para sincronizar o schema. O gerador completo `research/refactor-home.py` também chama esse renderizador ao finalizar. Não é necessário regenerar as outras seções para editar o portfólio.

A home inclui `ImageGallery` e 57 `ImageObject` derivados dos mesmos dados. Foram conferidos sintaxe JavaScript, arquivos, dimensões, links, âncoras, IDs e consistência entre JSON, cards e schema. A revisão visual no navegador permanece pendente.


### Publicações de Nicaragua Diseña no Sobre

A seção `#publicacoes` reúne três links oficiais: a apresentação da coleção “Infinitas Posibilidades”, a cobertura das passarelas internacionais de 2022 e a notícia de lançamento que registra o workshop de Urbano Junior para designers e estudantes da Escuela Creativa. O texto resume a coleção em jeans e detalhes feitos à mão, conforme as fontes, sem acrescentar prêmios ou credenciais. Os cards abrem as publicações externas em nova aba e se empilham no mobile. O schema do Sobre deriva as citações dos links visíveis e as associa ao perfil por `subjectOf`, sem tratar matérias como perfis `sameAs`.

Fontes analisadas em 23/10/2026:
- https://www.nicaraguadisena.com/portfolio-item/urbano-junior-coleccion-infinitas-posibilidades/
- https://www.nicaraguadisena.com/15-disenadores-de-moda-internacionales-en-pasarela-de-nicaragua-disena-2022/
- https://www.nicaraguadisena.com/nicaragua-disena-celebrara-su-11ma-edicion-proyectando-lo-mejor-del-diseno-arte-y-moda/

A página da coleção foi lida diretamente via HTTP após falha de cache na ferramenta de pesquisa; o servidor retornou 200. As duas notícias foram consultadas no site oficial. A verificação local abrangeu a estrutura HTML e o JSON-LD; a aparência no navegador não foi revisada.


## Domínio oficial, IA e auditoria de SEO

O domínio canônico é `https://urbanojunior.com/`, sem www. O arquivo `dist/llms.txt` resume o conteúdo real e os contatos para sistemas de IA que consultem esse formato; ele não garante indexação, citações ou posicionamento. Atualize-o quando os serviços, contatos ou URLs mudarem.

Após qualquer gerador de conteúdo, execute `python research/update-schema.py`. Links e Formulário permanecem com `noindex, follow` e não entram no sitemap.

A auditoria e as prioridades estão em [research/SEO-GEO-EEAT-AEO-2026-10-29.md](research/SEO-GEO-EEAT-AEO-2026-10-29.md). Na consulta pública de 29/10/2026, o domínio sem www ainda redirecionava para www e o conteúdo publicado declarava o host antigo. Ajuste o domínio principal no provedor junto com a publicação, evitando regras de redirecionamento em direções opostas. Redirecionar o endereço antigo exige configuração no provedor que controla esse endereço.
