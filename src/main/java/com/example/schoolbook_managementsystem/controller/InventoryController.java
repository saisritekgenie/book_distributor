package com.example.schoolbook_managementsystem.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.schoolbook_managementsystem.dto.InventoryRequestDTO;
import com.example.schoolbook_managementsystem.dto.InventoryResponseDTO;
import com.example.schoolbook_managementsystem.service.InventoryService;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    @Autowired
    private InventoryService inventoryService;

    @PostMapping
    public InventoryResponseDTO createInventory(
            @RequestBody InventoryRequestDTO dto) {

        return inventoryService.createInventory(dto);
    }

    @GetMapping("/{id}")
    public InventoryResponseDTO getInventoryById(
            @PathVariable Long id) {

        return inventoryService.getInventoryById(id);
    }

    @GetMapping
    public List<InventoryResponseDTO> getAllInventories() {

        return inventoryService.getAllInventories();
    }

    @DeleteMapping("/{id}")
    public String deleteInventory(@PathVariable Long id) {

        inventoryService.deleteInventory(id);

        return "Inventory Deleted Successfully";
    }
}