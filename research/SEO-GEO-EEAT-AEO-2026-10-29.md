# Auditoria SEO, GEO, E-E-A-T e AEO

Data: 29/10/2026. Escopo: arquivos publicáveis em `dist/`, scripts de geração, configuração Vercel, documentação e consulta HTTP ao domínio. Não foram acessados Search Console, Perfil da Empresa ou painel da hospedagem. Não há medições de tráfego, posições ou Core Web Vitals nesta auditoria.

## Resultado e alterações implementadas

- Domínio canônico adotado: `https://urbanojunior.com/`, sem www.
- Atualizados canonical, Open Graph, imagens sociais e URLs/identificadores dos grafos JSON-LD das oito páginas indexáveis.
- Sitemap com oito URLs canônicas; robots aponta para o novo sitemap.
- Links e Formulário receberam canonical próprio e mantêm `noindex, follow`, fora do sitemap.
- `research/update-schema.py` usa o novo domínio por padrão e atualiza também imagens sociais. O parâmetro `--base-url` continua disponível.
- Criado `dist/llms.txt`, com resumo factual, páginas dos serviços, responsável, localização e contatos. As páginas indexáveis apontam para ele por link alternativo no head.
- Preservados conteúdo visual, navegação, contatos e exclusões de indexação existentes. Não foram adicionados preços, avaliações, credenciais ou horários não confirmados.

## Prioridade imediata: concluir a migração na hospedagem

Consulta pública nesta data: a home em HTTPS sem www, a variante HTTP e o robots sem www terminaram em `https://www.urbanojunior.com/`, com resposta 200. A home pública ainda declarou o domínio anterior no canonical, e o robots público ainda apontou para o sitemap anterior. Portanto, as correções locais ainda precisam ser publicadas.

1. Definir `urbanojunior.com` como domínio principal no provedor, com HTTPS válido, e fazer www redirecionar permanentemente para ele. Hoje a direção observada é inversa. Não foi adicionada regra contrária no código, pois ela poderia criar loop com o redirecionamento atual da plataforma.
2. Publicar `dist/` e conferir home, páginas internas, sitemap, robots e llms no domínio definitivo. O `vercel.json` mantém `cleanUrls` e os redirecionamentos existentes de Noivas.
3. No provedor que controla o endereço anterior, configurar 301/308 de cada caminho antigo para o mesmo caminho no novo domínio, preservando parâmetros. Não enviar todas as URLs para a home. Uma regra deste repositório não controla automaticamente o host antigo em outra plataforma.
4. Manter esses redirecionamentos por pelo menos um ano, conforme orientação do Google. Verificar tanto o domínio antigo quanto o novo no Search Console e solicitar mudança de endereço quando aplicável e permitido pelo acesso ao endereço antigo.
5. Enviar `https://urbanojunior.com/sitemap.xml` ao Search Console; inspecionar as oito URLs, acompanhar canonical escolhido pelo Google, indexação e erros. Atualizar também o endereço do site no Perfil da Empresa, Instagram, Facebook e diretórios reais.

Não há novos domínios antigos nos arquivos publicáveis. A cópia local ignorada `research/home-before.html` e os arquivos compactados de versões anteriores são históricos e não fazem parte de `dist/`; não foram reescritos.

## SEO: base encontrada e oportunidades

A base contém títulos e descrições próprios, uma H1 por página, HTML legível sem JavaScript, páginas específicas para Noivas, Festas, Sob Medida e Alta Costura, imagens locais, galerias, breadcrumbs e entidades conectadas de pessoa, negócio e serviços. Não há necessidade de reformular essa estrutura para trocar de domínio.

| Prioridade | Ação recomendada | Motivo e validação |
| --- | --- | --- |
| Alta | Completar a migração e normalizar www/HTTPS | Evitar sinais contraditórios entre redirecionamento, canonical e sitemap; validar respostas HTTP e Search Console após publicação. |
| Alta | Conferir Perfil da Empresa e consistência de nome, endereço e telefone | A informação local já consta no site. Confirmar categoria, URL, horários reais e fotos no perfil; nada disso foi alterado externamente. |
| Média | Criar página de modelagem para marcas com conteúdo próprio | Atualmente o serviço aponta para `servicos#modelagem`. Uma página pode responder escopo, materiais necessários e entregáveis, após confirmação com o profissional. Evitar páginas artificiais para bairros. |
| Média | Desenvolver estudos de projetos reais | Explicar ocasião, proposta, croqui, escolhas de tecido, provas e acabamento, usando apenas fatos e imagens autorizadas. Vincular cada caso ao serviço correspondente. |
| Média | Medir desempenho móvel antes de otimizar | Usar PageSpeed Insights e dados de campo quando disponíveis. Verificar LCP, INP e CLS; o peso do HTML ou a quantidade de imagens, isoladamente, não prova lentidão. |
| Baixa | Avaliar sitemap de imagens | O acervo visual é relevante. Primeiro confirmar descoberta das imagens e indexação das páginas; depois considerar extensão de imagens no sitemap, se útil. |

