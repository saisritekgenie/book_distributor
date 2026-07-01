package com.example.schoolbook_managementsystem.serviceimpl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.schoolbook_managementsystem.dto.RoleRequestDTO;
import com.example.schoolbook_managementsystem.dto.RoleResponseDTO;
import com.example.schoolbook_managementsystem.entity.Role;
import com.example.schoolbook_managementsystem.repository.RoleRepository;
import com.example.schoolbook_managementsystem.service.RoleService;

@Service
public class RoleServiceImpl implements RoleService {

    private final RoleRepository roleRepository;

    public RoleServiceImpl(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    @Override
    public RoleResponseDTO createRole(RoleRequestDTO dto) {

        Role role = new Role();
        role.setRoleName(dto.getRoleName());

        Role savedRole = roleRepository.save(role);

        return new RoleResponseDTO(
                savedRole.getRoleId(),
                savedRole.getRoleName()
        );
    }

    @Override
    public List<RoleResponseDTO> getAllRoles() {
        return roleRepository.findAll()
                .stream()
                .map(role -> new RoleResponseDTO(
                        role.getRoleId(),
                        role.getRoleName()))
                .collect(Collectors.toList());
    }

    @Override
    public RoleResponseDTO getRoleById(Long id) {

        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role not found"));

        return new RoleResponseDTO(
                role.getRoleId(),
                role.getRoleName()
        );
    }

    @Override
    public RoleResponseDTO updateRole(Long id, RoleRequestDTO dto) {

        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role not found"));

        role.setRoleName(dto.getRoleName());

        Role updatedRole = roleRepository.save(role);

        return new RoleResponseDTO(
                updatedRole.getRoleId(),
                updatedRole.getRoleName()
        );
    }

    @Override
    public void deleteRole(Long id) {

        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role not found"));

        roleRepository.delete(role);
    }
}