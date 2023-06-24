export type NotificationsType = {
    type: string;
    studioID?: string | number;
};

export type AcceptMergeRequestType = {
    canvasBranchID: string | number;
    mergeRequestID: string | number;
    payload: {
        status: string,
        commitMessage: string,
    }
};

export type AcceptPublishRequestType = {
    canvasBranchID: string | number;
    publishRequestID: string | number;
};

export type UpdateSettingsPayload ={
    data:[
        {
            allComments: boolean,
            darkMode: boolean,
            followedMe: boolean,
            followedMyStudio: boolean,
            id: number,
            invite: boolean,
            mentions: boolean,
            publishAndMergeRequests: boolean,
            reactions: boolean,
            repliesToMe: boolean,
            responseToMyRequests: boolean,
            systemNotifications: boolean,
            type: string,
            userId: number,
        },
        {
                allComments: boolean,
                darkMode: boolean,
                followedMe: boolean,
                followedMyStudio: boolean,
                id: number,
                invite: boolean,
                mentions: boolean,
                publishAndMergeRequests: boolean,
                reactions: boolean,
                repliesToMe: boolean,
                responseToMyRequests: boolean,
                systemNotifications: boolean,
                type: string,
                userId: number,
        },
        {
                allComments: boolean,
                darkMode: boolean,
                followedMe: boolean,
                followedMyStudio: boolean,
                id: number,
                invite: boolean,
                mentions: boolean,
                publishAndMergeRequests: boolean,
                reactions: boolean,
                repliesToMe: boolean,
                responseToMyRequests: boolean,
                systemNotifications: boolean,
                type: string,
                userId: number,
        },
    ]
}