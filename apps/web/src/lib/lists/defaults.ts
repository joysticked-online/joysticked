import type { UserList } from './types';

// Official curated lists by @joysticked
export const DEFAULT_COMMUNITY_LISTS: UserList[] = [
  {
    id: 'list_curated_1',
    slug: 'favoritos-de-sempre',
    name: 'Favoritos de Sempre',
    description: 'Os títulos mais marcantes, aclamados e influentes da história dos videogames.',
    ownerUsername: 'joysticked',
    ownerDisplayName: 'Joysticked',
    ownerAvatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=joysticked',
    isPublic: true,
    likesCount: 342,
    tags: ['Obrigatórios', 'Aclamados', 'Clássicos'],
    createdAt: '2024-01-10T12:00:00Z',
    updatedAt: '2024-05-18T14:30:00Z',
    gameCount: 6,
    games: [
      {
        id: 119133,
        name: 'Elden Ring',
        slug: 'elden-ring',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.webp',
        rating: 4.8,
        releaseYear: '2022',
        genres: ['RPG', 'Ação', 'Souls-like']
      },
      {
        id: 119277,
        name: "Baldur's Gate 3",
        slug: 'baldurs-gate-3',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co670h.webp',
        rating: 4.9,
        releaseYear: '2023',
        genres: ['RPG', 'Estratégia', 'Turno']
      },
      {
        id: 1942,
        name: 'The Witcher 3: Wild Hunt',
        slug: 'the-witcher-3-wild-hunt',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/coaarl.webp',
        rating: 4.9,
        releaseYear: '2015',
        genres: ['RPG', 'Mundo Aberto', 'Ação']
      },
      {
        id: 25076,
        name: 'Red Dead Redemption 2',
        slug: 'red-dead-redemption-2',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1q1f.webp',
        rating: 4.9,
        releaseYear: '2018',
        genres: ['Ação', 'Mundo Aberto', 'Aventura']
      },
      {
        id: 1877,
        name: 'Cyberpunk 2077',
        slug: 'cyberpunk-2077',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/coaih8.webp',
        rating: 4.4,
        releaseYear: '2020',
        genres: ['RPG', 'Ficção Científica', 'Ação']
      },
      {
        id: 19560,
        name: 'God of War (2018)',
        slug: 'god-of-war--1',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/cobkt6.webp',
        rating: 4.8,
        releaseYear: '2018',
        genres: ['Ação', 'Mitologia', 'Aventura']
      }
    ]
  },
  {
    id: 'list_curated_2',
    slug: 'souls-likes-essenciais',
    name: 'Souls-likes & Desafios Brutais',
    description: 'Jogos para quem ama aprender cada padrão de ataque e superar chefes impiedosos.',
    ownerUsername: 'joysticked',
    ownerDisplayName: 'Joysticked',
    ownerAvatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=joysticked',
    isPublic: true,
    likesCount: 189,
    tags: ['Souls-like', 'Hardcore', 'RPG de Ação'],
    createdAt: '2024-02-14T10:00:00Z',
    updatedAt: '2024-06-01T16:00:00Z',
    gameCount: 5,
    games: [
      {
        id: 119133,
        name: 'Elden Ring',
        slug: 'elden-ring',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.webp',
        rating: 4.8,
        releaseYear: '2022',
        genres: ['RPG', 'Souls-like']
      },
      {
        id: 11133,
        name: 'Dark Souls III',
        slug: 'dark-souls-iii',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/cob9ed.webp',
        rating: 4.7,
        releaseYear: '2016',
        genres: ['RPG', 'Souls-like']
      },
      {
        id: 76882,
        name: 'Sekiro: Shadows Die Twice',
        slug: 'sekiro-shadows-die-twice',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2a23.webp',
        rating: 4.8,
        releaseYear: '2019',
        genres: ['Ação', 'Souls-like']
      },
      {
        id: 148241,
        name: 'Lies of P',
        slug: 'lies-of-p',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co6lxr.webp',
        rating: 4.5,
        releaseYear: '2023',
        genres: ['RPG', 'Souls-like']
      },
      {
        id: 7334,
        name: 'Bloodborne',
        slug: 'bloodborne',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/cob99l.webp',
        rating: 4.9,
        releaseYear: '2015',
        genres: ['RPG', 'Souls-like']
      }
    ]
  },
  {
    id: 'list_curated_3',
    slug: 'joias-indie-inesqueciveis',
    name: 'Joias Indie Inesquecíveis',
    description: 'Experiências autorais, trilhas sonoras memoráveis e gameplay inovador.',
    ownerUsername: 'joysticked',
    ownerDisplayName: 'Joysticked',
    ownerAvatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=joysticked',
    isPublic: true,
    likesCount: 215,
    tags: ['Indie', 'Arte', 'Metroidvania'],
    createdAt: '2024-03-02T18:00:00Z',
    updatedAt: '2024-06-12T11:20:00Z',
    gameCount: 5,
    games: [
      {
        id: 14593,
        name: 'Hollow Knight',
        slug: 'hollow-knight',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/cobfzp.webp',
        rating: 4.9,
        releaseYear: '2017',
        genres: ['Indie', 'Metroidvania', 'Plataforma']
      },
      {
        id: 113112,
        name: 'Hades',
        slug: 'hades',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/cob9kr.webp',
        rating: 4.8,
        releaseYear: '2020',
        genres: ['Indie', 'Roguelike', 'Ação']
      },
      {
        id: 26226,
        name: 'Celeste',
        slug: 'celeste',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/cob9dh.webp',
        rating: 4.8,
        releaseYear: '2018',
        genres: ['Indie', 'Plataforma', 'Narrativa']
      },
      {
        id: 26855,
        name: 'Dead Cells',
        slug: 'dead-cells',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co7jfv.webp',
        rating: 4.6,
        releaseYear: '2018',
        genres: ['Indie', 'Roguelike', 'Ação']
      },
      {
        id: 26472,
        name: 'Disco Elysium',
        slug: 'disco-elysium',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1sfj.webp',
        rating: 4.9,
        releaseYear: '2019',
        genres: ['Indie', 'RPG', 'Narrativa']
      }
    ]
  }
];
