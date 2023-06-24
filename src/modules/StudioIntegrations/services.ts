import ApiClient from "../../commons/ApiClient";

const Integrations = {
  connectDiscord: (payload: string) =>
    ApiClient.post(`/integrations/discord/connect`, payload),
  disconnectDiscord: (payload: string) =>
    ApiClient.post(`/integrations/discord/disconnect`, payload),
  connectSlack: (payload: string) =>
    ApiClient.post(`/integrations/slack/disconnect`, payload),
  disconnectSlack: (payload: string) =>
    ApiClient.post(`/integrations/slack/disconnect`, payload),
};
export default Integrations;
