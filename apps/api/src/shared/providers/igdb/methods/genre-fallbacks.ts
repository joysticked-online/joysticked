import type { IgdbGame } from './core';
import { IgdbFallbackMethods } from './fallbacks';

export class IgdbGenreFallbackMethods extends IgdbFallbackMethods {
  getGenreFallbackGames(game: IgdbGame, limit = 25): IgdbGame[] {
    const slug = game.slug.toLowerCase();
    const name = game.name.toLowerCase();
    const genres = (game.genres || []).map((g) => g.toLowerCase());

    const isSports =
      genres.some((g) => g.includes('sport') || g.includes('corrida') || g.includes('racing')) ||
      slug.includes('fc') ||
      slug.includes('fifa') ||
      slug.includes('nba') ||
      slug.includes('f1') ||
      slug.includes('madden') ||
      slug.includes('pes') ||
      slug.includes('skate') ||
      slug.includes('wwe') ||
      name.includes('sports') ||
      name.includes('football') ||
      name.includes('soccer');

    const cozyKeywords = [
      'stardew',
      'animal-crossing',
      'farm',
      'harvest',
      'keeper',
      'coral-island',
      'slime-rancher',
      'moonlighter',
      'dave-the-diver',
      'sun-haven',
      'mistria',
      'pacha',
      'cozy',
      'unpacking',
      'potion-permit',
      'spiritfarer',
      'dorfromantik',
      'coffee-talk',
      'townscaper',
      'a-short-hike',
      'travellers-rest'
    ];

    const isCozy =
      !isSports &&
      (cozyKeywords.some((k) => slug.includes(k) || name.includes(k)) ||
        ((slug.includes('valley') || name.includes('valley')) &&
          genres.some((g) => g.includes('rpg') || g.includes('indie'))));

    const isShooter =
      genres.some((g) => g.includes('shooter')) ||
      slug.includes('duty') ||
      slug.includes('apex') ||
      slug.includes('doom') ||
      slug.includes('cyberpunk');

    if (isSports) {
      return [
        {
          id: 3001,
          name: 'EA SPORTS FC 24',
          slug: 'ea-sports-fc-24',
          summary: 'O Jogo de Todo Mundo trazendo o futebol mais realista do planeta.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co6q78.webp',
          genres: ['Esporte', 'Simulador'],
          platforms: ['PC', 'PlayStation 5', 'Xbox Series X|S'],
          releaseYear: '2023',
          rating: 4.2
        },
        {
          id: 3002,
          name: 'eFootball 2024',
          slug: 'efootball-2024',
          summary: 'Uma nova era de futebol virtual da Konami para os amantes do esporte.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co71c3.webp',
          genres: ['Esporte'],
          platforms: ['PC', 'PlayStation 5', 'Xbox Series X|S'],
          releaseYear: '2023',
          rating: 3.8
        },
        {
          id: 3003,
          name: 'NBA 2K24',
          slug: 'nba-2k24',
          summary:
            'Experimente a cultura do basquete com realismo inovador e o legado de Kobe Bryant.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co6r00.webp',
          genres: ['Esporte', 'Simulador'],
          platforms: ['PC', 'PlayStation 5', 'Xbox Series X|S'],
          releaseYear: '2023',
          rating: 4.0
        },
        {
          id: 3004,
          name: 'Rocket League',
          slug: 'rocket-league',
          summary: 'Futebol com carros movidos a foguete em alta octanagem.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5176.webp',
          genres: ['Esporte', 'Ação'],
          platforms: ['PC', 'PlayStation 4', 'Xbox One', 'Nintendo Switch'],
          releaseYear: '2015',
          rating: 4.6
        },
        {
          id: 3005,
          name: 'F1 24',
          slug: 'f1-24',
          summary:
            'Sinta-se mais próximo do grid do que nunca no jogo oficial do Campeonato de Fórmula 1.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co835b.webp',
          genres: ['Corrida', 'Esporte'],
          platforms: ['PC', 'PlayStation 5', 'Xbox Series X|S'],
          releaseYear: '2024',
          rating: 4.3
        },
        {
          id: 3006,
          name: 'TopSpin 2K25',
          slug: 'topspin-2k25',
          summary: 'O clássico do tênis retorna com lendas do esporte e partidas intensas.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co811o.webp',
          genres: ['Esporte'],
          platforms: ['PC', 'PlayStation 5', 'Xbox Series X|S'],
          releaseYear: '2024',
          rating: 4.1
        },
        {
          id: 3007,
          name: "Tony Hawk's Pro Skater 1 + 2",
          slug: 'tony-hawks-pro-skater-1-plus-2',
          summary: 'Reviva as manobras e a trilha sonora épica do skate nos remakes definitivos.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co204m.webp',
          genres: ['Esporte'],
          platforms: ['PC', 'PlayStation 5', 'Xbox Series X|S'],
          releaseYear: '2020',
          rating: 4.8
        },
        {
          id: 3008,
          name: 'WWE 2K24',
          slug: 'wwe-2k24',
          summary:
            'Celebre 40 anos de WrestleMania com os maiores combates da história do wrestling.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co7v5k.webp',
          genres: ['Esporte', 'Luta'],
          platforms: ['PC', 'PlayStation 5', 'Xbox Series X|S'],
          releaseYear: '2024',
          rating: 4.2
        },
        {
          id: 3009,
          name: 'FIFA 23',
          slug: 'fifa-23',
          summary: 'A tecnologia HyperMotion2 leva o Maior Jogo do Mundo aos gramados virtuais.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co50a6.webp',
          genres: ['Esporte', 'Simulador'],
          platforms: ['PC', 'PlayStation 5', 'Xbox Series X|S'],
          releaseYear: '2022',
          rating: 4.1
        },
        {
          id: 3010,
          name: 'Madden NFL 24',
          slug: 'madden-nfl-24',
          summary: 'O controle tático do futebol americano com a evolução do FieldSENSE.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co6qg8.webp',
          genres: ['Esporte', 'Simulador'],
          platforms: ['PC', 'PlayStation 5', 'Xbox Series X|S'],
          releaseYear: '2023',
          rating: 3.9
        },
        {
          id: 3011,
          name: 'Gran Turismo 7',
          slug: 'gran-turismo-7',
          summary: 'O simulador de corrida real definitivo com mais de 400 carros lendários.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co49x5.webp',
          genres: ['Corrida', 'Simulador'],
          platforms: ['PlayStation 5', 'PlayStation 4'],
          releaseYear: '2022',
          rating: 4.7
        },
        {
          id: 3012,
          name: 'Forza Horizon 5',
          slug: 'forza-horizon-5',
          summary:
            'Explore as paisagens vibrantes do México em um festival automobilístico aberto sem limites.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co3ofw.webp',
          genres: ['Corrida', 'Aventura'],
          platforms: ['PC', 'Xbox Series X|S', 'Xbox One'],
          releaseYear: '2021',
          rating: 4.8
        },
        {
          id: 3013,
          name: 'Football Manager 2024',
          slug: 'football-manager-2024',
          summary:
            'Construa uma equipe de nível mundial e lidere seu clube à glória absoluta no futebol.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co759r.webp',
          genres: ['Simulador', 'Estratégia', 'Esporte'],
          platforms: ['PC', 'PlayStation 5', 'Xbox Series X|S'],
          releaseYear: '2023',
          rating: 4.5
        },
        {
          id: 3014,
          name: 'Riders Republic',
          slug: 'riders-republic',
          summary:
            'Salte no imenso parque esportivo multiplayer com esqui, snowboard, bike e wingsuit.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2k3e.webp',
          genres: ['Esporte', 'Corrida'],
          platforms: ['PC', 'PlayStation 5', 'Xbox Series X|S'],
          releaseYear: '2021',
          rating: 4.2
        },
        {
          id: 3015,
          name: 'Skate 3',
          slug: 'skate-3',
          summary: 'O ápice da física e das manobras cooperativas de skate em Port Carverton.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1x9a.webp',
          genres: ['Esporte'],
          platforms: ['PlayStation 3', 'Xbox 360'],
          releaseYear: '2010',
          rating: 4.6
        },
        {
          id: 3016,
          name: 'PGA TOUR 2K23',
          slug: 'pga-tour-2k23',
          summary:
            'Leve suas tacadas para o PGA TOUR e dispute contra profissionais do golfe mundial.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co580e.webp',
          genres: ['Esporte', 'Simulador'],
          platforms: ['PC', 'PlayStation 5', 'Xbox Series X|S'],
          releaseYear: '2022',
          rating: 4.1
        },
        {
          id: 3017,
          name: 'Tennis World Tour 2',
          slug: 'tennis-world-tour-2',
          summary:
            'Jogue como os maiores tenistas do mundo ou crie seu próprio atleta para dominar o ranking.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2k1o.webp',
          genres: ['Esporte'],
          platforms: ['PC', 'PlayStation 4', 'Xbox One', 'Nintendo Switch'],
          releaseYear: '2020',
          rating: 4.0
        },
        {
          id: 3018,
          name: 'NHL 24',
          slug: 'nhl-24',
          summary:
            'Sinta toda a intensidade do hóquei no gelo com a nova Exhaust Engine da EA SPORTS.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co72f3.webp',
          genres: ['Esporte'],
          platforms: ['PlayStation 5', 'Xbox Series X|S'],
          releaseYear: '2023',
          rating: 4.2
        },
        {
          id: 3019,
          name: 'MLB The Show 24',
          slug: 'mlb-the-show-24',
          summary: 'Viva seus sonhos de beisebol com momentos decisivos e lendas da MLB.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co7s8q.webp',
          genres: ['Esporte'],
          platforms: ['PlayStation 5', 'Xbox Series X|S', 'Nintendo Switch'],
          releaseYear: '2024',
          rating: 4.4
        },
        {
          id: 3020,
          name: 'WRC Generations',
          slug: 'wrc-generations',
          summary: 'Encare todos os desafios do rali mais completo e realista já criado.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co52a7.webp',
          genres: ['Corrida', 'Esporte'],
          platforms: ['PC', 'PlayStation 5', 'Xbox Series X|S'],
          releaseYear: '2022',
          rating: 4.3
        },
        {
          id: 3021,
          name: 'Session: Skate Sim',
          slug: 'session-skate-sim',
          summary:
            'Feito por e para skatistas, experimente o controle duplo com os analógicos para manobras ultra precisas.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co50a7.webp',
          genres: ['Simulador', 'Esporte'],
          platforms: ['PC', 'PlayStation 5', 'Xbox Series X|S'],
          releaseYear: '2022',
          rating: 4.2
        },
        {
          id: 3022,
          name: 'AO Tennis 2',
          slug: 'ao-tennis-2',
          summary:
            'O jogo de tênis oficial do Australian Open com modo carreira profundo e criação de quadras.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1xcr.webp',
          genres: ['Esporte'],
          platforms: ['PC', 'PlayStation 4', 'Xbox One', 'Nintendo Switch'],
          releaseYear: '2020',
          rating: 4.1
        },
        {
          id: 3023,
          name: 'DIRT 5',
          slug: 'dirt-5',
          summary: 'Corridas off-road cheias de estilo, adrenalina e pistas dinâmicas pelo mundo.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co204b.webp',
          genres: ['Corrida', 'Esporte'],
          platforms: ['PC', 'PlayStation 5', 'Xbox Series X|S'],
          releaseYear: '2020',
          rating: 4.3
        },
        {
          id: 3024,
          name: 'Ride 5',
          slug: 'ride-5',
          summary:
            'Acelere seu motor e sinta a emoção de pilotar as motocicletas mais desejadas da história.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co6qg9.webp',
          genres: ['Corrida', 'Esporte', 'Simulador'],
          platforms: ['PC', 'PlayStation 5', 'Xbox Series X|S'],
          releaseYear: '2023',
          rating: 4.2
        }
      ].slice(0, limit);
    }

    if (isCozy) {
      return [
        {
          id: 4001,
          name: 'Animal Crossing: New Horizons',
          slug: 'animal-crossing-new-horizons',
          summary:
            'Escape para uma ilha deserta e crie seu próprio paraíso nesta experiência relaxante.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co72i4.webp',
          genres: ['Simulador', 'Aventura'],
          platforms: ['Nintendo Switch'],
          releaseYear: '2020',
          rating: 4.9
        },
        {
          id: 4002,
          name: 'Graveyard Keeper',
          slug: 'graveyard-keeper',
          summary: 'A simulação de gerenciamento de cemitério medieval mais imprecisa do ano.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1xcr.webp',
          genres: ['Simulador', 'RPG', 'Indie'],
          platforms: ['PC', 'PlayStation 4', 'Xbox One', 'Nintendo Switch'],
          releaseYear: '2018',
          rating: 4.4
        },
        {
          id: 4003,
          name: 'Dave the Diver',
          slug: 'dave-the-diver',
          summary:
            'Explore o mar durante o dia e administre um restaurante de sushi movimentado à noite.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co6t84.webp',
          genres: ['Aventura', 'Simulador', 'RPG'],
          platforms: ['PC', 'PlayStation 5', 'Nintendo Switch'],
          releaseYear: '2023',
          rating: 4.8
        },
        {
          id: 4004,
          name: 'Slime Rancher 2',
          slug: 'slime-rancher-2',
          summary:
            'Continue as aventuras de Beatrix LeBeau ao viajar pela Rainbow Island criando slimes adoráveis.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5q42.webp',
          genres: ['Aventura', 'Indie', 'Simulador'],
          platforms: ['PC', 'Xbox Series X|S', 'PlayStation 5'],
          releaseYear: '2022',
          rating: 4.6
        },
        {
          id: 4005,
          name: 'Coral Island',
          slug: 'coral-island',
          summary:
            'Construa sua fazenda dos sonhos, cuide dos animais e restaure recifes de corais.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co7j3g.webp',
          genres: ['Simulador', 'RPG'],
          platforms: ['PC', 'PlayStation 5', 'Xbox Series X|S'],
          releaseYear: '2023',
          rating: 4.5
        },
        {
          id: 4006,
          name: 'Moonlighter',
          slug: 'moonlighter',
          summary:
            'Um RPG de ação com elementos rogue-lite sobre a rotina de Will, um lojista corajoso.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1mbi.webp',
          genres: ['RPG', 'Indie', 'Aventura'],
          platforms: ['PC', 'PlayStation 4', 'Xbox One', 'Nintendo Switch'],
          releaseYear: '2018',
          rating: 4.3
        },
        {
          id: 4007,
          name: 'Sun Haven',
          slug: 'sun-haven',
          summary:
            'Crie sua fazenda e construa relacionamentos com moradores nesta vila mágica cheia de fantasia.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co69p2.webp',
          genres: ['RPG', 'Simulador', 'Indie'],
          platforms: ['PC'],
          releaseYear: '2023',
          rating: 4.6
        },
        {
          id: 4008,
          name: 'Terraria',
          slug: 'terraria',
          summary:
            'Cave, lute, explore e construa neste jogo de aventura sandbox 2D aclamado no mundo todo.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1r7f.webp',
          genres: ['Aventura', 'Indie', 'Plataforma'],
          platforms: ['PC', 'PlayStation 4', 'Xbox One', 'Nintendo Switch'],
          releaseYear: '2011',
          rating: 4.9
        },
        {
          id: 4009,
          name: 'Roots of Pacha',
          slug: 'roots-of-pacha',
          summary:
            'Uma simulação de fazenda e vida comunitária acolhedora ambientada na Idade da Pedra.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co69f2.webp',
          genres: ['Simulador', 'RPG', 'Indie'],
          platforms: ['PC', 'PlayStation 5', 'Nintendo Switch'],
          releaseYear: '2023',
          rating: 4.7
        },
        {
          id: 4010,
          name: 'Cozy Grove',
          slug: 'cozy-grove',
          summary:
            'Explore uma ilha assombrada e traga cor e vida aos fantasmas fofos dos ursos locais.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2w6a.webp',
          genres: ['Aventura', 'Simulador', 'Indie'],
          platforms: ['PC', 'PlayStation 4', 'Nintendo Switch'],
          releaseYear: '2021',
          rating: 4.5
        },
        {
          id: 4011,
          name: 'Unpacking',
          slug: 'unpacking',
          summary: 'Um jogo zen sobre desempacotar caixas e montar lares através dos anos.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co3w6x.webp',
          genres: ['Quebra-cabeça', 'Indie'],
          platforms: ['PC', 'PlayStation 5', 'Nintendo Switch'],
          releaseYear: '2021',
          rating: 4.8
        },
        {
          id: 4012,
          name: 'Spiritfarer',
          slug: 'spiritfarer',
          summary:
            'Um jogo de gerenciamento acolhedor sobre a morte e a despedida de amigos queridos.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co22b8.webp',
          genres: ['Aventura', 'Simulador', 'Indie'],
          platforms: ['PC', 'PlayStation 4', 'Nintendo Switch'],
          releaseYear: '2020',
          rating: 4.9
        },
        {
          id: 4013,
          name: 'Dorfromantik',
          slug: 'dorfromantik',
          summary:
            'Construa paisagens rurais pacíficas e crie aldeias idílicas colocando ladrilhos hexagonais.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co3i06.webp',
          genres: ['Estratégia', 'Quebra-cabeça', 'Indie'],
          platforms: ['PC', 'Nintendo Switch'],
          releaseYear: '2022',
          rating: 4.7
        },
        {
          id: 4014,
          name: 'A Short Hike',
          slug: 'a-short-hike',
          summary:
            'Caminhe, voe e suba montanhas relaxantes neste mundinho encantador e aconchegante.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1xbt.webp',
          genres: ['Aventura', 'Indie'],
          platforms: ['PC', 'Nintendo Switch', 'PlayStation 4'],
          releaseYear: '2019',
          rating: 4.8
        },
        {
          id: 4015,
          name: 'Ooblets',
          slug: 'ooblets',
          summary:
            'Cultive criaturinhas fofas, participe de batalhas de dança e gerencie sua fazendinha.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co52b9.webp',
          genres: ['Simulador', 'RPG', 'Indie'],
          platforms: ['PC', 'Xbox Series X|S', 'Nintendo Switch'],
          releaseYear: '2022',
          rating: 4.6
        },
        {
          id: 4016,
          name: 'Wylde Flowers',
          slug: 'wylde-flowers',
          summary:
            'Junte-se a Tara em uma jornada mágica para se tornar uma bruxa acolhedora em sua fazenda.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co4x4b.webp',
          genres: ['Simulador', 'Aventura', 'Indie'],
          platforms: ['PC', 'Nintendo Switch', 'Apple Arcade'],
          releaseYear: '2022',
          rating: 4.8
        },
        {
          id: 4017,
          name: 'Fae Farm',
          slug: 'fae-farm',
          summary: 'Escape para o mundo mágico de Azoria e construa seu lar de fadas com amigos.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co69f3.webp',
          genres: ['RPG', 'Simulador'],
          platforms: ['PC', 'Nintendo Switch', 'PlayStation 5'],
          releaseYear: '2023',
          rating: 4.3
        },
        {
          id: 4018,
          name: 'Dinkum',
          slug: 'dinkum',
          summary:
            'Comece uma nova vida relaxante no outback australiano construindo sua cidade e fazenda.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co50a8.webp',
          genres: ['Simulador', 'RPG', 'Indie'],
          platforms: ['PC'],
          releaseYear: '2022',
          rating: 4.7
        },
        {
          id: 4019,
          name: 'Rune Factory 4 Special',
          slug: 'rune-factory-4-special',
          summary:
            'O clássico RPG de vida no campo, cultivo e relacionamentos mágicos remasterizado.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1r7e.webp',
          genres: ['RPG', 'Simulador'],
          platforms: ['PC', 'Nintendo Switch', 'PlayStation 4', 'Xbox One'],
          releaseYear: '2019',
          rating: 4.6
        },
        {
          id: 4020,
          name: 'My Time at Sandrock',
          slug: 'my-time-at-sandrock',
          summary:
            'Viaje para a comunidade desértica de Sandrock e ajude a cidade a prosperar como construtor.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co6r01.webp',
          genres: ['RPG', 'Simulador', 'Aventura'],
          platforms: ['PC', 'PlayStation 5', 'Xbox Series X|S', 'Nintendo Switch'],
          releaseYear: '2023',
          rating: 4.7
        },
        {
          id: 4021,
          name: 'Slime Rancher',
          slug: 'slime-rancher',
          summary: 'Explore um planeta colorido e alienígena criando slimes alegres e pulitantes.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1xcr.webp',
          genres: ['Aventura', 'Indie', 'Simulador'],
          platforms: ['PC', 'PlayStation 4', 'Xbox One', 'Nintendo Switch'],
          releaseYear: '2017',
          rating: 4.8
        },
        {
          id: 4022,
          name: 'Kynseed',
          slug: 'kynseed',
          summary:
            'Um sandbox RPG 2D feito por ex-desenvolvedores de Fable com ciclos de vida e fazenda.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co52b8.webp',
          genres: ['RPG', 'Simulador', 'Indie'],
          platforms: ['PC'],
          releaseYear: '2022',
          rating: 4.4
        },
        {
          id: 4023,
          name: 'Travellers Rest',
          slug: 'travellers-rest',
          summary:
            'Gerencie sua própria taverna medieval aconchegante, produza cervejas e cultive ingredientes.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co204c.webp',
          genres: ['Simulador', 'RPG', 'Indie'],
          platforms: ['PC'],
          releaseYear: '2020',
          rating: 4.6
        }
      ].slice(0, limit);
    }

    if (isShooter) {
      const shooterGames: IgdbGame[] = [
        {
          id: 5001,
          name: 'Doom Eternal',
          slug: 'doom-eternal',
          summary:
            'Os exércitos do inferno invadiram a Terra. Torne-se o Slayer e destrua os demônios.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co29be.webp',
          genres: ['Tiro (Shooter)'],
          platforms: ['PC', 'PlayStation 5', 'Xbox Series X|S'],
          releaseYear: '2020',
          rating: 4.8
        },
        {
          id: 5002,
          name: 'Titanfall 2',
          slug: 'titanfall-2',
          summary:
            'Piloto e Titã se unem como nunca nesta obra-prima do FPS com mobilidade sem igual.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1xbo.webp',
          genres: ['Tiro (Shooter)'],
          platforms: ['PC', 'PlayStation 4', 'Xbox One'],
          releaseYear: '2016',
          rating: 4.9
        },
        {
          id: 5003,
          name: 'Apex Legends',
          slug: 'apex-legends',
          summary:
            'Domine um elenco crescente de lendas com habilidades poderosas nesta batalha estratégica.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2044.webp',
          genres: ['Tiro (Shooter)', 'Ação'],
          platforms: ['PC', 'PlayStation 5', 'Xbox Series X|S'],
          releaseYear: '2019',
          rating: 4.5
        },
        {
          id: 5004,
          name: 'Destiny 2',
          slug: 'destiny-2',
          summary: 'Mergulhe no mundo de Destiny 2 para explorar os mistérios do sistema solar.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1t98.webp',
          genres: ['Tiro (Shooter)', 'RPG'],
          platforms: ['PC', 'PlayStation 5', 'Xbox Series X|S'],
          releaseYear: '2017',
          rating: 4.4
        },
        {
          id: 5005,
          name: 'Halo Infinite',
          slug: 'halo-infinite',
          summary: 'O Master Chief retorna na maior aventura e campanha da icônica franquia Halo.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co214o.webp',
          genres: ['Tiro (Shooter)'],
          platforms: ['PC', 'Xbox Series X|S', 'Xbox One'],
          releaseYear: '2021',
          rating: 4.3
        },
        {
          id: 5006,
          name: 'Overwatch 2',
          slug: 'overwatch-2',
          summary: 'Heróis lendários em confrontos 5v5 cheios de ação e estratégia.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co4t4b.webp',
          genres: ['Tiro (Shooter)'],
          platforms: ['PC', 'PlayStation 5', 'Xbox Series X|S', 'Nintendo Switch'],
          releaseYear: '2022',
          rating: 4.1
        },
        {
          id: 5007,
          name: "Tom Clancy's Rainbow Six Siege",
          slug: 'tom-clancys-rainbow-six-siege',
          summary:
            'O clássico combate tático em equipe com operadores especializados e destruição de ambientes.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1rc7.webp',
          genres: ['Tiro (Shooter)', 'Tático'],
          platforms: ['PC', 'PlayStation 5', 'Xbox Series X|S'],
          releaseYear: '2015',
          rating: 4.6
        },
        {
          id: 5008,
          name: 'Counter-Strike 2',
          slug: 'counter-strike-2',
          summary: 'O maior avanço técnico na história da lendária série de tiro tático da Valve.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co695g.webp',
          genres: ['Tiro (Shooter)'],
          platforms: ['PC'],
          releaseYear: '2023',
          rating: 4.7
        },
        {
          id: 5009,
          name: 'BioShock Infinite',
          slug: 'bioshock-infinite',
          summary:
            'Voe para a cidade flutuante de Columbia em um clássico conto de mistério e ação frenética.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1xbc.webp',
          genres: ['Tiro (Shooter)', 'Aventura'],
          platforms: ['PC', 'PlayStation 4', 'Xbox One'],
          releaseYear: '2013',
          rating: 4.9
        },
        {
          id: 5010,
          name: 'Metro Exodus',
          slug: 'metro-exodus',
          summary:
            'Fuja das ruínas do metrô de Moscou em uma jornada pós-apocalíptica pela imensidão russa.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1m1z.webp',
          genres: ['Tiro (Shooter)', 'Ação'],
          platforms: ['PC', 'PlayStation 5', 'Xbox Series X|S'],
          releaseYear: '2019',
          rating: 4.7
        },
        {
          id: 5011,
          name: 'Deep Rock Galactic',
          slug: 'deep-rock-galactic',
          summary:
            'Anões espaciais badass, cavernas 100% destrutíveis e hordas infinitas de monstros alienígenas.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2jvd.webp',
          genres: ['Tiro (Shooter)', 'Indie'],
          platforms: ['PC', 'PlayStation 5', 'Xbox Series X|S'],
          releaseYear: '2020',
          rating: 4.8
        },
        {
          id: 5012,
          name: 'Borderlands 3',
          slug: 'borderlands-3',
          summary:
            'O rei dos looter-shooters com bilhões de armas extravagantes e caos interplanetário.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1s4c.webp',
          genres: ['Tiro (Shooter)', 'RPG'],
          platforms: ['PC', 'PlayStation 5', 'Xbox Series X|S'],
          releaseYear: '2019',
          rating: 4.4
        },
        {
          id: 5013,
          name: 'Hunt: Showdown',
          slug: 'hunt-showdown',
          summary: 'PvPvE de alta tensão e terror sobrenatural nos pântanos sombrios da Louisiana.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1ndb.webp',
          genres: ['Tiro (Shooter)'],
          platforms: ['PC', 'PlayStation 5', 'Xbox Series X|S'],
          releaseYear: '2019',
          rating: 4.6
        },
        {
          id: 5014,
          name: 'Wolfenstein II: The New Colossus',
          slug: 'wolfenstein-ii-the-new-colossus',
          summary:
            'Lidere a segunda Revolução Americana contra o regime opressor nesta campanha épica.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1rb8.webp',
          genres: ['Tiro (Shooter)', 'Ação'],
          platforms: ['PC', 'PlayStation 4', 'Xbox One'],
          releaseYear: '2017',
          rating: 4.7
        },
        {
          id: 5015,
          name: 'ULTRAKILL',
          slug: 'ultrakill',
          summary:
            'Um retro-FPS ultra veloz e brutal movido a sangue e habilidades de combo acrobáticas.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co22q2.webp',
          genres: ['Tiro (Shooter)', 'Indie'],
          platforms: ['PC'],
          releaseYear: '2020',
          rating: 4.9
        }
      ];
      return shooterGames
        .filter((g) => g.slug !== game.slug && !this.isDlcOrExpansion(g.name, g.slug, g.category))
        .slice(0, limit);
    }

    // Default RPG / Adventure / Souls
    const defaultGames: IgdbGame[] = [
      {
        id: 11133,
        name: 'Dark Souls III',
        slug: 'dark-souls-iii',
        summary:
          'Enquanto o fogo se apaga e o mundo cai em ruínas, viaje para um universo repleto de inimigos colossais.',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/cob9ed.webp',
        genres: ['Role-playing (RPG)', 'Aventura'],
        platforms: ['PC', 'PlayStation 4', 'Xbox One'],
        releaseYear: '2016',
        rating: 4.8
      },
      {
        id: 7334,
        name: 'Bloodborne',
        slug: 'bloodborne',
        summary: 'Enfrente seus medos enquanto busca respostas na antiga cidade de Yharnam.',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/cob99l.webp',
        genres: ['Role-playing (RPG)', 'Ação'],
        platforms: ['PlayStation 4'],
        releaseYear: '2015',
        rating: 4.9
      },
      {
        id: 76882,
        name: 'Sekiro: Shadows Die Twice',
        slug: 'sekiro-shadows-die-twice',
        summary:
          'Trace seu próprio caminho para a vingança nesta aventura premiada da FromSoftware.',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2a23.webp',
        genres: ['Ação', 'Aventura'],
        platforms: ['PC', 'PlayStation 4', 'Xbox One'],
        releaseYear: '2019',
        rating: 4.9
      },
      {
        id: 148241,
        name: 'Lies of P',
        slug: 'lies-of-p',
        summary:
          'Um soulslike emocionante que adapta a história de Pinóquio em uma cidade sombria da Belle Époque.',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co6lxr.webp',
        genres: ['Role-playing (RPG)', 'Aventura'],
        platforms: ['PC', 'PlayStation 5', 'Xbox Series X|S'],
        releaseYear: '2023',
        rating: 4.7
      },
      {
        id: 125174,
        name: "Baldur's Gate 3",
        slug: 'baldurs-gate-3',
        summary: 'Reúna seu grupo e retorne aos Forgotten Realms em um RPG revolucionário.',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co670h.webp',
        genres: ['Role-playing (RPG)', 'Estratégia'],
        platforms: ['PC', 'PlayStation 5', 'Xbox Series X|S'],
        releaseYear: '2023',
        rating: 4.9
      },
      {
        id: 119137,
        name: 'Monster Hunter: World',
        slug: 'monster-hunter-world',
        summary:
          'Cace monstros majestosos em ecossistemas vivos e use seus despojos para forjar equipamentos lendários.',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1iqo.webp',
        genres: ['Role-playing (RPG)', 'Ação'],
        platforms: ['PC', 'PlayStation 4', 'Xbox One'],
        releaseYear: '2018',
        rating: 4.7
      },
      {
        id: 119138,
        name: 'Elden Ring',
        slug: 'elden-ring',
        summary:
          'Levante-se, Maculado, e seja guiado pela graça para brandir o poder do Anel Prístino.',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.webp',
        genres: ['Role-playing (RPG)', 'Aventura'],
        platforms: ['PC', 'PlayStation 5', 'Xbox Series X|S'],
        releaseYear: '2022',
        rating: 4.9
      },
      {
        id: 119139,
        name: 'The Witcher 3: Wild Hunt',
        slug: 'the-witcher-3-wild-hunt',
        summary:
          'Torne-se Geralt de Rívia, um caçador de monstros profissional em busca da Criança da Profecia.',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1wyy.webp',
        genres: ['Role-playing (RPG)', 'Aventura'],
        platforms: ['PC', 'PlayStation 5', 'Xbox Series X|S'],
        releaseYear: '2015',
        rating: 4.9
      },
      {
        id: 119140,
        name: 'Cyberpunk 2077',
        slug: 'cyberpunk-2077',
        summary: 'Torne-se um mercenário urbano fora da lei na megalópole futurista de Night City.',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co8175.webp',
        genres: ['Role-playing (RPG)', 'Tiro (Shooter)'],
        platforms: ['PC', 'PlayStation 5', 'Xbox Series X|S'],
        releaseYear: '2020',
        rating: 4.6
      },
      {
        id: 119141,
        name: 'God of War Ragnarök',
        slug: 'god-of-war-ragnarok',
        summary:
          'Kratos e Atreus embarcam em uma jornada mítica por respostas antes da batalha profetizada.',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5s5v.webp',
        genres: ['Ação', 'Aventura'],
        platforms: ['PlayStation 5', 'PlayStation 4', 'PC'],
        releaseYear: '2022',
        rating: 4.9
      },
      {
        id: 119142,
        name: 'Ghost of Tsushima',
        slug: 'ghost-of-tsushima',
        summary:
          'Forje um novo caminho e trave uma guerra não convencional pela liberdade de Tsushima.',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2765.webp',
        genres: ['Ação', 'Aventura'],
        platforms: ['PC', 'PlayStation 5', 'PlayStation 4'],
        releaseYear: '2020',
        rating: 4.9
      },
      {
        id: 119143,
        name: 'Horizon Zero Dawn',
        slug: 'horizon-zero-dawn',
        summary:
          'Viva a lendária jornada de Aloy para desvendar os mistérios de uma Terra dominada por Máquinas.',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2vv5.webp',
        genres: ['Ação', 'Role-playing (RPG)'],
        platforms: ['PC', 'PlayStation 4', 'PlayStation 5'],
        releaseYear: '2017',
        rating: 4.7
      },
      {
        id: 119144,
        name: 'Red Dead Redemption 2',
        slug: 'red-dead-redemption-2',
        summary:
          'A épica história de Arthur Morgan e da gangue Van der Linde no crepúsculo do Velho Oeste.',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1q1f.webp',
        genres: ['Aventura', 'Ação'],
        platforms: ['PC', 'PlayStation 4', 'Xbox One'],
        releaseYear: '2018',
        rating: 4.9
      },
      {
        id: 119145,
        name: 'Final Fantasy VII Remake',
        slug: 'final-fantasy-vii-remake',
        summary: 'Uma reimaginação espetacular do icônico RPG que definiu uma era dos videogames.',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1r83.webp',
        genres: ['Role-playing (RPG)', 'Ação'],
        platforms: ['PC', 'PlayStation 5', 'PlayStation 4'],
        releaseYear: '2020',
        rating: 4.8
      },
      {
        id: 119146,
        name: "Dragon's Dogma 2",
        slug: 'dragons-dogma-2',
        summary:
          'Um RPG de ação narrativa onde os jogadores moldam sua própria jornada com peões leais.',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co6t8s.webp',
        genres: ['Role-playing (RPG)', 'Ação'],
        platforms: ['PC', 'PlayStation 5', 'Xbox Series X|S'],
        releaseYear: '2024',
        rating: 4.5
      },
      {
        id: 119147,
        name: 'Persona 5 Royal',
        slug: 'persona-5-royal',
        summary:
          'Coloque a máscara dos Phantom Thieves e realize assaltos épicos nos corações dos corruptos.',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1nic.webp',
        genres: ['Role-playing (RPG)'],
        platforms: ['PC', 'PlayStation 5', 'Nintendo Switch', 'Xbox Series X|S'],
        releaseYear: '2019',
        rating: 4.9
      },
      {
        id: 119148,
        name: 'NieR:Automata',
        slug: 'nier-automata',
        summary:
          'Os androides 2B, 9S e A2 lutam para recuperar uma distopia abandonada pela humanidade.',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1r84.webp',
        genres: ['Role-playing (RPG)', 'Ação'],
        platforms: ['PC', 'PlayStation 4', 'Xbox One', 'Nintendo Switch'],
        releaseYear: '2017',
        rating: 4.9
      },
      {
        id: 119149,
        name: 'The Elder Scrolls V: Skyrim',
        slug: 'the-elder-scrolls-v-skyrim',
        summary:
          'O clássico RPG de mundo aberto definitivo onde você pode ser quem quiser e fazer o que desejar.',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1tnw.webp',
        genres: ['Role-playing (RPG)', 'Aventura'],
        platforms: ['PC', 'PlayStation 4', 'Xbox One', 'Nintendo Switch'],
        releaseYear: '2011',
        rating: 4.8
      },
      {
        id: 119150,
        name: 'Black Myth: Wukong',
        slug: 'black-myth-wukong',
        summary: 'Um RPG de ação enraizado na mitologia chinesa baseado em Jornada ao Oeste.',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co6s8l.webp',
        genres: ['Ação', 'Role-playing (RPG)'],
        platforms: ['PC', 'PlayStation 5'],
        releaseYear: '2024',
        rating: 4.8
      },
      {
        id: 119151,
        name: 'Armored Core VI: Fires of Rubicon',
        slug: 'armored-core-vi-fires-of-rubicon',
        summary:
          'Batalhas mecha em alta velocidade com pilotagem tridimensional e montagens personalizadas.',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co6u2b.webp',
        genres: ['Ação', 'Simulador'],
        platforms: ['PC', 'PlayStation 5', 'Xbox Series X|S'],
        releaseYear: '2023',
        rating: 4.7
      },
      {
        id: 119152,
        name: 'Star Wars Jedi: Survivor',
        slug: 'star-wars-jedi-survivor',
        summary:
          'A história de Cal Kestis continua em um combate cinematográfico através da galáxia.',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co655w.webp',
        genres: ['Ação', 'Aventura'],
        platforms: ['PC', 'PlayStation 5', 'Xbox Series X|S'],
        releaseYear: '2023',
        rating: 4.6
      },
      {
        id: 119153,
        name: 'Kingdom Come: Deliverance',
        slug: 'kingdom-come-deliverance',
        summary:
          'Um RPG imersivo em primeira pessoa ambientado no Sacro Império Romano da Idade Média.',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1r8c.webp',
        genres: ['Role-playing (RPG)', 'Aventura'],
        platforms: ['PC', 'PlayStation 4', 'Xbox One', 'Nintendo Switch'],
        releaseYear: '2018',
        rating: 4.6
      },
      {
        id: 119154,
        name: 'Death Stranding',
        slug: 'death-stranding',
        summary:
          'Reconecte uma sociedade despedaçada em uma experiência inovadora de mundo aberto de Hideo Kojima.',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1s9v.webp',
        genres: ['Ação', 'Aventura'],
        platforms: ['PC', 'PlayStation 5', 'PlayStation 4'],
        releaseYear: '2019',
        rating: 4.7
      },
      {
        id: 119155,
        name: "Demon's Souls",
        slug: 'demons-souls',
        summary:
          'O remake impecável do clássico de fantasia sombria e combate impiedoso no reino de Boletaria.',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2e0y.webp',
        genres: ['Role-playing (RPG)', 'Ação'],
        platforms: ['PlayStation 5'],
        releaseYear: '2020',
        rating: 4.8
      },
      {
        id: 119156,
        name: 'Hollow Knight',
        slug: 'hollow-knight',
        summary:
          'Explore um vasto reino arruinado de insetos e heróis neste aclamado metroidvania.',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/cobfzp.webp',
        genres: ['Aventura', 'Plataforma', 'Indie'],
        platforms: ['PC', 'PlayStation 4', 'Xbox One', 'Nintendo Switch'],
        releaseYear: '2017',
        rating: 4.9
      }
    ];
    return defaultGames
      .filter((g) => g.slug !== game.slug && !this.isDlcOrExpansion(g.name, g.slug, g.category))
      .slice(0, limit);
  }
}
