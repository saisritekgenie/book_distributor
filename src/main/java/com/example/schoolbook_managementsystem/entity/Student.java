package com.example.schoolbook_managementsystem.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "students")
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long studentId;

    @Column(nullable = false)
    private String studentName;

    @Column(nullable = false)
    private String className;

    @Column(nullable = false)
    private String section;

    @Column(nullable = false)
    private String parentMobile;

   // @OneToMany(mappedBy = "student")
    //private List<Order> orders;

    public Student() {
    }

    public Student(Long studentId, String studentName,
                   String className,
                   String section,
                   String parentMobile) {
        this.studentId = studentId;
        this.studentName = studentName;
        this.className = className;
        this.section = section;
        this.parentMobile = parentMobile;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getClassName() {
        return className;
    }

    public void setClassName(String className) {
        this.className = className;
    }

    public String getSection() {
        return section;
    }

    public void setSection(String section) {
        this.section = section;
    }

    public String getParentMobile() {
        return parentMobile;
    }

    public void setParentMobile(String parentMobile) {
        this.parentMobile = parentMobile;
    }

    //public List<Order> getOrders() {
       // return orders;
    //}

    //public void setOrders(List<Order> orders) {
       // this.orders = orders;
     // }
}