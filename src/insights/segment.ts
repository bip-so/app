import Analytics from "analytics";
import segmentPlugin from "@analytics/segment";
import { IBipUser, IUser } from "../modules/User/interfaces/IUser";
import { string } from "yup";

const analytics = Analytics({
  app: "bip-app",
  plugins: [
    segmentPlugin({
      writeKey:
        process.env.NEXT_PUBLIC_SEGMENT_CODE ||
        "GinTEvlfvEhijz1FpRi20QbUuuWrLbW5",
    }),
  ],
});

const segmentEvents = {
  identify: (userId: string, payload: any): any => {
    analytics.identify(userId, payload);
  },
  reelViewed: (
    studio_handle: string,
    page_key: string,
    reel_text: string,
    reel_id: number,
    creator_user_name: string
  ): any =>
    analytics.track("Studio Post Viewed", {
      item: "Studio Post Viewed",
      studio_handle: studio_handle,
      page_key: page_key,
      reel_text: reel_text,
      reel_id: reel_id,
      creator_user_name: creator_user_name,
    }),

  newStudioCreated: (
    studio_handle: string,
    user_id: number,
    email_id: string,
    username: string,
    studio_description: string,
    creator_user_id: string
  ): any =>
    analytics.track("Studio Created", {
      item: "Studio Created",
      studio_handle: studio_handle,
      user_id: user_id,
      email_id: email_id,
      username: username,
      studio_description: studio_description,
      creator_user_id: creator_user_id,
    }),

  signUpProfileSaved: (
    user_id: number,
    email_id: string,
    username: string,
    name: string
  ): any =>
    analytics.track("Sign up - Profile Saved", {
      item: "Sign up - Profile Saved",
      user_id: user_id,
      email_id: email_id,
      username: username,
      name: name,
    }),

  newStudioClick: (user_id: number, email_id: string, username: string): any =>
    analytics.track("Create Studio - Initiated", {
      item: "Create Studio - Initiated",
      user_id: user_id,
      email_id: email_id,
      username: username,
    }),

  studioJoined: (
    member_user_id: number,
    studio_handle: string,
    total_member_count: number,
    admin_user_id: number,
    admin_count: number
  ): any =>
    analytics.track("Studio Followed", {
      item: "Studio Followed",
      member_user_id: member_user_id,
      studio_handle: studio_handle,
      total_member_count: total_member_count,
      admin_user_id: admin_user_id,
      admin_count: admin_count,
    }),

  permissionEdited: (
    type: string,
    name: string,
    old_permission: string,
    new_permission: string,
    studio_handle: string,
    page_key: string
  ): any =>
    analytics.track("User Permission Edited", {
      item: "User Permission Edited",
      type: type,
      name: name,
      old_permission: old_permission,
      new_permission: new_permission,
      studio_handle: studio_handle,
      page_key: page_key,
    }),

  canvasEdited: (
    studio_handle: string,
    page_key: string,
    canvas_title: string,
    edited: string,
    contributers_count: number
  ): any =>
    analytics.track("Canvas Edited", {
      item: "Canvas Edited",
      studio_handle: studio_handle,
      page_key: page_key,
      canvas_title: canvas_title,
      edited: edited,
      contributers_count: contributers_count,
    }),

  canvasViewed: (
    studio_handle: string,
    page_key: string,
    canvas_title: string,
    contributers_count: number
  ): any =>
    analytics.track("Canvas Viewed", {
      item: "Canvas Viewed",
      studio_handle: studio_handle,
      page_key: page_key,
      canvas_title: canvas_title,
      contributers_count: contributers_count,
    }),

  canvasMoved: (
    studio_handle: string,
    page_key: string,
    canvas_title: string
  ): any =>
    analytics.track("Canvas Moved", {
      item: "Canvas Moved",
      studio_handle: studio_handle,
      page_key: page_key,
      canvas_title: canvas_title,
    }),

  roleCreated: (
    role_name: string,
    studio_handle: string,
    admin_user_id: number,
    admin_user_handle: string
  ): any =>
    analytics.track("Role Created", {
      item: "Role Created",
      role_name: role_name,
      studio_handle: studio_handle,
      admin_user_id: admin_user_id,
      admin_user_handle: admin_user_handle,
    }),

  roleDeleted: (
    members_count: number,
    role_name: string,
    studio_handle: string
  ): any =>
    analytics.track("Role Deleted", {
      item: "Role Deleted",
      members_count: members_count,
      role_name: role_name,
      studio_handle: studio_handle,
    }),

  studioDeleted: (studio_handle: string, total_members: number): any =>
    analytics.track("Studio Deleted", {
      item: "Studio Deleted",
      studio_handle: studio_handle,
      total_members: total_members,
    }),

  profileEdited: (
    user_id: number,
    email_id: string,
    profile_pic: boolean,
    old_user_handle: string,
    new_user_handle: string,
    old_user_name: string,
    new_user_name: string,
    old_description: string,
    new_description: string
  ): any =>
    analytics.track("Profile Edited", {
      item: "Profile Edited",
      user_id: user_id,
      email_id: email_id,
      profile_pic: profile_pic,
      old_user_handle: old_user_handle,
      new_user_handle: new_user_handle,
      old_user_name: old_user_name,
      new_user_name: new_user_name,
      old_description: old_description,
      new_description: new_description,
    }),

  notificationTrayOpened: (
    user_id: number,
    email_id: string,
    user_name: string,
    unread_notifications: string
  ): any =>
    analytics.track("Notification Tray Opened", {
      item: "Notification Tray Opened",
      user_id: user_id,
      email_id: email_id,
      user_name: user_name,
      unread_notifications: unread_notifications,
    }),

  notificationClicked: (
    type: string,
    to: string,
    user_id: number,
    discord_id: string,
    product_id: string,
    page_key: string,
    page_id: string,
    email_id: string,
    source: string
  ): any =>
    analytics.track("Notification Clicked", {
      item: "Notification Clicked",
      type: type,
      to: to,
      user_id: user_id,
      discord_id: discord_id,
      product_id: product_id,
      page_key: page_key,
      page_id: page_id,
      email_id: email_id,
      source: source,
    }),

  loggedIn: (
    type: string,
    user_handle: string,
    user_id: number,
    new_user: boolean
  ): any =>
    analytics.track("Logged In", {
      item: "Logged In",
      type: type,
      user_handle: user_handle,
      user_id: user_id,
      new_user: new_user,
    }),

  loggedOut: (user_id: number, email_id: string, user_name: string): any =>
    analytics.track("Logged Out", {
      item: "Logged Out",
      user_id: user_id,
      email_id: email_id,
      user_name: user_name,
    }),

  homePageViewed: (user_id: number, email_id: string, user_name: string): any =>
    analytics.track("Home Page Viewed", {
      item: "Home Page Viewed",
      user_id: user_id,
      email_id: email_id,
      user_name: user_name,
    }),

  explorePageViewed: (
    user_id: number,
    email_id: string,
    user_name: string
  ): any =>
    analytics.track("Explore Page Viewed", {
      item: "Explore Page Viewed",
      user_id: user_id,
      email_id: email_id,
      user_name: user_name,
    }),
  signedUp: (
    provider: string,
    user_handle: string,
    user_id: number,
    email_id: string
  ): any =>
    analytics.track("Signed Up", {
      item: "Signed Up",
      provider: provider,
      user_handle: user_handle,
      user_id: user_id,
      email_id: email_id,
    }),
  userViewed: (
    user_id: number,
    username: string,
    viewed_user_id: number,
    viewed_username: string
  ): any =>
    analytics.track("User Viewed", {
      item: "User Viewed",
      user_id: user_id,
      username: username,
      viewed_user_id: viewed_user_id,
      viewed_username: viewed_username,
    }),

  userFollowed: (
    user_id: number,
    username: string,
    email_id: string,
    followed_user_id: number,
    followed_username: string
  ): any =>
    analytics.track("User Followed", {
      item: "User Followed",
      user_id: user_id,
      username: username,
      email_id: email_id,
      followed_user_id: followed_user_id,
      followed_username: followed_username,
    }),

  studioEdited: (
    old_studio_handle: string,
    new_studio_handle: string,
    old_studio_name: string,
    new_studio_name: string,
    old_studio_description: string,
    new_studio_description: string
  ): any =>
    analytics.track("Studio Edited", {
      item: "Studio Edited",
      old_studio_handle: old_studio_handle,
      new_studio_handle: new_studio_handle,
      old_studio_name: old_studio_name,
      new_studio_name: new_studio_name,
      old_studio_description: old_studio_description,
      new_studio_description: new_studio_description,
    }),

  shareOptionsOpened: (
    studio_handle: string,
    page_key: string,
    user_id: number
  ): any =>
    analytics.track("Share Options Opened", {
      item: "Share Options Opened",
      studio_handle: studio_handle,
      page_key: page_key,
      user_id: user_id,
    }),

  canvasDeleted: (
    studio_handle: string,
    page_key: string,
    canvas_title: string,
    user_id: number
  ): any =>
    analytics.track("Canvas Deleted", {
      item: "Canvas Deleted",
      studio_handle: studio_handle,
      page_key: page_key,
      canvas_title: canvas_title,
      user_id: user_id,
    }),

  canvasCreated: (
    studio_handle: string,
    page_key: string,
    user_id: number
  ): any =>
    analytics.track("Canvas Created", {
      item: "Canvas Created",
      studio_handle: studio_handle,
      page_key: page_key,
      user_id: user_id,
    }),

  canvasPublished: (
    canvas_title: string,
    page_key: string,
    studio_handle: string,
    is_self: boolean,
    user_id: number
  ): any =>
    analytics.track("Canvas Published", {
      item: "Canvas Published",
      canvas_title: canvas_title,
      page_key: page_key,
      studio_handle: studio_handle,
      is_self: is_self,
      user_id: user_id,
    }),

  canvasPublishRequested: (
    canvas_title: string,
    page_key: string,
    studio_handle: string,
    user_id: number
  ): any =>
    analytics.track("Canvas Publish Requested", {
      item: "Canvas Publish Requested",
      canvas_title: canvas_title,
      page_key: page_key,
      studio_handle: studio_handle,
      user_id: user_id,
    }),

  canvasPublishRejected: (
    canvas_title: string,
    page_key: string,
    studio_handle: string,
    user_id: number
  ): any =>
    analytics.track("Canvas Publish Rejected", {
      item: "Canvas Publish Rejected",
      canvas_title: canvas_title,
      page_key: page_key,
      studio_handle: studio_handle,
      user_id: user_id,
    }),

  canvasMerged: (
    studio_handle: string,
    page_key: string,
    canvas_title: string,
    user_id: number,
    is_self: boolean,
    accepted_changes: any
  ): any =>
    analytics.track("Canvas Merged", {
      item: "Canvas Merged",
      studio_handle: studio_handle,
      page_key: page_key,
      canvas_title: canvas_title,
      user_id: user_id,
      is_self: is_self,
      accepted_changes: accepted_changes,
    }),

  canvasMergeRequested: (
    studio_handle: string,
    page_key: string,
    canvas_title: string,
    user_id: number
  ): any =>
    analytics.track("Canvas Merge Requested", {
      item: "Canvas Merge Requested",
      studio_handle: studio_handle,
      page_key: page_key,
      canvas_title: canvas_title,
      user_id: user_id,
    }),

  canvasMergeRejected: (
    studio_handle: string,
    page_key: string,
    canvas_title: string,
    user_id: number,
    is_self: boolean,
    rejected_changes: any
  ): any =>
    analytics.track("Canvas Merge Rejected", {
      item: "Canvas Merge Rejected",
      studio_handle: studio_handle,
      page_key: page_key,
      canvas_title: canvas_title,
      user_id: user_id,
      is_self: is_self,
      rejected_changes: rejected_changes,
    }),

  reactionAdded: (
    studio_handle: string,
    page_key: string,
    user_id: number,
    to: string
  ): any =>
    analytics.track("Reaction Added", {
      item: "Reaction Added",
      studio_handle: studio_handle,
      page_key: page_key,
      user_id: user_id,
      to: to,
    }),

  reactionDeleted: (
    studio_handle: string,
    page_key: string,
    user_id: number,
    to: string
  ): any =>
    analytics.track("Reaction Deleted", {
      item: "Reaction Deleted",
      studio_handle: studio_handle,
      page_key: page_key,
      user_id: user_id,
      to: to,
    }),

  commentAdded: (
    studio_handle: string,
    page_key: string,
    user_id: number,
    to: string
  ): any =>
    analytics.track("Comment Added", {
      item: "Comment Added",
      studio_handle: studio_handle,
      page_key: page_key,
      user_id: user_id,
      to: to,
    }),

  commentDeleted: (
    studio_handle: string,
    page_key: string,
    user_id: number,
    to: string
  ): any =>
    analytics.track("Comment Deleted", {
      item: "Comment Deleted",
      studio_handle: studio_handle,
      page_key: page_key,
      user_id: user_id,
      to: to,
    }),

  reelCreated: (
    studio_handle: string,
    page_key: string,
    canvas_title: string,
    reel_text: string,
    blocks: number,
    user_id: number
  ): any =>
    analytics.track("Post Created", {
      item: "Post Created",
      studio_handle: studio_handle,
      page_key: page_key,
      canvas_title: canvas_title,
      reel_text: reel_text,
      blocks: blocks,
      user_id: user_id,
    }),

  reelDeleted: (
    studio_handle: string,
    page_key: string,
    canvas_title: string,
    reel_text: string,
    blocks: number,
    user_id: number
  ): any =>
    analytics.track("Post Deleted", {
      item: "Post Deleted",
      studio_handle: studio_handle,
      page_key: page_key,
      canvas_title: canvas_title,
      reel_text: reel_text,
      blocks: blocks,
      user_id: user_id,
    }),

  loginPopupOpened: () =>
    analytics.track("Login - Popup Opened", { item: "Login - Popup Opened" }),

  loginTwitterSelected: () =>
    analytics.track("Login - Twitter Selected", {
      item: "Login - Twitter Selected",
    }),

  loginOTPSelected: () =>
    analytics.track("Login - OTP Selected", { item: "Login - OTP Selected" }),

  loginEmailSelected: () =>
    analytics.track("Login - Email Selected", {
      item: "Login - Email Selected",
    }),

  loginSlackSelected: () =>
    analytics.track("Login - Slack Selected", {
      item: "Login - Slack Selected",
    }),

  loginDiscordSelected: () =>
    analytics.track("Login - Discord Selected", {
      item: "Login - Discord Selected",
    }),

  canvasAccessChanged: (
    studio_handle: string,
    page_key: string,
    canvas_title: string,
    old_access: string,
    new_access: string
  ): any =>
    analytics.track("Canvas Access Changed", {
      item: "Canvas Access Changed",
      studio_handle: studio_handle,
      page_key: page_key,
      canvas_title: canvas_title,
      old_access: old_access,
      new_access: new_access,
    }),

  searchStarted: (
    user_id: number,
    user_name: string,
    search_text: string,
    scope: string
  ): any =>
    analytics.track("Search Started", {
      item: "Search Started",
      user_id: user_id,
      user_name: user_name,
      search_text: search_text,
      scope: scope,
    }),

  searchFiltered: (filtered_by: string): any =>
    analytics.track("Search Filtered", {
      item: "Search Filtered",
      filtered_by: filtered_by,
    }),

  loginEmailInput: (email: string): any =>
    analytics.track("Login - Email Input", {
      item: "Login - Email Input",
      email: email,
    }),

  studioViewed: (studio_handle: string, user_id: number): any =>
    analytics.track("Studio Viewed", {
      item: "Studio Viewed",
      studio_handle: studio_handle,
      user_id: user_id,
    }),

  bipMarkUsed: (
    Source: string,
    page_key: string,
    studio_handle: string,
    user_name: string
  ): any =>
    analytics.track("BipMark Used", {
      item: "BipMark Used",
      Source: Source,
      page_key: page_key,
      studio_handle: studio_handle,
      user_name: user_name,
    }),

  bipMarkDeleted: (
    Source: string,
    page_key: string,
    studio_handle: string,
    user_name: string
  ): any =>
    analytics.track("BipMark Deleted", {
      item: "BipMark Deleted",
      Source: Source,
      page_key: page_key,
      studio_handle: studio_handle,
      user_name: user_name,
    }),

  mentionAdded: (
    type: string,
    source: string,
    username: string,
    mentioned_username: string,
    role_name: string,
    studio_handle: string,
    page_key: string,
    reel_id: number
  ): any =>
    analytics.track("Mention Added", {
      item: "Mention Added",
      type: type,
      source: source,
      username: username,
      mentioned_username: mentioned_username,
      role_name: role_name,
      studio_handle: studio_handle,
      page_key: page_key,
      reel_id: reel_id,
    }),

  leftRailOpened: (
    studio_handle: string,
    page_key: string,
    canvas_title: string,
    user_id: number
  ): any =>
    analytics.track("Left Rail Opened", {
      item: "Left Rail Opened",
      studio_handle: studio_handle,
      page_key: page_key,
      canvas_title: canvas_title,
      user_id: user_id,
    }),

  userInvited: (
    user_handle: string,
    tags: any,
    permission: string,
    studio_handle: string,
    page_key: string,
    user_id: number,
    to: string
  ): any =>
    analytics.track("User(s) Invited", {
      item: "User(s) Invited",
      user_handle: user_handle,
      tags: tags,
      permission: permission,
      studio_handle: studio_handle,
      page_key: page_key,
      to: to,
    }),

  integrationConnected: (
    provider: string,
    studio_handle: string,
    user_id: number
  ): any =>
    analytics.track(`${provider} Connected`, {
      studio_handle: studio_handle,
      user_id: user_id,
    }),

  integrationDisconnected: (
    provider: string,
    studio_handle: string,
    user_id: number
  ): any =>
    analytics.track(`${provider} Disconnected`, {
      studio_handle: studio_handle,
      user_id: user_id,
    }),

  pageView: () => analytics.page(),

  pricingViewed: (user_id: number): any =>
    analytics.track("Pricing Page Viewed", {
      item: "Pricing Page Viewed",
      user_id: user_id,
    }),

  studioSettingOpened: (
    studio_handle: string,
    user_id: number,
    studio_description: string,
    creator_user_id: string
  ): any =>
    analytics.track("Studio Settings Opened", {
      item: "Studio Settings Opened",
      studio_handle: studio_handle,
      user_id: user_id,
      studio_description: studio_description,
      creator_user_id: creator_user_id,
    }),

  upgradeInitiated: (
    studio_handle: string,
    user_id: number,
    user_name: string,
    source: string
  ): any =>
    analytics.track("Upgrade Initiated", {
      item: "Upgrade Initiated",
      studio_handle: studio_handle,
      user_id: user_id,
      user_name: user_name,
      source: source,
    }),

  viewedCustomerPortal: (user_id: number): any =>
    analytics.track("Viewed Customer Portal", {
      item: "Viewed Customer Portal",
      user_id: user_id,
    }),

  planPurchased: (user_id: number): any =>
    analytics.track("Plan Purchased", {
      item: "Plan Purchased",
      user_id: user_id,
    }),

  planDowngraded: (user_id: number): any =>
    analytics.track("Plan Downgraded", {
      item: "Plan Downgraded",
      user_id: user_id,
    }),

  signUpCreateStudioSelected: (
    user_id: number,
    user_name: string,
    path: string
  ): any =>
    analytics.track("Sign Up - Create Studio Selected", {
      item: "Sign Up - Create Studio Selected",
      user_id: user_id,
      user_name: user_name,
      path: path,
    }),

  signUpStudioCreated: (
    studio_handle: string,
    user_id: number,
    user_name: string,
    path: string
  ): any =>
    analytics.track("Sign Up - Studio Created", {
      item: "Sign Up - Studio Created",
      studio_handle: studio_handle,
      user_id: user_id,
      user_name: user_name,
      path: path,
    }),

  landingPageViewed: (params?: any) =>
    analytics.track("Landing Page Viewed", {
      item: "Landing Page Viewed",
      ...params,
    }),

  signUpSecondaryCTAClicked: () =>
    analytics.track("Sign Up - Join Community Clicked", {
      item: "Sign Up - Join Community Clicked",
    }),

  signUpLoginClicked: (source: string) =>
    analytics.track("Sign Up - Login/SignUp Clicked", {
      item: "Sign Up - Login/SignUp Clicked",
      source: source,
    }),
};

export default segmentEvents;
