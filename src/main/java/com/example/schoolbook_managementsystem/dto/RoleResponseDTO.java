package com.example.schoolbook_managementsystem.dto;

public class RoleResponseDTO {

    private Long roleId;
    private String roleName;

    public RoleResponseDTO() {
    }

    public RoleResponseDTO(Long roleId, String roleName) {
        this.roleId = roleId;
        this.roleName = roleName;
    }

    public Long getRoleId() {
        return roleId;
    }

    public void setRoleId(Long roleId) {
        this.roleId = roleId;
    }

    public String getRoleName() {
        return roleName;
    }

    public void setRoleName(String roleName) {
        this.roleName = roleName;
    }
}