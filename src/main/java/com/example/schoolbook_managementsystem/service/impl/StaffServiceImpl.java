package com.example.schoolbook_managementsystem.serviceimpl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.schoolbook_managementsystem.dto.StaffRequestDTO;
import com.example.schoolbook_managementsystem.dto.StaffResponseDTO;
import com.example.schoolbook_managementsystem.entity.Staff;
import com.example.schoolbook_managementsystem.repository.StaffRepository;
import com.example.schoolbook_managementsystem.service.StaffService;

@Service
public class StaffServiceImpl implements StaffService {

    private final StaffRepository staffRepository;

    public StaffServiceImpl(StaffRepository staffRepository) {
        this.staffRepository = staffRepository;
    }

    @Override
    public StaffResponseDTO createStaff(StaffRequestDTO dto) {

        Staff staff = new Staff();
        staff.setStaffName(dto.getStaffName());
        staff.setDesignation(dto.getDesignation());
        staff.setMobile(dto.getMobile());
        staff.setEmail(dto.getEmail());

        Staff savedStaff = staffRepository.save(staff);

        return new StaffResponseDTO(
                savedStaff.getStaffId(),
                savedStaff.getStaffName(),
                savedStaff.getDesignation(),
                savedStaff.getMobile(),
                savedStaff.getEmail()
        );
    }

    @Override
    public List<StaffResponseDTO> getAllStaff() {
        return staffRepository.findAll()
                .stream()
                .map(staff -> new StaffResponseDTO(
                        staff.getStaffId(),
                        staff.getStaffName(),
                        staff.getDesignation(),
                        staff.getMobile(),
                        staff.getEmail()))
                .collect(Collectors.toList());
    }

    @Override
    public StaffResponseDTO getStaffById(Long id) {

        Staff staff = staffRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Staff not found"));

        return new StaffResponseDTO(
                staff.getStaffId(),
                staff.getStaffName(),
                staff.getDesignation(),
                staff.getMobile(),
                staff.getEmail()
        );
    }

    @Override
    public StaffResponseDTO updateStaff(Long id, StaffRequestDTO dto) {

        Staff staff = staffRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Staff not found"));

        staff.setStaffName(dto.getStaffName());
        staff.setDesignation(dto.getDesignation());
        staff.setMobile(dto.getMobile());
        staff.setEmail(dto.getEmail());

        Staff updatedStaff = staffRepository.save(staff);

        return new StaffResponseDTO(
                updatedStaff.getStaffId(),
                updatedStaff.getStaffName(),
                updatedStaff.getDesignation(),
                updatedStaff.getMobile(),
                updatedStaff.getEmail()
        );
    }

    @Override
    public void deleteStaff(Long id) {

        Staff staff = staffRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Staff not found"));

        staffRepository.delete(staff);
    }
}