## GEO e AEO: respostas e descoberta por IA

GEO se refere aqui à descoberta e uso do conteúdo em respostas generativas; AEO, à clareza de respostas para perguntas específicas. A implementação mais útil é manter conteúdo textual preciso, rastreável e consistente com os dados estruturados. O Google informa que não exige arquivos especiais de IA nem schema específico para suas experiências de busca com IA.

- As quatro páginas de serviço já possuem perguntas frequentes visíveis, extraídas pelo gerador para o JSON-LD. Preservar a correspondência entre resposta pública e schema.
- Revisar perguntas com base nas dúvidas reais recebidas: como agendar, o que levar, como são definidas as provas, o que influencia orçamento e antecedência. Não fixar valores ou prazos sem confirmação.
- Manter respostas diretas na primeira frase e detalhes úteis em seguida. Os trechos devem identificar o serviço e a cidade quando isso acrescentar contexto, sem repetir palavras-chave artificialmente.
- O `llms.txt` é um resumo complementar para sistemas que optem por consultá-lo; não garante leitura, citação ou posicionamento e não substitui robots, sitemap ou páginas públicas.
- Não investir em FAQ apenas para obter rich results. A antiga URL de documentação de FAQ do Google redirecionou para o changelog, que registra a retirada desse recurso em 2026. O conteúdo de perguntas permanece útil para visitantes e compreensão sem depender dessa apresentação na busca.
- Acompanhar consultas e páginas no Search Console. Menções de IA exigem observação própria; não afirmar ganho de GEO sem evidência. O relatório de desempenho do Google inclui acessos de seus recursos de IA no tráfego de busca, sem prometer uma separação que não foi verificada nesta conta.

## E-E-A-T: demonstrar experiência e confiança

O site já identifica Urbano Junior, apresenta croquis, peças e registros de criação e liga publicações de Nicaragua Diseña na página Sobre. O schema associa essas matérias por `subjectOf`/`citation`, preservando a distinção entre publicações e perfis oficiais.

Melhorias recomendadas:

1. Acrescentar relatos de processo assinados pelo profissional, com fotos do croqui à peça e explicação das decisões. Essa evidência é mais útil que adjetivos genéricos.
2. Confirmar dados biográficos antes de ampliar a trajetória: formação, datas, participações e funções devem ter fonte ou confirmação direta.
3. Obter depoimentos reais e autorização de uso; não criar avaliações ou notas no schema sem evidência e sem conferir as regras de elegibilidade.
4. Manter o contato, endereço e condições de atendimento coerentes em todas as presenças oficiais.
5. Revisar informações quando o serviço mudar. Não usar datas de atualização automáticas que sugiram revisão editorial inexistente.

E-E-A-T não deve ser tratado como uma pontuação técnica ou um campo de schema: as ações acima reforçam evidências de experiência, autoria e confiança.

## Verificação realizada

- Dez HTMLs analisados: uma H1 e canonical esperado em cada um.
- Oito URLs únicas no sitemap, todas com página local e sem `noindex`.
- JSON-LD de todas as páginas que o contêm foi interpretado sem erros de JSON.
- Links e Formulário continuam com `noindex, follow`.
- Referências locais de `src`/`href` e âncoras conferidas, sem arquivos ou destinos internos ausentes.
- Sem referências ao host antigo ou a domínios Vercel nos HTMLs publicáveis; referências externas legítimas de mapas, redes, fontes e matérias foram preservadas.
- Não foram feitos deploy, alteração de DNS, acesso ao painel, testes visuais ou medições de produção.

## Fontes primárias consultadas

Consultadas por HTTP em 29/10/2026. A ferramenta de busca estava indisponível; as páginas do Google responderam 200 por acesso direto.

- [Google: migração de site com mudança de URLs](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes)
- [Google: recursos de IA e o site](https://developers.google.com/search/docs/appearance/ai-features)
- [Google: conteúdo útil e confiável, autoria e E-E-A-T](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
- [Google: changelog da documentação de busca](https://developers.google.com/search/updates) — destino observado ao consultar a antiga documentação de FAQ; registra a retirada do recurso e esclarecimentos sobre llms.txt em junho de 2026.

O endereço da proposta `llmstxt.org` respondeu 403 nesta consulta e não foi usado como evidência de eficácia. O arquivo criado segue a estrutura simples de Markdown com título, resumo e links; sua utilidade depende de adoção por cada sistema.
