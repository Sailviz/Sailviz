export class AVAILABLE_PERMISSIONS {
    static readonly editSeries: PermissionType = { value: "editSeries", label: "Edit Series" } //edit button is not yet implemented so this permission is not used
    static readonly editRaces: PermissionType = { value: "editRaces", label: "Edit Races" } //edit button is not yet implemented so this permission is not used
    static readonly editFleets: PermissionType = { value: "editFleets", label: "Edit Fleets" } //implemented
    static readonly editResults: PermissionType = { value: "editResults", label: "Edit Results" } //implemented
    static readonly editBoats: PermissionType = { value: "editBoats", label: "Edit Boats" } //implemented
    static readonly editHardware: PermissionType = { value: "editHardware", label: "Edit Hardware" } //implemented
    static readonly editUsers: PermissionType = { value: "editUsers", label: "Edit Users" } //implemented
    static readonly editRoles: PermissionType = { value: "editRoles", label: "Edit Roles" } //implemented
    static readonly DownloadResults: PermissionType = { value: 'DownloadResults', label: 'Download Results' } //implemented
    static readonly UploadEntires: PermissionType = { value: 'UploadEntires', label: 'Upload Entries' } //implemented
};


export const PERMISSIONS: PermissionType[] = Object.values(AVAILABLE_PERMISSIONS);

export function userHasPermission(user: UserDataType, permission: PermissionType) {
    console.log(user)
    let match = false;
    user.roles.flatMap(role => role.permissions.allowed).forEach(perm => {
        if (perm.value == permission.value) {
            match = true;
        }
    })

    return match;
}