import { OAuthProviderType } from "next-auth/providers";
import slugify from "slugify";

const BIP_RESERVERED_TITLES = ["public", "merge-req", "history"];
export const canvasSlug = (
  canvasName: string | undefined | null,
  isDraft?: boolean
) => {
  const processedCanvasSlug =
    slugify(canvasName ?? "bip-canvas", {
      lower: true,
    }) || "untitled";
  const isReserved = BIP_RESERVERED_TITLES.includes(processedCanvasSlug);
  const slug = `${processedCanvasSlug}${isDraft ? "-draft" : ""}`;
  return isReserved ? `-${slug}` : slug;
};

const BipRouteUtils = {
  // Common
  getHomeRoute: () => "/",
  getExploreRoute: () => "/explore",
  getHandleRoute: (handle: string) => `/${handle}`,

  // Auth
  getSignInRoute: (returnUrl?: string) =>
    `/auth/signin${returnUrl ? "?returnUrl=" + returnUrl : ""}`,
  getPricingRoute: (returnUrl?: string) =>
    `/pricing${returnUrl ? "?returnUrl=" + returnUrl : ""}`,
  getSetupRoute: (returnUrl?: string) =>
    `/auth/setup${returnUrl ? "?returnUrl=" + returnUrl : ""}`,
  getOnboardingRoute: (returnUrl?: string) =>
    `/auth/onboarding${returnUrl ? "?returnUrl=" + returnUrl : ""}`,
  getSocialRedirectRoute: (
    provider: OAuthProviderType,
    returnUrl?: string,
    fromIntegration?: boolean
  ) =>
    `/auth/social-redirect?provider=${provider}${
      returnUrl ? "&returnUrl=" + returnUrl : ""
    }${fromIntegration ? "&fromIntegration=true" : ""}`,
  getDiscordIntegrationRoute: (returnUrl?: string) =>
    `/discord-integration${returnUrl ? "?returnUrl=" + returnUrl : ""}`,

  // Studio
  getStudioAboutRoute: (handle: string, fromIntegration?: boolean) =>
    `/${handle}/about${fromIntegration ? "?open_settings=true&tab=3" : ""}`,
  getProfileRoute: (handle: string) => `/${handle}`,

  // Canvas
  // getCanvasRoute: (
  //   handle: string,
  //   repoKey: string,
  //   canvasName: string,
  //   branchId?: number,
  //   isPublic?: boolean,
  //   isDraft?: boolean,
  //   isNew?: boolean
  // ) =>
  //   `/${handle}/c/${repoKey}/${branchId || ""}/${canvasSlug(canvasName)}${
  //     isDraft ? "~draft" : ""
  //   }${isPublic ? "?isPublic=true" : ""}${isNew ? "?isNew=true" : ""}`,
  getCanvasRoute: (
    handle: string,
    canvasName: string,
    branchId: number,
    isPublic?: boolean,
    isDraft?: boolean,
    isNew?: boolean
  ) =>
    `/${handle}/${canvasSlug(canvasName, isDraft)}-${branchId}c${
      isPublic ? "?isPublic=true" : ""
    }${isNew ? "?isNew=true" : ""}`,

  getCanvasSlugRoute: (handle: string, slug: string) => `/${handle}/${slug}`,

  getRepoRoute: (handle: string, repoKey: string) => `/${handle}/c/${repoKey}/`,

  // getPublicCanvasRoute: (
  //   handle: string,
  //   repoKey: string,
  //   canvasName: string,
  //   branchId?: number
  // ) =>
  //   `/${handle}/c/${repoKey}/${branchId || ""}/${canvasSlug(
  //     canvasName
  //   )}/public`,

  getPublicCanvasRoute: (
    handle: string,
    canvasName: string,
    branchId?: number
  ) => `/${handle}/${canvasSlug(canvasName)}-${branchId}c/public`,

  getCommitRoute: (
    handle: string,
    canvasName: string,
    branchId: number,
    commitId: string
  ) => `/${handle}/${canvasSlug(canvasName)}-${branchId}c/history/${commitId}`,
  getMergeRequestRoute: (
    handle: string,
    canvasName: string,
    branchId: number,
    mergeId: number
  ) => `/${handle}/${canvasSlug(canvasName)}-${branchId}c/merge-req/${mergeId}`,

  getCanvasInviteCodeRoute: (
    handle: string,
    inviteCode: string,
    title: string
  ) => `/${handle}/canvas-invite-token/${inviteCode}?canvasTitle=${title}`,

  // Permissions
  getCollectionPermissionRoute: (handle: string, collectionId: number) =>
    `/${handle}/collection/${collectionId}/settings`,
  getCollectionRoute: (handle: string, collectionId: number) =>
    `/${handle}/collection/${collectionId}`,
  getPublicCollectionRoute: (handle: string, collectionId: number) =>
    `/${handle}/collection/${collectionId}/public`,
  getDiscordStudioIntegrationRedirectRoute: (
    userId: number,
    studioId?: number,
    guildId?: string,
    partnerIntegrationId?: string
  ) =>
    `${process.env.NEXT_PUBLIC_API_URL}/${
      process.env.NEXT_PUBLIC_BIP_API_VERSION
    }/integrations/discord/connect/?studioId=${studioId ?? 0}&userId=${userId}${
      guildId ? `&guildId=${guildId}` : ""
    }${
      partnerIntegrationId
        ? `&partnerIntegrationId=${partnerIntegrationId}`
        : ""
    }`,

  getBranchIdFromCanvasSlug: (slug: string) => {
    if (!slug) return null;
    const slugTokens = slug.split("-");
    const branchParam = slug.split("-")[slugTokens.length - 1];
    const branchId = parseInt(branchParam.slice(0, -1) as string);

    return branchId;
  },
};

export default BipRouteUtils;
