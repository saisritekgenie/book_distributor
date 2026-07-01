package com.example.schoolbook_managementsystem.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.schoolbook_managementsystem.dto.UserRequestDTO;
import com.example.schoolbook_managementsystem.dto.UserResponseDTO;
import com.example.schoolbook_managementsystem.entity.Role;
import com.example.schoolbook_managementsystem.entity.User;
import com.example.schoolbook_managementsystem.repository.RoleRepository;
import com.example.schoolbook_managementsystem.repository.UserRepository;
import com.example.schoolbook_managementsystem.service.UserService;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    public UserServiceImpl(UserRepository userRepository,
                           RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    @Override
    public UserResponseDTO createUser(UserRequestDTO dto) {

        Role role = roleRepository.findById(dto.getRoleId())
                .orElseThrow(() ->
                        new RuntimeException("Role not found"));

        User user = new User();

        user.setUsername(dto.getUsername());
        user.setPassword(dto.getPassword());
        user.setEmail(dto.getEmail());
        user.setRole(role);

        User savedUser = userRepository.save(user);

        UserResponseDTO response = new UserResponseDTO();

        response.setUserId(savedUser.getUserId());
        response.setUsername(savedUser.getUsername());
        response.setEmail(savedUser.getEmail());
        response.setRoleName(savedUser.getRole().getRoleName());

        return response;
    }

    @Override
    public UserResponseDTO getUserById(Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        UserResponseDTO response = new UserResponseDTO();

        response.setUserId(user.getUserId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setRoleName(user.getRole().getRoleName());

        return response;
    }

    @Override
    public List<UserResponseDTO> getAllUsers() {

        return userRepository.findAll()
                .stream()
                .map(user -> {

                    UserResponseDTO dto =
                            new UserResponseDTO();

                    dto.setUserId(user.getUserId());
                    dto.setUsername(user.getUsername());
                    dto.setEmail(user.getEmail());
                    dto.setRoleName(
                            user.getRole().getRoleName());

                    return dto;

                }).collect(Collectors.toList());
    }

    @Override
    public void deleteUser(Long id) {

        userRepository.deleteById(id);
    }
}