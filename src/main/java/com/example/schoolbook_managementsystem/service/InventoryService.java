package com.example.schoolbook_managementsystem.service;

import java.util.List;

import com.example.schoolbook_managementsystem.dto.InventoryRequestDTO;
import com.example.schoolbook_managementsystem.dto.InventoryResponseDTO;

public interface InventoryService {

    InventoryResponseDTO createInventory(InventoryRequestDTO dto);

    InventoryResponseDTO getInventoryById(Long id);

    List<InventoryResponseDTO> getAllInventories();

    void deleteInventory(Long id);
}