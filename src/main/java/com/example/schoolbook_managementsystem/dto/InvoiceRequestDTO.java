package com.example.schoolbook_managementsystem.dto;

public class InvoiceRequestDTO {

    private String invoiceNumber;
    private Long orderId;

    public InvoiceRequestDTO() {
    }

    public String getInvoiceNumber() {
        return invoiceNumber;
    }

    public void setInvoiceNumber(String invoiceNumber) {
        this.invoiceNumber = invoiceNumber;
    }

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }
}