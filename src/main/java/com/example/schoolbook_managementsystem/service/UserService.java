package com.example.schoolbook_managementsystem.service;

import java.util.List;

import com.example.schoolbook_managementsystem.dto.UserRequestDTO;
import com.example.schoolbook_managementsystem.dto.UserResponseDTO;

public interface UserService {

    UserResponseDTO createUser(UserRequestDTO dto);

    UserResponseDTO getUserById(Long id);

    List<UserResponseDTO> getAllUsers();

    void deleteUser(Long id);
}