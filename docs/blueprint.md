# **App Name**: PromptPerfectAI

## Core Features:

- Refinamento de Prompt: Ferramenta de refinamento de prompt com tecnologia de IA usando Gemini 2.5 Pro, reescrevendo automaticamente os prompts do usuário para serem mais claros, específicos e eficazes para gerar imagens realistas por meio da ferramenta Imagen. O foco está em detalhes extremos, imperfeições realistas e evitar erros fisicamente impossíveis. Esta é uma ferramenta de IA que raciocina sobre melhorias de prompt.
- Entrada de Prompt: Campo de entrada de texto para o usuário inserir o prompt inicial, por exemplo, 'mulher bonita, realista, tirando selfie na academia'.
- Comparação de Prompt: Exibição do prompt original do usuário junto com o prompt refinado gerado por IA para comparação, destacando os detalhes adicionados e os ajustes focados no realismo.
- Visualização de Saída de Imagem: Janela de exibição para visualizar a saída de geração de imagem, aprimorada com detalhes e imperfeições realistas.
- Aprimoramento de Imagem: Integração com Canva e Konva.js para ajustes de imagem pós-geração, aplicando filtros e outros aprimoramentos para refinar ainda mais a 'perfeição imperfeita' da imagem.
- Feedback e Avaliação do Usuário: Sistema de avaliação do usuário (1-5 estrelas com precisão decimal, por exemplo, 3,5) e feedback escrito para cada imagem gerada. Um campo de texto permite a entrada numérica direta, visualmente representada com estrelas parcialmente preenchidas.
- Ajuste de Parâmetros de Imagem: Sliders interativos para ajustar vários aspectos técnicos da imagem. A IA apresenta seus valores inicialmente usados ao usuário, que pode então manipular esses filtros e fornecer feedback sobre os resultados para auto-aprimoramento. A IA usa o feedback para ajustar os sliders. Esta é uma ferramenta de IA que raciocina sobre ajustes de slider.
- Auto-Aprimoramento de IA: Análise automatizada de feedback e auto-aprimoramento: A IA analisa o feedback do usuário, gera prompts aprimorados e atualiza automaticamente seus modelos internos no Firebase Studio para aprimorar o realismo futuro da imagem. Esta é uma ferramenta de IA que raciocina sobre o auto-aprimoramento.
- Autenticação de Usuário: Autenticação e autorização de usuário para gerenciar o acesso e personalizar a experiência. Firebase Auth (gratuito até 50k usuários)
- Gerenciamento de Assinatura: Sistema de assinatura e pagamento para gerenciar o acesso do usuário e fornecer diferentes níveis de serviço. Stripe Payment Links (sem código backend)
- Rastreamento de Uso: Rastreamento de uso e aplicação de cota para controlar o uso de recursos e evitar abusos.
- Moderação de Conteúdo: Implementar um sistema de moderação de conteúdo para garantir que as imagens geradas estejam em conformidade com as políticas de uso e diretrizes da comunidade, evitando a criação de conteúdo ofensivo, prejudicial ou ilegal.
- Suporte ao Usuário: Oferecer suporte técnico abrangente para os usuários, incluindo documentação detalhada, tutoriais e canais de comunicação para solucionar dúvidas e problemas relacionados ao uso da ferramenta.
- Página de Lançamento: Página para recurso de 'fumaça' para o usuário inserir o e-mail e ser informado quando a ferramenta for lançada.
- Sistema de Email Marketing: Adicionar um sistema de email marketing simples, apenas para enviar email e notificações, pode ser o mailchimp ou outro mais facil de integrar com ferramentas google.
- Armazenamento de Imagens do Usuário: Possibilidade de guardar imagens no seu usuário, quando logado, diferneças para free e usuários pagos. Firestore para armazenar créditos (gratuito até 1GB)
- Sistema de Créditos e Assinaturas: Implementar diferentes níveis de assinatura com base em créditos, onde cada geração de imagem consome uma certa quantidade de créditos. Usuários gratuitos recebem um número limitado de créditos.
- Painel de Créditos do Usuário: Exibir claramente o saldo de créditos do usuário e as opções para comprar mais créditos.
- Acesso Prioritário para Assinantes: Permitir que usuários pagos tenham acesso prioritário ao poder de computação da IA, resultando em tempos de geração de imagem mais rápidos.
- Recursos Exclusivos para Assinantes: Indicar visualmente (por exemplo, com um ícone ou cor diferente) quais filtros e opções de aprimoramento estão disponíveis apenas para assinantes pagos.
- Compra de Créditos Extras: Oferecer aos usuários a opção de comprar créditos extras para usar filtros exclusivos e aumentar o limite de uso.
- Programa de Indicação: Programa de afiliados ou indicações onde os usuários podem ganhar créditos extras ao indicar novos usuários para a plataforma.
- Fila de Geração de Imagem: Adicionar fila na funcionalidade de gerar imagem, para que o usuário free espera e com a sobrecarga, muitos usuarios utilizando, priorizar usuarios que pagam, e deixar na fila a geração das imagens free.
- Technical Details: Technical details about tools, libraries and frameworks used in this project

## Style Guidelines:

- Azul elétrico (#7DF9FF) para transmitir inovação e avanço tecnológico.
- Cinza escuro (#28282B) para uma interface moderna e elegante.
- Verde neon (#39FF14) para destacar elementos interativos e informações importantes.
- Fonte do Título: 'Roboto Mono' para uma sensação técnica e precisa; Fonte do Corpo: 'Open Sans' para legibilidade e clareza.