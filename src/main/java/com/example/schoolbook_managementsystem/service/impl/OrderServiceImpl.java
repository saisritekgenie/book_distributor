package com.example.schoolbook_managementsystem.serviceimpl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.schoolbook_managementsystem.dto.OrderRequestDTO;
import com.example.schoolbook_managementsystem.dto.OrderResponseDTO;
import com.example.schoolbook_managementsystem.entity.Order;
import com.example.schoolbook_managementsystem.entity.Student;
import com.example.schoolbook_managementsystem.repository.OrderRepository;
import com.example.schoolbook_managementsystem.repository.StudentRepository;
import com.example.schoolbook_managementsystem.repository.InvoiceRepository;
import com.example.schoolbook_managementsystem.repository.PaymentRepository;
import com.example.schoolbook_managementsystem.repository.OrderItemRepository;
import com.example.schoolbook_managementsystem.service.OrderService;

@Service
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final StudentRepository studentRepository;
    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;
    private final OrderItemRepository orderItemRepository;

    public OrderServiceImpl(OrderRepository orderRepository,
                            StudentRepository studentRepository,
                            InvoiceRepository invoiceRepository,
                            PaymentRepository paymentRepository,
                            OrderItemRepository orderItemRepository) {
        this.orderRepository = orderRepository;
        this.studentRepository = studentRepository;
        this.invoiceRepository = invoiceRepository;
        this.paymentRepository = paymentRepository;
        this.orderItemRepository = orderItemRepository;
    }

    @Override
    public OrderResponseDTO createOrder(OrderRequestDTO dto) {

        Student student = studentRepository.findById(dto.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Order order = new Order();
        order.setOrderDate(LocalDateTime.now());
        order.setTotalAmount(dto.getTotalAmount());
        order.setStatus(dto.getStatus());
        order.setStudent(student);

        Order savedOrder = orderRepository.save(order);

        return new OrderResponseDTO(
                savedOrder.getOrderId(),
                savedOrder.getOrderDate(),
                savedOrder.getTotalAmount(),
                savedOrder.getStatus(),
                student.getStudentId(),
                student.getStudentName()
        );
    }

    @Override
    public List<OrderResponseDTO> getAllOrders() {

        return orderRepository.findAll()
                .stream()
                .map(order -> new OrderResponseDTO(
                        order.getOrderId(),
                        order.getOrderDate(),
                        order.getTotalAmount(),
                        order.getStatus(),
                        order.getStudent().getStudentId(),
                        order.getStudent().getStudentName()))
                .collect(Collectors.toList());
    }

    @Override
    public OrderResponseDTO getOrderById(Long id) {

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        return new OrderResponseDTO(
                order.getOrderId(),
                order.getOrderDate(),
                order.getTotalAmount(),
                order.getStatus(),
                order.getStudent().getStudentId(),
                order.getStudent().getStudentName()
        );
    }

    @Override
    public OrderResponseDTO updateOrder(Long id, OrderRequestDTO dto) {

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        Student student = studentRepository.findById(dto.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found"));

        order.setTotalAmount(dto.getTotalAmount());
        order.setStatus(dto.getStatus());
        order.setStudent(student);

        Order updatedOrder = orderRepository.save(order);

        return new OrderResponseDTO(
                updatedOrder.getOrderId(),
                updatedOrder.getOrderDate(),
                updatedOrder.getTotalAmount(),
                updatedOrder.getStatus(),
                student.getStudentId(),
                student.getStudentName()
        );
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void deleteOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // Delete associated Invoices referencing this order
        invoiceRepository.findAll().stream()
                .filter(inv -> inv.getOrder() != null && inv.getOrder().getOrderId().equals(id))
                .forEach(invoiceRepository::delete);

        // Delete associated Payments referencing this order
        paymentRepository.findAll().stream()
                .filter(pay -> pay.getOrder() != null && pay.getOrder().getOrderId().equals(id))
                .forEach(paymentRepository::delete);

        // Delete associated OrderItems referencing this order
        orderItemRepository.findAll().stream()
                .filter(item -> item.getOrder() != null && item.getOrder().getOrderId().equals(id))
                .forEach(orderItemRepository::delete);

        // Finally delete the order
        orderRepository.delete(order);
    }
}