package com.example.schoolbook_managementsystem.serviceimpl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.schoolbook_managementsystem.dto.OrderItemRequestDTO;
import com.example.schoolbook_managementsystem.dto.OrderItemResponseDTO;
import com.example.schoolbook_managementsystem.entity.Book;
import com.example.schoolbook_managementsystem.entity.Order;
import com.example.schoolbook_managementsystem.entity.OrderItem;
import com.example.schoolbook_managementsystem.repository.BookRepository;
import com.example.schoolbook_managementsystem.repository.OrderItemRepository;
import com.example.schoolbook_managementsystem.repository.OrderRepository;
import com.example.schoolbook_managementsystem.service.OrderItemService;

@Service
public class OrderItemServiceImpl implements OrderItemService {

    private final OrderItemRepository orderItemRepository;
    private final OrderRepository orderRepository;
    private final BookRepository bookRepository;

    public OrderItemServiceImpl(OrderItemRepository orderItemRepository,
                                OrderRepository orderRepository,
                                BookRepository bookRepository) {
        this.orderItemRepository = orderItemRepository;
        this.orderRepository = orderRepository;
        this.bookRepository = bookRepository;
    }

    @Override
    public OrderItemResponseDTO createOrderItem(
            OrderItemRequestDTO requestDTO) {

        Order order = orderRepository.findById(requestDTO.getOrderId())
                .orElseThrow(() ->
                        new RuntimeException("Order not found"));

        Book book = bookRepository.findById(requestDTO.getBookId())
                .orElseThrow(() ->
                        new RuntimeException("Book not found"));

        OrderItem orderItem = new OrderItem();
        orderItem.setQuantity(requestDTO.getQuantity());
        orderItem.setPrice(requestDTO.getPrice());
        orderItem.setOrder(order);
        orderItem.setBook(book);

        return mapToResponseDTO(
                orderItemRepository.save(orderItem));
    }

    @Override
    public OrderItemResponseDTO getOrderItemById(Long id) {

        OrderItem orderItem = orderItemRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Order Item not found"));

        return mapToResponseDTO(orderItem);
    }

    @Override
    public List<OrderItemResponseDTO> getAllOrderItems() {

        return orderItemRepository.findAll()
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public OrderItemResponseDTO updateOrderItem(
            Long id,
            OrderItemRequestDTO requestDTO) {

        OrderItem orderItem = orderItemRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Order Item not found"));

        Order order = orderRepository.findById(requestDTO.getOrderId())
                .orElseThrow(() ->
                        new RuntimeException("Order not found"));

        Book book = bookRepository.findById(requestDTO.getBookId())
                .orElseThrow(() ->
                        new RuntimeException("Book not found"));

        orderItem.setQuantity(requestDTO.getQuantity());
        orderItem.setPrice(requestDTO.getPrice());
        orderItem.setOrder(order);
        orderItem.setBook(book);

        return mapToResponseDTO(
                orderItemRepository.save(orderItem));
    }

    @Override
    public void deleteOrderItem(Long id) {

        OrderItem orderItem = orderItemRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Order Item not found"));

        orderItemRepository.delete(orderItem);
    }

    private OrderItemResponseDTO mapToResponseDTO(
            OrderItem orderItem) {

        OrderItemResponseDTO dto =
                new OrderItemResponseDTO();

        dto.setOrderItemId(orderItem.getOrderItemId());
        dto.setQuantity(orderItem.getQuantity());
        dto.setPrice(orderItem.getPrice());

        dto.setOrderId(orderItem.getOrder().getOrderId());

        dto.setBookId(orderItem.getBook().getBookId());
        dto.setBookName(orderItem.getBook().getTitle());

        return dto;
    }
}