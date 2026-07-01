package com.example.schoolbook_managementsystem.service.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.schoolbook_managementsystem.dto.InvoiceRequestDTO;
import com.example.schoolbook_managementsystem.dto.InvoiceResponseDTO;
import com.example.schoolbook_managementsystem.entity.Invoice;
import com.example.schoolbook_managementsystem.entity.Order;
import com.example.schoolbook_managementsystem.repository.InvoiceRepository;
import com.example.schoolbook_managementsystem.repository.OrderRepository;
import com.example.schoolbook_managementsystem.service.InvoiceService;

@Service
public class InvoiceServiceImpl implements InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final OrderRepository orderRepository;

    public InvoiceServiceImpl(InvoiceRepository invoiceRepository,
                              OrderRepository orderRepository) {
        this.invoiceRepository = invoiceRepository;
        this.orderRepository = orderRepository;
    }

    @Override
    public InvoiceResponseDTO createInvoice(InvoiceRequestDTO requestDTO) {

        Order order = orderRepository.findById(requestDTO.getOrderId())
                .orElseThrow(() ->
                        new RuntimeException("Order not found"));

        Invoice invoice = new Invoice();
        invoice.setInvoiceNumber(requestDTO.getInvoiceNumber());
        invoice.setGeneratedDate(LocalDateTime.now());
        invoice.setOrder(order);

        Invoice savedInvoice = invoiceRepository.save(invoice);

        return mapToDTO(savedInvoice);
    }

    @Override
    public InvoiceResponseDTO getInvoiceById(Long id) {

        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Invoice not found"));

        return mapToDTO(invoice);
    }

    @Override
    public List<InvoiceResponseDTO> getAllInvoices() {

        return invoiceRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public InvoiceResponseDTO updateInvoice(Long id,
                                            InvoiceRequestDTO requestDTO) {

        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Invoice not found"));

        Order order = orderRepository.findById(requestDTO.getOrderId())
                .orElseThrow(() ->
                        new RuntimeException("Order not found"));

        invoice.setInvoiceNumber(requestDTO.getInvoiceNumber());
        invoice.setOrder(order);

        Invoice updatedInvoice = invoiceRepository.save(invoice);

        return mapToDTO(updatedInvoice);
    }

    @Override
    public void deleteInvoice(Long id) {

        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Invoice not found"));

        invoiceRepository.delete(invoice);
    }
          private InvoiceResponseDTO mapToDTO(Invoice invoice) {

    InvoiceResponseDTO dto = new InvoiceResponseDTO();

    dto.setInvoiceId(invoice.getInvoiceId());
    dto.setInvoiceNumber(invoice.getInvoiceNumber());
    dto.setGeneratedDate(invoice.getGeneratedDate());

    if (invoice.getOrder() != null) {

        dto.setOrderId(invoice.getOrder().getOrderId());

        dto.setTotalAmount(invoice.getOrder().getTotalAmount());

    }

    return dto;
}
    
}