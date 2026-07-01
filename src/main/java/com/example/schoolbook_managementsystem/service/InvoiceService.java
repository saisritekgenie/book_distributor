package com.example.schoolbook_managementsystem.service;

import java.util.List;

import com.example.schoolbook_managementsystem.dto.InvoiceRequestDTO;
import com.example.schoolbook_managementsystem.dto.InvoiceResponseDTO;

public interface InvoiceService {

    InvoiceResponseDTO createInvoice(InvoiceRequestDTO requestDTO);

    InvoiceResponseDTO getInvoiceById(Long id);

    List<InvoiceResponseDTO> getAllInvoices();

    InvoiceResponseDTO updateInvoice(Long id,
                                     InvoiceRequestDTO requestDTO);

    void deleteInvoice(Long id);
}