package com.example.schoolbook_managementsystem.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.schoolbook_managementsystem.dto.InvoiceRequestDTO;
import com.example.schoolbook_managementsystem.dto.InvoiceResponseDTO;
import com.example.schoolbook_managementsystem.service.InvoiceService;

@RestController
@RequestMapping("/api/invoices")
public class InvoiceController {

    private final InvoiceService invoiceService;

    public InvoiceController(InvoiceService invoiceService) {
        this.invoiceService = invoiceService;   
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public InvoiceResponseDTO createInvoice(
            @RequestBody InvoiceRequestDTO requestDTO) {

        return invoiceService.createInvoice(requestDTO);
    }

    @GetMapping("/{id}")
    public InvoiceResponseDTO getInvoiceById(@PathVariable Long id) {

        return invoiceService.getInvoiceById(id);
    }

    @GetMapping
    public List<InvoiceResponseDTO> getAllInvoices() {

        return invoiceService.getAllInvoices();
    }

    @PutMapping("/{id}")
    public InvoiceResponseDTO updateInvoice(
            @PathVariable Long id,
            @RequestBody InvoiceRequestDTO requestDTO) {

        return invoiceService.updateInvoice(id, requestDTO);
    }

    @DeleteMapping("/{id}")
    public String deleteInvoice(@PathVariable Long id) {

        invoiceService.deleteInvoice(id);
        return "Invoice deleted successfully";
    }
}