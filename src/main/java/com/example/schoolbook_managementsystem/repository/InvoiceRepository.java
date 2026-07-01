package com.example.schoolbook_managementsystem.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.schoolbook_managementsystem.entity.Invoice;

@Repository
public interface InvoiceRepository
        extends JpaRepository<Invoice, Long> {

}