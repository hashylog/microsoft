/** Banco de perguntas do quiz. `answer` é o índice da opção certa em `options` (a ordem é embaralhada na tela). */
export type Question = {
  question: string;
  options: [string, string, string, string];
  answer: number;
  /** Curiosidade mostrada depois da resposta. */
  fact: string;
};

export const QUESTIONS: Question[] = [
  {
    question: "Em que ano a Microsoft foi fundada?",
    options: ["1975", "1971", "1980", "1985"],
    answer: 0,
    fact: "A Microsoft nasceu em 4 de abril de 1975, criada por dois amigos de infância.",
  },
  {
    question: "Quem fundou a Microsoft junto com Bill Gates?",
    options: ["Paul Allen", "Steve Jobs", "Steve Ballmer", "Satya Nadella"],
    answer: 0,
    fact: "Paul Allen e Bill Gates se conheceram na escola, em Seattle, programando em um terminal compartilhado.",
  },
  {
    question: "Em que cidade a Microsoft começou?",
    options: ["Albuquerque", "Seattle", "Redmond", "São Francisco"],
    answer: 0,
    fact: "Ela começou em Albuquerque, no Novo México, e em 1979 se mudou para a região de Seattle.",
  },
  {
    question: "Qual foi o primeiro produto da Microsoft?",
    options: ["Um BASIC para o Altair 8800", "O Windows 1.0", "O MS-DOS", "O Microsoft Word"],
    answer: 0,
    fact: "Era um interpretador da linguagem BASIC para o Altair 8800, um dos primeiros computadores pessoais.",
  },
  {
    question: "Qual versão do Windows estreou o botão Iniciar?",
    options: ["Windows 95", "Windows 3.1", "Windows 98", "Windows XP"],
    answer: 0,
    fact: "O botão Iniciar e a barra de tarefas chegaram com o Windows 95, junto com uma campanha de lançamento histórica.",
  },
  {
    question: "Qual console a Microsoft lançou em 2001?",
    options: ["Xbox", "PlayStation 2", "GameCube", "Dreamcast"],
    answer: 0,
    fact: "O primeiro Xbox chegou em 2001 e marcou a entrada da Microsoft no mundo dos consoles.",
  },
  {
    question: "Quem é o CEO da Microsoft desde 2014?",
    options: ["Satya Nadella", "Bill Gates", "Steve Ballmer", "Sundar Pichai"],
    answer: 0,
    fact: "Satya Nadella é o terceiro CEO da história da empresa. Antes, ele comandava a área de nuvem.",
  },
  {
    question: "Qual jogo a Microsoft comprou em 2014 por US$ 2,5 bilhões?",
    options: ["Minecraft", "Fortnite", "Roblox", "Among Us"],
    answer: 0,
    fact: "A Microsoft comprou a Mojang, criadora do Minecraft, um dos jogos mais vendidos de todos os tempos.",
  },
  {
    question: "Como se chama a plataforma de nuvem da Microsoft?",
    options: ["Azure", "AWS", "iCloud", "Google Cloud"],
    answer: 0,
    fact: "Lançado em 2010 como Windows Azure, hoje ele tem datacenters espalhados pelo mundo inteiro.",
  },
  {
    question: "Qual é o assistente de IA da Microsoft?",
    options: ["Copilot", "Siri", "Alexa", "Gemini"],
    answer: 0,
    fact: "O Copilot usa IA generativa para ajudar a escrever, resumir e criar dentro dos apps que você já usa.",
  },
  {
    question: "Qual sistema a Microsoft licenciou para o primeiro PC da IBM, em 1981?",
    options: ["MS-DOS", "Windows", "Unix", "macOS"],
    answer: 0,
    fact: "O acordo com a IBM transformou a Microsoft em gigante: cada PC compatível passou a sair com o MS-DOS.",
  },
  {
    question: "Em que ano foi lançado o Windows 1.0?",
    options: ["1985", "1981", "1990", "1995"],
    answer: 0,
    fact: "O Windows 1.0 chegou em novembro de 1985 e já trazia programas como Paint, Calculadora e Bloco de Notas.",
  },
  {
    question: "Em que ano a Microsoft abriu capital na bolsa de valores?",
    options: ["1986", "1975", "1981", "1995"],
    answer: 0,
    fact: "A abertura de capital, em março de 1986, transformou muitos funcionários em milionários.",
  },
  {
    question: "Qual versão do Windows foi lançada em 2001?",
    options: ["Windows XP", "Windows Vista", "Windows 7", "Windows 2000"],
    answer: 0,
    fact: "O XP foi o primeiro Windows doméstico construído sobre o núcleo NT, o mesmo das versões corporativas.",
  },
  {
    question: "Em que ano foi lançado o Windows 10?",
    options: ["2015", "2012", "2013", "2018"],
    answer: 0,
    fact: "Lançado em julho de 2015, ele foi oferecido como atualização gratuita para quem tinha Windows 7 e 8.1.",
  },
  {
    question: "Qual Windows foi lançado em 2021?",
    options: ["Windows 11", "Windows 10", "Windows 8", "Windows Vista"],
    answer: 0,
    fact: "O Windows 11 trouxe a barra de tarefas centralizada e cantos arredondados em toda a interface.",
  },
  {
    question: "Qual era o navegador da Microsoft antes do Edge?",
    options: ["Internet Explorer", "Netscape", "Firefox", "Safari"],
    answer: 0,
    fact: "O Internet Explorer estreou em 1995 e foi aposentado oficialmente em 2022.",
  },
  {
    question: "Qual navegador a Microsoft lançou em 2015?",
    options: ["Edge", "Chrome", "Firefox", "Opera"],
    answer: 0,
    fact: "Desde 2020, ele usa o mesmo motor de código aberto do Chromium, base de vários outros navegadores.",
  },
  {
    question: "Qual buscador pertence à Microsoft?",
    options: ["Bing", "Google", "DuckDuckGo", "Yahoo"],
    answer: 0,
    fact: "O Bing foi lançado em 2009 e hoje mistura resultados de busca com respostas de IA.",
  },
  {
    question: "Qual pacote reúne Word, Excel e PowerPoint?",
    options: ["Microsoft 365", "Google Workspace", "iWork", "LibreOffice"],
    answer: 0,
    fact: "O pacote nasceu como Microsoft Office, no fim dos anos 1980, e virou Microsoft 365 com a chegada da nuvem.",
  },
  {
    question: "Qual programa do Microsoft 365 é feito para planilhas?",
    options: ["Excel", "Word", "Access", "PowerPoint"],
    answer: 0,
    fact: "A primeira versão do Excel saiu em 1985, para o Macintosh, antes de chegar ao Windows.",
  },
  {
    question: "Qual app de colaboração a Microsoft lançou em 2017?",
    options: ["Teams", "Slack", "Zoom", "Trello"],
    answer: 0,
    fact: "Ele junta chat, reuniões e arquivos em um lugar só e explodiu de uso durante a pandemia.",
  },
  {
    question: "Como se chamava o clipe de papel que ajudava no Office?",
    options: ["Clippy", "Cortana", "Siri", "Bixby"],
    answer: 0,
    fact: "O assistente estreou no Office 97 e virou meme. Em 2001 ele passou a vir desligado, mas nunca foi esquecido.",
  },
  {
    question: "Qual assistente de voz da Microsoft ganhou o nome de uma personagem de jogo?",
    options: ["Cortana", "Alexa", "Siri", "Bixby"],
    answer: 0,
    fact: "Cortana é a inteligência artificial que acompanha o protagonista em uma famosa série do Xbox.",
  },
  {
    question: "Qual é a série de jogos do Xbox protagonizada pelo Master Chief?",
    options: ["Halo", "Gears of War", "Forza", "Fable"],
    answer: 0,
    fact: "O primeiro jogo da série foi lançado junto com o console original, em 2001.",
  },
  {
    question: "Qual console a Microsoft lançou em 2020?",
    options: ["Xbox Series X|S", "Xbox One", "Xbox 360", "PlayStation 5"],
    answer: 0,
    fact: "A nova geração chegou em novembro de 2020, em duas versões: uma mais potente e outra compacta e só digital.",
  },
  {
    question: "Qual é o serviço de assinatura de jogos do Xbox?",
    options: ["Game Pass", "PlayStation Plus", "Apple Arcade", "Switch Online"],
    answer: 0,
    fact: "Ele funciona como um catálogo de streaming, só que de jogos, também jogáveis pela nuvem.",
  },
  {
    question: "Qual sensor de movimento para o Xbox 360 a Microsoft lançou em 2010?",
    options: ["Kinect", "Wii Remote", "PlayStation Move", "Oculus Touch"],
    answer: 0,
    fact: "Ele lia o corpo do jogador sem nenhum controle e entrou para o Guinness como o eletrônico vendido mais rápido da época.",
  },
  {
    question: "Qual empresa de jogos a Microsoft comprou em 2023?",
    options: ["Activision Blizzard", "Electronic Arts", "Ubisoft", "Nintendo"],
    answer: 0,
    fact: "Foi a maior compra da história da empresa, cerca de US$ 69 bilhões, trazendo Call of Duty e World of Warcraft.",
  },
  {
    question: "Qual rede social profissional a Microsoft comprou em 2016?",
    options: ["LinkedIn", "Twitter", "Facebook", "Pinterest"],
    answer: 0,
    fact: "A compra custou cerca de US$ 26 bilhões, e o LinkedIn hoje tem mais de 1 bilhão de membros.",
  },
  {
    question: "Qual plataforma de código a Microsoft comprou em 2018?",
    options: ["GitHub", "GitLab", "Bitbucket", "Stack Overflow"],
    answer: 0,
    fact: "Ela custou US$ 7,5 bilhões e hoje guarda o código de mais de 100 milhões de desenvolvedores.",
  },
  {
    question: "Qual serviço de chamadas de vídeo a Microsoft comprou em 2011?",
    options: ["Skype", "Zoom", "WhatsApp", "Discord"],
    answer: 0,
    fact: "A compra custou US$ 8,5 bilhões. Em 2025, o serviço foi encerrado e os usuários migraram para outro app da empresa.",
  },
  {
    question: "Qual empresa, criadora do ChatGPT, é parceira da Microsoft em IA?",
    options: ["OpenAI", "DeepMind", "Mistral", "Hugging Face"],
    answer: 0,
    fact: "A parceria começou em 2019, e os modelos dessa empresa rodam nos supercomputadores da nuvem da Microsoft.",
  },
  {
    question: "Qual linha de tablets e notebooks a Microsoft lançou em 2012?",
    options: ["Surface", "Pixel", "iPad", "Galaxy Tab"],
    answer: 0,
    fact: "Foi a primeira vez que a Microsoft projetou o próprio computador, do hardware ao software.",
  },
  {
    question: "Qual óculos de realidade mista foi criado pela Microsoft?",
    options: ["HoloLens", "Vision Pro", "Meta Quest", "Google Glass"],
    answer: 0,
    fact: "Ele projeta hologramas no ambiente real e é usado em treinamentos de medicina, engenharia e indústria.",
  },
  {
    question: "Qual linguagem criada pela Microsoft adiciona tipos ao JavaScript?",
    options: ["TypeScript", "Python", "Kotlin", "Rust"],
    answer: 0,
    fact: "Ela foi lançada em 2012 e hoje é usada em boa parte dos sites e apps modernos, inclusive neste aqui.",
  },
  {
    question: "Qual linguagem a Microsoft criou para a plataforma .NET?",
    options: ["C#", "Java", "Swift", "Go"],
    answer: 0,
    fact: "Ela surgiu em 2000 e é muito usada em jogos feitos com Unity.",
  },
  {
    question: "Qual editor de código gratuito da Microsoft é um dos mais usados do mundo?",
    options: ["Visual Studio Code", "Sublime Text", "Xcode", "Vim"],
    answer: 0,
    fact: "Lançado em 2015, ele é gratuito, de código aberto e roda em Windows, Mac e Linux.",
  },
  {
    question: "Onde fica a sede da Microsoft hoje?",
    options: ["Redmond", "Seattle", "Albuquerque", "Cupertino"],
    answer: 0,
    fact: "A sede fica em Redmond, no estado de Washington, desde 1986.",
  },
  {
    question: "Quem foi CEO da Microsoft entre 2000 e 2014?",
    options: ["Steve Ballmer", "Bill Gates", "Satya Nadella", "Paul Allen"],
    answer: 0,
    fact: "Ele entrou na empresa em 1980 como o primeiro gerente de negócios contratado.",
  },
];

/** Perguntas por partida, sorteadas do banco acima (cada pessoa recebe uma seleção e ordem diferentes). */
export const ROUND_SIZE = 20;

/** Segundos para responder cada pergunta. */
export const SECONDS = 20;

/** Pontos: 500 por acertar + até 500 pela rapidez. */
export function points(correct: boolean, remaining: number) {
  return correct ? 500 + Math.round(500 * (remaining / SECONDS)) : 0;
}

export const MAX_SCORE = ROUND_SIZE * 1000;

export function rank(correct: number) {
  const total = ROUND_SIZE;
  if (correct >= Math.ceil(total * 0.9)) return { title: "Lenda da Microsoft", line: "Você conhece essa história de cor." };
  if (correct >= Math.ceil(total * 0.7)) return { title: "Especialista", line: "Pouca coisa escapa de você." };
  if (correct >= Math.ceil(total * 0.4)) return { title: "Explorador", line: "Boa base, e agora com umas curiosidades a mais." };
  return { title: "Primeiro boot", line: "Todo mundo começa em algum lugar. Tenta de novo?" };
}
