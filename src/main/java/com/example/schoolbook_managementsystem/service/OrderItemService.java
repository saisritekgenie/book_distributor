package com.example.schoolbook_managementsystem.service;

import java.util.List;

import com.example.schoolbook_managementsystem.dto.OrderItemRequestDTO;
import com.example.schoolbook_managementsystem.dto.OrderItemResponseDTO;

public interface OrderItemService {

    OrderItemResponseDTO createOrderItem(OrderItemRequestDTO requestDTO);

    OrderItemResponseDTO getOrderItemById(Long id);

    List<OrderItemResponseDTO> getAllOrderItems();

    OrderItemResponseDTO updateOrderItem(Long id,
                                         OrderItemRequestDTO requestDTO);

    void deleteOrderItem(Long id);
}