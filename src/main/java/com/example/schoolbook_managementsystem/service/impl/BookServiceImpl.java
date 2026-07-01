package com.example.schoolbook_managementsystem.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.schoolbook_managementsystem.dto.BookRequestDTO;
import com.example.schoolbook_managementsystem.dto.BookResponseDTO;
import com.example.schoolbook_managementsystem.entity.Book;
import com.example.schoolbook_managementsystem.repository.BookRepository;
import com.example.schoolbook_managementsystem.service.BookService;

@Service
public class BookServiceImpl implements BookService {

    @Autowired
    private BookRepository bookRepository;

    @Override
    public BookResponseDTO createBook(BookRequestDTO dto) {

        Book book = new Book();

        book.setTitle(dto.getTitle());
        book.setPrice(dto.getPrice());
        book.setPublisher(dto.getPublisher());
        book.setIsbn(dto.getIsbn());
        book.setDescription(dto.getDescription());

        Book savedBook = bookRepository.save(book);

        return mapToDTO(savedBook);
    }

    @Override
    public BookResponseDTO getBookById(Long id) {

        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Book not found with ID: " + id));

        return mapToDTO(book);
    }

    @Override
    public List<BookResponseDTO> getAllBooks() {

        List<Book> books = bookRepository.findAll();

        return books.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteBook(Long id) {

        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Book not found with ID: " + id));

        bookRepository.delete(book);
    }

    private BookResponseDTO mapToDTO(Book book) {

        BookResponseDTO dto = new BookResponseDTO();

        dto.setBookId(book.getBookId());
        dto.setTitle(book.getTitle());
        dto.setPrice(book.getPrice());
        dto.setPublisher(book.getPublisher());
        dto.setIsbn(book.getIsbn());
        dto.setDescription(book.getDescription());

        return dto;
    }
}