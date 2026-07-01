package com.example.schoolbook_managementsystem.dto;

public class StaffResponseDTO {

    private Long staffId;
    private String staffName;
    private String designation;
    private String mobile;
    private String email;

    public StaffResponseDTO() {
    }

    public StaffResponseDTO(Long staffId,
                            String staffName,
                            String designation,
                            String mobile,
                            String email) {
        this.staffId = staffId;
        this.staffName = staffName;
        this.designation = designation;
        this.mobile = mobile;
        this.email = email;
    }

    public Long getStaffId() {
        return staffId;
    }

    public void setStaffId(Long staffId) {
        this.staffId = staffId;
    }

    public String getStaffName() {
        return staffName;
    }

    public void setStaffName(String staffName) {
        this.staffName = staffName;
    }

    public String getDesignation() {
        return designation;
    }

    public void setDesignation(String designation) {
        this.designation = designation;
    }

    public String getMobile() {
        return mobile;
    }

    public void setMobile(String mobile) {
        this.mobile = mobile;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}