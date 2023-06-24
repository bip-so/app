export interface StudioList {
  id: number;
  displayName: string;
  handle: string;
  img: string;
  description: string;
  membersCount: number;
  tags: string[];
}

export const STUDIOS_LIST: StudioList[][] = [
  [
    {
      id: 1,
      displayName: "Mesh Finance",
      handle: "meshfinance",
      img: "/featured-studios/mesh.png",
      description:
        "A place to collaborate and build an open financial ecosystem for the world.",
      membersCount: 22395,
      tags: ["cryptocurrency", "defi", "finance", "ethereum", "bitcoin"],
    },
    {
      id: 2,
      displayName: "Truts",
      handle: "truts",
      img: "/featured-studios/truts.png",
      description: "Discover the best communities for you in web3",
      membersCount: 1004,
      tags: ["web3", "web3", "web3", "web3", "web3", "web3"],
    },
    {
      id: 3,
      displayName: "Node Star DAO",
      handle: "nodestar",
      img: "/featured-studios/nodestar.png",
      description:
        "Node Star DAO is a Web3 startup, working on decentralizing internet infrastructure; sharing ownership, equity, and profits, like a co-op. Join us!",
      membersCount: 118,
      tags: [
        "decentralization",
        "web3",
        "blockchain",
        "internet",
        "infrastructure",
        "DAO",
      ],
    },
  ],
  [
    {
      id: 4,
      displayName: "Storyqube",
      handle: "storyqube",
      img: "/featured-studios/storyqube.png",
      description:
        "We build interactive stories and games for voice enabled devices",
      membersCount: 24,
      tags: [
        "tech",
        "product",
        "stories",
        "storytelling",
        "voice",
        "interactive devices",
      ],
    },
    ,
    {
      id: 5,
      displayName: "Pesto Discord Server",
      handle: "pestodiscordserver",
      img: "/featured-studios/pesto.png",
      description: "A community for next gen of devs in India",
      membersCount: 3826,
      tags: [],
    },
    {
      id: 6,
      displayName: "QuestBook",
      handle: "questbook",
      img: "/featured-studios/questbook.png",
      description:
        "Questbook is a decentralized university where 10000+ developers are building on web3 and earning cryptos and NFTs along the way.",
      membersCount: 14248,
      tags: ["web3", "solidity", "solana", "NEAR", "development"],
    },
  ],
  [
    {
      id: 7,
      displayName: "SuperteamDAO",
      handle: "superteamdao",
      img: "/featured-studios/superteam.png",
      description: "Helping Solana projects launch and grow",
      membersCount: 5236,
      tags: [],
    },
    {
      id: 8,
      displayName: "NeptuneChain",
      handle: "neptunechain",
      img: "/featured-studios/random1.png",
      description:
        "We're on a mission to help communities avoid water quality catastrophes by building radically new systems for pollution removal and intuitive economies.",
      membersCount: 84,
      tags: ["tech", "climate", "product", "water", "pollution"],
    },
    {
      id: 9,
      displayName: "Today I Learned",
      handle: "TIL_",
      img: "https://bip-assets.s3.eu-west-1.amazonaws.com/products/574dd28d-c3cd-43ed-93d1-37217eb0ff851648293181.jpg",
      description:
        "Everyday during morning workout, I watch Youtube. I publish the best of them here. Join me in discussing the lessons learnt from these videos!",
      membersCount: 312,
      tags: ["#products", "#entrepreneurship", "#youtube"],
    },
  ],
  [
    {
      id: 10,
      displayName: "1000Founders Community",
      handle: "1000f",
      img: "https://d1uyo0yzpsnvfq.cloudfront.net/studio/771564e7-f27f-49b6-9c38-775a779aec87/color-logo-with-background.png",
      description:
        "We are a Founders Community of over 310+ founders, helping you go from zero to PM-Fit in 1 year",
      membersCount: 3751,
      tags: ["web3", "Crypto", "NFTs", "$UNITY"],
    },
    {
      id: 11,
      displayName: "Language Cafe",
      handle: "LanguageCafe",
      img: "https://d1uyo0yzpsnvfq.cloudfront.net/studio/07bea81a-c0e7-4b93-b86a-6b83fe6ae461/lc_logo_1.png",
      description: "",
      membersCount: 6194,
      tags: [
        "language",
        "learning",
        "english",
        "french",
        "spanish",
        "german",
        "japanese",
        "korean",
      ],
    },
    {
      id: 12,
      displayName: "partnr",
      handle: "partnr",
      img: "https://bip-assets.s3.eu-west-1.amazonaws.com/products/eaae0b2e-153d-4c16-9c51-cf6d40a3cd35.jpg",
      description:
        "On-chain credentialing and credibility - Tokenising Skillset",
      membersCount: 484,
      tags: ["dao", "blockchain", "crypto"],
    },
  ],
];

