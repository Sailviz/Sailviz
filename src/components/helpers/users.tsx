export class AVAILABLE_PERMISSIONS {
    static readonly editSeries: PermissionType = { value: "editSeries", label: "Edit Series" }
    static readonly editRaces: PermissionType = { value: "editRaces", label: "Edit Races" }
    static readonly editFleets: PermissionType = { value: "editFleets", label: "Edit Fleets" }
    static readonly editResults: PermissionType = { value: "editResults", label: "Edit Results" }
    static readonly editSettings: PermissionType = { value: "editSettings", label: "Edit Settings" }
    static readonly editBoats: PermissionType = { value: "editBoats", label: "Edit Boats" }
    static readonly editUsers: PermissionType = { value: "editUsers", label: "Edit Users" }
    static readonly editRoles: PermissionType = { value: "editRoles", label: "Edit Roles" }
    static readonly DownloadResults: PermissionType = { value: 'DownloadResults', label: 'Download Results' }
    static readonly UploadEntires: PermissionType = { value: 'UploadEntires', label: 'Upload Entries' }
};


export const PERMISSIONS: PermissionType[] = Object.values(AVAILABLE_PERMISSIONS);

export function userHasPermission(user: UserDataType, permission: PermissionType) {
    let match = false;
    user.roles.flatMap(role => role.permissions.allowed).forEach(perm => {
        if (perm.value == permission.value) {
            match = true;
        }
    })

    return match;
}