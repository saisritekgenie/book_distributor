package com.example.schoolbook_managementsystem.service;

import java.util.List;

import com.example.schoolbook_managementsystem.dto.RoleRequestDTO;
import com.example.schoolbook_managementsystem.dto.RoleResponseDTO;

public interface RoleService {

    RoleResponseDTO createRole(RoleRequestDTO dto);

    List<RoleResponseDTO> getAllRoles();

    RoleResponseDTO getRoleById(Long id);

    RoleResponseDTO updateRole(Long id, RoleRequestDTO dto);

    void deleteRole(Long id);
}