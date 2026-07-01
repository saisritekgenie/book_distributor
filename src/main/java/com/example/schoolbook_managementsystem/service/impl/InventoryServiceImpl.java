package com.example.schoolbook_managementsystem.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.schoolbook_managementsystem.dto.InventoryRequestDTO;
import com.example.schoolbook_managementsystem.dto.InventoryResponseDTO;
import com.example.schoolbook_managementsystem.entity.Book;
import com.example.schoolbook_managementsystem.entity.Inventory;
import com.example.schoolbook_managementsystem.repository.BookRepository;
import com.example.schoolbook_managementsystem.repository.InventoryRepository;
import com.example.schoolbook_managementsystem.service.InventoryService;

@Service
public class InventoryServiceImpl implements InventoryService {

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private BookRepository bookRepository;

    @Override
    public InventoryResponseDTO createInventory(InventoryRequestDTO dto) {

        Book book = bookRepository.findById(dto.getBookId())
                .orElseThrow(() -> new RuntimeException("Book not found"));

        Inventory inventory = new Inventory();
        inventory.setAvailableStock(dto.getAvailableStock());
        inventory.setMinimumStock(dto.getMinimumStock());
        inventory.setBook(book);

        Inventory savedInventory = inventoryRepository.save(inventory);

        return mapToDTO(savedInventory);
    }

    @Override
    public InventoryResponseDTO getInventoryById(Long id) {

        Inventory inventory = inventoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inventory not found"));

        return mapToDTO(inventory);
    }

    @Override
    public List<InventoryResponseDTO> getAllInventories() {

        return inventoryRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteInventory(Long id) {

        Inventory inventory = inventoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inventory not found"));

        inventoryRepository.delete(inventory);
    }

    private InventoryResponseDTO mapToDTO(Inventory inventory) {

        InventoryResponseDTO dto = new InventoryResponseDTO();

        dto.setInventoryId(inventory.getInventoryId());
        dto.setAvailableStock(inventory.getAvailableStock());
        dto.setMinimumStock(inventory.getMinimumStock());

        if (inventory.getBook() != null) {
            dto.setBookTitle(inventory.getBook().getTitle());
        }

        return dto;
    }
}