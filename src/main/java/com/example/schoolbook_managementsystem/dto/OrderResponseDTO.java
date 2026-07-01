package com.example.schoolbook_managementsystem.dto;

import java.time.LocalDateTime;

public class OrderResponseDTO {

    private Long orderId;
    private LocalDateTime orderDate;
    private Double totalAmount;
    private String status;
    private Long studentId;
    private String studentName;

    public OrderResponseDTO() {
    }

    public OrderResponseDTO(Long orderId,
                            LocalDateTime orderDate,
                            Double totalAmount,
                            String status,
                            Long studentId,
                            String studentName) {
        this.orderId = orderId;
        this.orderDate = orderDate;
        this.totalAmount = totalAmount;
        this.status = status;
        this.studentId = studentId;
        this.studentName = studentName;
    }

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public LocalDateTime getOrderDate() {
        return orderDate;
    }

    public void setOrderDate(LocalDateTime orderDate) {
        this.orderDate = orderDate;
    }

    public Double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(Double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }
}