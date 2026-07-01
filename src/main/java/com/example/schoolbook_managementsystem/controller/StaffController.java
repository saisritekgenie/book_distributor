package com.example.schoolbook_managementsystem.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.schoolbook_managementsystem.dto.StaffRequestDTO;
import com.example.schoolbook_managementsystem.dto.StaffResponseDTO;
import com.example.schoolbook_managementsystem.service.StaffService;

@RestController
@RequestMapping("/api/staff")
public class StaffController {

    private final StaffService staffService;

    public StaffController(StaffService staffService) {
        this.staffService = staffService;
    }

    @PostMapping
    public StaffResponseDTO createStaff(@RequestBody StaffRequestDTO dto) {
        return staffService.createStaff(dto);
    }

    @GetMapping
    public List<StaffResponseDTO> getAllStaff() {
        return staffService.getAllStaff();
    }

    @GetMapping("/{id}")
    public StaffResponseDTO getStaffById(@PathVariable Long id) {
        return staffService.getStaffById(id);
    }

    @PutMapping("/{id}")
    public StaffResponseDTO updateStaff(
            @PathVariable Long id,
            @RequestBody StaffRequestDTO dto) {
        return staffService.updateStaff(id, dto);
    }

    @DeleteMapping("/{id}")
    public String deleteStaff(@PathVariable Long id) {
        staffService.deleteStaff(id);
        return "Staff deleted successfully";
    }
}