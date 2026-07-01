package com.example.schoolbook_managementsystem.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.schoolbook_managementsystem.dto.StudentRequestDTO;
import com.example.schoolbook_managementsystem.dto.StudentResponseDTO;
import com.example.schoolbook_managementsystem.service.StudentService;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final StudentService studentService;

    public StudentController(
            StudentService studentService) {
        this.studentService = studentService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public StudentResponseDTO createStudent(
            @RequestBody StudentRequestDTO dto) {

        return studentService.createStudent(dto);
    }

    @GetMapping("/{id}")
    public StudentResponseDTO getStudentById(
            @PathVariable Long id) {

        return studentService.getStudentById(id);
    }

    @GetMapping
    public List<StudentResponseDTO> getAllStudents() {

        return studentService.getAllStudents();
    }

    @DeleteMapping("/{id}")
    public String deleteStudent(
            @PathVariable Long id) {

        studentService.deleteStudent(id);

        return "Student Deleted Successfully";
    }
}