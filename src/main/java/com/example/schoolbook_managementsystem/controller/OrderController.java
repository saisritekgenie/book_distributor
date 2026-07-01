package com.example.schoolbook_managementsystem.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import com.example.schoolbook_managementsystem.dto.OrderRequestDTO;
import com.example.schoolbook_managementsystem.dto.OrderResponseDTO;
import com.example.schoolbook_managementsystem.service.OrderService;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;
    private final SimpMessagingTemplate messagingTemplate;

    public OrderController(OrderService orderService,
                           SimpMessagingTemplate messagingTemplate) {
        this.orderService = orderService;
        this.messagingTemplate = messagingTemplate;
    }

    // CREATE ORDER
    @PostMapping
    public OrderResponseDTO createOrder(@RequestBody OrderRequestDTO dto) {

        OrderResponseDTO response = orderService.createOrder(dto);

        messagingTemplate.convertAndSend("/topic/orders", response);

        return response;
    }

    // GET ALL ORDERS
    @GetMapping
    public List<OrderResponseDTO> getAllOrders() {
        return orderService.getAllOrders();
    }

    // GET BY ID
    @GetMapping("/{id}")
    public OrderResponseDTO getOrderById(@PathVariable Long id) {
        return orderService.getOrderById(id);
    }

    // UPDATE ORDER
    @PutMapping("/{id}")
    public OrderResponseDTO updateOrder(@PathVariable Long id,
                                        @RequestBody OrderRequestDTO dto) {

        OrderResponseDTO response = orderService.updateOrder(id, dto);

        messagingTemplate.convertAndSend("/topic/orders", response);

        return response;
    }

    // DELETE ORDER (FIXED → JSON FORMAT)
    @DeleteMapping("/{id}")
    public Map<String, Object> deleteOrder(@PathVariable Long id) {

        orderService.deleteOrder(id);

        Map<String, Object> msg = new HashMap<>();
        msg.put("type", "DELETE");
        msg.put("id", id);

        messagingTemplate.convertAndSend("/topic/orders", msg);

        return Map.of("message", "Order deleted successfully");
    }
}