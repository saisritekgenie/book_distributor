package com.example.schoolbook_managementsystem.service;

import java.util.List;

import com.example.schoolbook_managementsystem.dto.BookRequestDTO;
import com.example.schoolbook_managementsystem.dto.BookResponseDTO;

public interface BookService {

    BookResponseDTO createBook(BookRequestDTO dto);

    BookResponseDTO getBookById(Long id);

    List<BookResponseDTO> getAllBooks();

    void deleteBook(Long id);
}