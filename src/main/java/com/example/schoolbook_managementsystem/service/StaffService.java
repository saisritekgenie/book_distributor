package com.example.schoolbook_managementsystem.service;

import java.util.List;

import com.example.schoolbook_managementsystem.dto.StaffRequestDTO;
import com.example.schoolbook_managementsystem.dto.StaffResponseDTO;

public interface StaffService {

    StaffResponseDTO createStaff(StaffRequestDTO dto);

    List<StaffResponseDTO> getAllStaff();

    StaffResponseDTO getStaffById(Long id);

    StaffResponseDTO updateStaff(Long id, StaffRequestDTO dto);

    void deleteStaff(Long id);
}