export const STUDIOS_LIST_MOBILE: StudioList[] = [
  {
    id: 1,
    displayName: "Mesh Finance",
    handle: "meshfinance",
    img: "/featured-studios/mesh.png",
    description:
      "A place to collaborate and build an open financial ecosystem for the world.",
    membersCount: 22395,
    tags: ["cryptocurrency", "defi", "finance", "ethereum", "bitcoin"],
  },
  {
    id: 2,
    displayName: "Truts",
    handle: "truts",
    img: "/featured-studios/truts.png",
    description: "Discover the best communities for you in web3",
    membersCount: 1004,
    tags: ["web3", "web3", "web3", "web3", "web3", "web3"],
  },
  {
    id: 3,
    displayName: "Node Star DAO",
    handle: "nodestar",
    img: "/featured-studios/nodestar.png",
    description:
      "Node Star DAO is a Web3 startup, working on decentralizing internet infrastructure; sharing ownership, equity, and profits, like a co-op. Join us!",
    membersCount: 118,
    tags: [
      "decentralization",
      "web3",
      "blockchain",
      "internet",
      "infrastructure",
      "DAO",
    ],
  },
  {
    id: 4,
    displayName: "Storyqube",
    handle: "storyqube",
    img: "/featured-studios/storyqube.png",
    description:
      "We build interactive stories and games for voice enabled devices",
    membersCount: 24,
    tags: [
      "tech",
      "product",
      "stories",
      "storytelling",
      "voice",
      "interactive devices",
    ],
  },
  {
    id: 5,
    displayName: "Pesto Discord Server",
    handle: "pestodiscordserver",
    img: "/featured-studios/pesto.png",
    description: "A community for next gen of devs in India",
    membersCount: 3826,
    tags: [],
  },
  {
    id: 6,
    displayName: "QuestBook",
    handle: "questbook",
    img: "/featured-studios/questbook.png",
    description:
      "Questbook is a decentralized university where 10000+ developers are building on web3 and earning cryptos and NFTs along the way.",
    membersCount: 14248,
    tags: ["web3", "solidity", "solana", "NEAR", "development"],
  },
  {
    id: 7,
    displayName: "SuperteamDAO",
    handle: "superteamdao",
    img: "/featured-studios/superteam.png",
    description: "Helping Solana projects launch and grow",
    membersCount: 5236,
    tags: [],
  },
  {
    id: 8,
    displayName: "NeptuneChain",
    handle: "neptunechain",
    img: "/featured-studios/random1.png",
    description:
      "We're on a mission to help communities avoid water quality catastrophes by building radically new systems for pollution removal and intuitive economies.",
    membersCount: 84,
    tags: ["tech", "climate", "product", "water", "pollution"],
  },
  {
    id: 9,
    displayName: "Today I Learned",
    handle: "TIL_",
    img: "https://bip-assets.s3.eu-west-1.amazonaws.com/products/574dd28d-c3cd-43ed-93d1-37217eb0ff851648293181.jpg",
    description:
      "Everyday during morning workout, I watch Youtube. I publish the best of them here. Join me in discussing the lessons learnt from these videos!",
    membersCount: 312,
    tags: ["#products", "#entrepreneurship", "#youtube"],
  },
  {
    id: 10,
    displayName: "1000Founders Community",
    handle: "1000f",
    img: "https://d1uyo0yzpsnvfq.cloudfront.net/studio/771564e7-f27f-49b6-9c38-775a779aec87/color-logo-with-background.png",
    description:
      "We are a Founders Community of over 310+ founders, helping you go from zero to PM-Fit in 1 year",
    membersCount: 3751,
    tags: ["web3", "Crypto", "NFTs", "$UNITY"],
  },
  {
    id: 11,
    displayName: "Language Cafe",
    handle: "LanguageCafe",
    img: "https://d1uyo0yzpsnvfq.cloudfront.net/studio/07bea81a-c0e7-4b93-b86a-6b83fe6ae461/lc_logo_1.png",
    description: "",
    membersCount: 6194,
    tags: [
      "language",
      "learning",
      "english",
      "french",
      "spanish",
      "german",
      "japanese",
      "korean",
    ],
  },
  {
    id: 12,
    displayName: "partnr",
    handle: "partnr",
    img: "https://bip-assets.s3.eu-west-1.amazonaws.com/products/eaae0b2e-153d-4c16-9c51-cf6d40a3cd35.jpg",
    description: "On-chain credentialing and credibility - Tokenising Skillset",
    membersCount: 484,
    tags: ["dao", "blockchain", "crypto"],
  },
];
