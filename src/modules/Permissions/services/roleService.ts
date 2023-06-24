import ApiClient from "../../../commons/ApiClient";

const RoleService = {
  getRoleMembers: (roleId: number, skip: number = 0) =>
    ApiClient.get(`/member/role/${roleId}?skip=${skip}`),
  searchRoleMembers: (roleId: number, search: string = "", skip: number = 0) =>
    ApiClient.get(
      `/member/role/${roleId}/search-members?search=${search}&skip=${skip}`
    ),
};

export default RoleService;
