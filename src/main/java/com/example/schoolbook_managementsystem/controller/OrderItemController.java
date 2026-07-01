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

import com.example.schoolbook_managementsystem.dto.OrderItemRequestDTO;
import com.example.schoolbook_managementsystem.dto.OrderItemResponseDTO;
import com.example.schoolbook_managementsystem.service.OrderItemService;

@RestController
@RequestMapping("/api/order-items")
public class OrderItemController {

    private final OrderItemService orderItemService;

    public OrderItemController(
            OrderItemService orderItemService) {
        this.orderItemService = orderItemService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrderItemResponseDTO createOrderItem(
            @RequestBody OrderItemRequestDTO requestDTO) {

        return orderItemService.createOrderItem(
                requestDTO);
    }

    @GetMapping("/{id}")
    public OrderItemResponseDTO getOrderItemById(
            @PathVariable Long id) {

        return orderItemService.getOrderItemById(id);
    }

    @GetMapping
    public List<OrderItemResponseDTO> getAllOrderItems() {

        return orderItemService.getAllOrderItems();
    }

    @PutMapping("/{id}")
    public OrderItemResponseDTO updateOrderItem(
            @PathVariable Long id,
            @RequestBody OrderItemRequestDTO requestDTO) {

        return orderItemService.updateOrderItem(
                id, requestDTO);
    }

    @DeleteMapping("/{id}")
    public void deleteOrderItem(
            @PathVariable Long id) {

        orderItemService.deleteOrderItem(id);
    }
}