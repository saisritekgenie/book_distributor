package com.example.schoolbook_managementsystem.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.schoolbook_managementsystem.dto.StudentRequestDTO;
import com.example.schoolbook_managementsystem.dto.StudentResponseDTO;
import com.example.schoolbook_managementsystem.entity.Student;
import com.example.schoolbook_managementsystem.repository.StudentRepository;
import com.example.schoolbook_managementsystem.service.StudentService;

@Service
public class StudentServiceImpl implements StudentService {

    private final StudentRepository studentRepository;

    public StudentServiceImpl(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    @Override
    public StudentResponseDTO createStudent(StudentRequestDTO dto) {

        Student student = new Student();

        student.setStudentName(dto.getStudentName());
        student.setClassName(dto.getClassName());
        student.setSection(dto.getSection());
        student.setParentMobile(dto.getParentMobile());

        Student savedStudent = studentRepository.save(student);

        StudentResponseDTO response = new StudentResponseDTO();

        response.setStudentId(savedStudent.getStudentId());
        response.setStudentName(savedStudent.getStudentName());
        response.setClassName(savedStudent.getClassName());
        response.setSection(savedStudent.getSection());
        response.setParentMobile(savedStudent.getParentMobile());

        return response;
    }

    @Override
    public StudentResponseDTO getStudentById(Long id) {

        Student student = studentRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Student Not Found"));

        StudentResponseDTO response = new StudentResponseDTO();

        response.setStudentId(student.getStudentId());
        response.setStudentName(student.getStudentName());
        response.setClassName(student.getClassName());
        response.setSection(student.getSection());
        response.setParentMobile(student.getParentMobile());

        return response;
    }

    @Override
    public List<StudentResponseDTO> getAllStudents() {

        return studentRepository.findAll()
                .stream()
                .map(student -> {

                    StudentResponseDTO dto =
                            new StudentResponseDTO();

                    dto.setStudentId(student.getStudentId());
                    dto.setStudentName(student.getStudentName());
                    dto.setClassName(student.getClassName());
                    dto.setSection(student.getSection());
                    dto.setParentMobile(student.getParentMobile());

                    return dto;

                }).collect(Collectors.toList());
    }

    @Override
    public void deleteStudent(Long id) {

        studentRepository.deleteById(id);
    }
}