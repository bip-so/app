import { AVATAR_PLACEHOLDER } from "../commons/constants";

export interface Feedback {
  name: string;
  company: string;
  avatarUrl: string;
  feedback: string;
}

export const USER_FEEDBACKS: Feedback[] = [
  {
    name: "Tarun",
    company: "IndieCrypto",
    avatarUrl:
      "https://cdn.discordapp.com/avatars/817419270274285598/7f32c7b92fa045324feb270c2e968612.png",
    feedback:
      "Finally used merge feature on BIP. Like the option 🤩. I can now freely share my ideas and ask people to contribute on them openly. Truly a great feature for DAOs",
  },

  {
    name: "Madhavan",
    company: "Founder, Questbook(YC W21)",
    avatarUrl: "https://bip.so/madhavan.jpeg",
    feedback:
      "I’m trying to build a DNA of documentation in our team and @bipThis bot on Slack has really made it super easy to motivate my team to write documents. I felt really empowered.",
  },

  {
    name: "Rohith Goyal",
    company: "Building JediSwap",
    avatarUrl: "https://bip.so/rohit.png",
    feedback:
      "Opensource collaboration is going to be a big part of the future. To collaborate between a large number of contributors spread around the world, most of the collaboration will happen over text. 1000s of people will want to work on the same documents. Even the brainstorming will happen over docs instead of on calls. BIP is the closest to anything I have seen so far that is leading us towards that future.",
  },
  {
    name: "City Roots",
    company: "City Roots DAO",
    avatarUrl:
      "https://pbs.twimg.com/profile_images/1568738858472292352/mIPgKYYb_400x400.jpg",
    feedback: "Great product! Always wanted something like this.",
  },

  {
    name: "Pareen",
    company: "Co-founder, Builders' Tribe",
    avatarUrl:
      "https://pbs.twimg.com/profile_images/1521419149620256773/pv9oKTf5_400x400.jpg",
    feedback:
      "Really amazing product 🙂 I love it. I want to say that I'd ditch. Roam + Notion completely with just bi-directional backlinks in bip",
  },

  {
    name: "Vishnu Saran",
    company: "Founder of StoryQube",
    avatarUrl: "https://bip.so/vishnu.jpeg",
    feedback:
      "Since I started building in public on bip.so I've got 3 different VC firms reach out to know more about us! Also a dev who's in Microsoft, has joined us part time and is contributing to our engineering.",
  },
];
