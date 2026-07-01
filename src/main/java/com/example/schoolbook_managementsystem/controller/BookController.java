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

import com.example.schoolbook_managementsystem.dto.BookRequestDTO;
import com.example.schoolbook_managementsystem.dto.BookResponseDTO;
import com.example.schoolbook_managementsystem.service.BookService;

@RestController
@RequestMapping("/api/books")
public class BookController {

    @Autowired
    private BookService bookService;

    @PostMapping
    public BookResponseDTO createBook(@RequestBody BookRequestDTO dto) {

        return bookService.createBook(dto);
    }

    @GetMapping("/{id}")
    public BookResponseDTO getBookById(@PathVariable Long id) {

        return bookService.getBookById(id);
    }

    @GetMapping
    public List<BookResponseDTO> getAllBooks() {

        return bookService.getAllBooks();
    }

    @DeleteMapping("/{id}")
    public String deleteBook(@PathVariable Long id) {

        bookService.deleteBook(id);

        return "Book Deleted Successfully";
    }
}