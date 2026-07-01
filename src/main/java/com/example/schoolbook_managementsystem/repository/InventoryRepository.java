package com.example.schoolbook_managementsystem.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.schoolbook_managementsystem.entity.Inventory;

@Repository
public interface InventoryRepository
        extends JpaRepository<Inventory, Long> {

}