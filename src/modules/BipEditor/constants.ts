export const EMBEDS = [
  {
    type: "youtube",
    regex:
      /^(?:https?:)?\/\/[^\/]*(?:youtube(?:-nocookie)?.com|youtu.be).*[=\/]([-\w]{11})(?:\?|=|&|$)/i,
    getEmbedURL: (url, regex) => {
      let match = url.match(regex);
      return `https://www.youtube.com/embed/${match[1]}`;
    },
  },
  {
    type: "figma",
    regex:
      /https:\/\/([\w\.-]+\.)?figma.com\/(file|proto)\/([0-9a-zA-Z]{22,128})(?:\/.*)?$/i,
    getEmbedURL: (url, regex) =>
      `https://www.figma.com/embed?embed_host=bip&url=${url}`,
  },
  {
    type: "loom",
    regex:
      /^(?:(?:https?):)?(?:\/\/)?[^\/]*loom.com.*[=\/](?:share|embed)\/([-\w]+)/i,
    getEmbedURL: (url, regex) => {
      let match = url.match(regex);
      return `https://loom.com/embed/${match[1]}`;
    },
  },
  {
    type: "replit",
    regex: /^(?:(?:https?):)?(?:\/\/)?[^\/]*replit.com.*/i,
    getEmbedURL: (url, regex) => {
      return `${url}?embed=true`;
    },
  },

  {
    type: "codesandbox",
    regex:
      /^(?:(?:https?):)?(?:\/\/)?[^\/]*codesandbox.io\/(?:s|embed)\/([^?\/\s]*)/i,
    getEmbedURL: (url, regex) => {
      let match = url.match(regex);
      return `https://codesandbox.io/embed/${match[1]}?codemirror=1&hidenavigation=1&theme=dark&runonclick=1`;
    },
  },
  {
    type: "miro",
    regex: /^(?:(?:https?):)?(?:\/\/)?[^\/]*miro.com\/app\/board\/([^?\/\s]*)/i,
    getEmbedURL: (url, regex) => {
      let match = url.match(regex);
      let moveToWidget = new URL(url).searchParams.get("moveToWidget");
      return `https://miro.com/app/live-embed/${match[1]}?embedAutoplay=true&${
        moveToWidget ? `moveToWidget=${moveToWidget}` : ""
      }`;
    },
  },
  {
    type: "googledrive",
    regex:
      /^(?:(?:https?):)?(?:\/\/)?[^\/]*drive.google.com\/(drive\/folders|file\/d)\/([^?\/\s]*)/i,
    getEmbedURL: (url, regex) => {
      let match = url.match(regex);
      return match[1] === "drive/folders"
        ? `https://drive.google.com/embeddedfolderview?id=${match[2]}`
        : `https://drive.google.com/file/d/${match[2]}/preview`;
    },
  },
  {
    type: "googlesheet",
    regex:
      /^(?:(?:https?):)?(?:\/\/)?[^\/]*docs.google.com\/spreadsheets\/d\/([^?\/\s]*)/i,
    getEmbedURL: (url, regex) => {
      let match = url.match(regex);
      return `https://docs.google.com/spreadsheets/d/${match[1]}`;
    },
  },
  {
    type: "tweet",
    regex:
      /((https?):\/\/)?(www.)?twitter\.com(\/@?(\w){1,15})\/status\/[0-9]{19}/i,
    getEmbedURL: (url, regex) => {
      return url;
    },
  },
  //'googlemap',
  //'codepen',
  //'ogmetatag',
];

export const INLINE_VOID_BLOCK_TYPES = [
  "loading",
  "image",
  "attachment",
  "embed",
  "pageMention",
  "userMention",
  "excalidraw",
  "drawio",
  "video",
  "hr",
  "toc",
].concat(EMBEDS.map((x) => x.type));

export const NON_TEXT_BLOCKS = [
  "image",
  "attachment",
  "embed",
  "excalidraw",
  "drawio",
  "video",
  "hr",
  "toc",
  "callout",
  "simple_table_v1",
  "table-row",
  "table-cell",
  "code",
].concat(EMBEDS.map((x) => x.type));

export const MEDIA_BLOCK_TYPES = INLINE_VOID_BLOCK_TYPES.filter(
  (x) => x !== "userMention" && x !== "pageMention"
);

export const LIST_TYPES = ["olist", "ulist", "checklist"];

export const COMMENT_THREAD_PREFIX = "commentThread_";
export const REEL_THREAD_PREFIX = "reelThread_";

export const ALLOWED_LANGUAGES = ["js", "css", "html", "python", "sql", "java"];

export const BRACKETS = [
  { opening: "<", closing: ">" },
  { opening: "(", closing: ")" },
  { opening: "[", closing: "]" },
  { opening: "{", closing: "}" },
  { opening: "'", closing: "'" },
  { opening: '"', closing: '"' },
];
