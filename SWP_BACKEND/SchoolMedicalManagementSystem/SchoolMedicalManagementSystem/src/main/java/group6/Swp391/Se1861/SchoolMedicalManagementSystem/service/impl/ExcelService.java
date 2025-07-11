package group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.impl;

import group6.Swp391.Se1861.SchoolMedicalManagementSystem.dto.*;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IExcelService;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.service.IStudentService;
import group6.Swp391.Se1861.SchoolMedicalManagementSystem.util.PhoneValidator;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ExcelService implements IExcelService {
    
    private final IStudentService studentService;
    
    // Excel column indices for student data
    private static final int COL_STUDENT_FIRST_NAME = 0;
    private static final int COL_STUDENT_LAST_NAME = 1;
    private static final int COL_STUDENT_DOB = 2;
    private static final int COL_STUDENT_GENDER = 3;
    private static final int COL_STUDENT_CLASS = 4;
    private static final int COL_STUDENT_SCHOOL_YEAR = 5; // Added school year
    private static final int COL_STUDENT_BIRTH_PLACE = 6;    
    private static final int COL_STUDENT_ADDRESS = 7;
    
    // Excel column indices for father data
    private static final int COL_FATHER_FIRST_NAME = 8;
    private static final int COL_FATHER_LAST_NAME = 9;
    private static final int COL_FATHER_PHONE = 10;
    private static final int COL_FATHER_GENDER = 11;
    private static final int COL_FATHER_JOB_TITLE = 12;
    private static final int COL_FATHER_ADDRESS = 13;
    private static final int COL_FATHER_DOB = 14;
    private static final int COL_FATHER_ENABLED = 15;
    
    // Excel column indices for mother data
    private static final int COL_MOTHER_FIRST_NAME = 16;
    private static final int COL_MOTHER_LAST_NAME = 17;
    private static final int COL_MOTHER_PHONE = 18;
    private static final int COL_MOTHER_GENDER = 19;
    private static final int COL_MOTHER_JOB_TITLE = 20;
    private static final int COL_MOTHER_ADDRESS = 21;
    private static final int COL_MOTHER_DOB = 22;
    private static final int COL_MOTHER_ENABLED = 23;

      @Override
    public StudentWithParentsCreationResponseDTO importStudentsFromExcel(MultipartFile file) {
        validateExcelFile(file);
        
        try (InputStream inputStream = file.getInputStream();
             Workbook workbook = WorkbookFactory.create(inputStream)) {
            
            Sheet sheet = workbook.getSheetAt(0);
            List<StudentCreationDTO> allStudents = new ArrayList<>();
            Map<String, ParentCreationDTO> uniqueFathers = new HashMap<>(); // key: phone
            Map<String, ParentCreationDTO> uniqueMothers = new HashMap<>(); // key: phone
            List<StudentParentMapping> studentParentMappings = new ArrayList<>();
            
            // Skip header row (row 0), start from row 1
            System.out.println("DEBUG: Starting Excel import, total rows: " + sheet.getLastRowNum());
            for (int rowIndex = 1; rowIndex <= sheet.getLastRowNum(); rowIndex++) {
                Row row = sheet.getRow(rowIndex);
                if (row == null || isRowEmpty(row)) {
                    System.out.println("DEBUG: Skipping empty row: " + rowIndex);
                    continue;
                }
                
                try {
                    // Parse student data
                    StudentCreationDTO student = parseStudentFromRow(row, rowIndex);
                    System.out.println("DEBUG: Parsed student: " + student.getFirstName() + " " + student.getLastName() + " - Class: " + student.getClassName());
                    allStudents.add(student);
                    
                    // Parse and collect father data
                    ParentCreationDTO father = parseFatherFromRow(row, rowIndex);
                    String fatherPhone = null;
                    if (father != null && father.getPhone() != null) {
                        fatherPhone = father.getPhone();
                        // Check if this phone already exists with different name
                        if (uniqueFathers.containsKey(fatherPhone)) {
                            ParentCreationDTO existingFather = uniqueFathers.get(fatherPhone);
                            validateParentNameConsistency(existingFather, father, "cha", rowIndex);
                        }
                        uniqueFathers.put(fatherPhone, father);
                    }
                    
                    // Parse and collect mother data
                    ParentCreationDTO mother = parseMotherFromRow(row, rowIndex);
                    String motherPhone = null;
                    if (mother != null && mother.getPhone() != null) {
                        motherPhone = mother.getPhone();
                        // Check if this phone already exists with different name
                        if (uniqueMothers.containsKey(motherPhone)) {
                            ParentCreationDTO existingMother = uniqueMothers.get(motherPhone);
                            validateParentNameConsistency(existingMother, mother, "mẹ", rowIndex);
                        }
                        uniqueMothers.put(motherPhone, mother);
                    }
                    
                    // Must have at least one parent
                    if (father == null && mother == null) {
                        throw new IllegalArgumentException("Phải có ít nhất một phụ huynh (cha hoặc mẹ)");
                    }
                    
                    // Validate enable logic for parents
                    String fatherEnableStr = getStringValue(row, COL_FATHER_ENABLED, null);
                    String motherEnableStr = getStringValue(row, COL_MOTHER_ENABLED, null);
                    if (father != null && mother != null) {
                        boolean fatherEnableVal = fatherEnableStr != null && fatherEnableStr.trim().equalsIgnoreCase("có");
                        boolean motherEnableVal = motherEnableStr != null && motherEnableStr.trim().equalsIgnoreCase("có");
                        if (fatherEnableVal == motherEnableVal) {
                            throw new IllegalArgumentException("Chỉ được phép chọn một phụ huynh truy cập hệ thống (Có) ở dòng " + (rowIndex + 1));
                        }
                        father.setEnabled(fatherEnableVal);
                        mother.setEnabled(motherEnableVal);
                    } else if (father != null) {
                        boolean fatherEnableVal = fatherEnableStr != null && fatherEnableStr.trim().equalsIgnoreCase("có");
                        if (!fatherEnableVal) {
                            throw new IllegalArgumentException("Phụ huynh duy nhất (cha) phải được cho phép truy cập hệ thống (Có) ở dòng " + (rowIndex + 1));
                        }
                        father.setEnabled(true);
                    } else if (mother != null) {
                        boolean motherEnableVal = motherEnableStr != null && motherEnableStr.trim().equalsIgnoreCase("có");
                        if (!motherEnableVal) {
                            throw new IllegalArgumentException("Phụ huynh duy nhất (mẹ) phải được cho phép truy cập hệ thống (Có) ở dòng " + (rowIndex + 1));
                        }
                        mother.setEnabled(true);
                    }
                    
                    // Store mapping for later processing
                    studentParentMappings.add(new StudentParentMapping(
                        allStudents.size() - 1, // student index
                        fatherPhone,
                        motherPhone
                    ));
                    
                } catch (Exception e) {
                    throw new IllegalArgumentException("Lỗi ở dòng " + (rowIndex + 1) + ": " + e.getMessage(), e);
                }
            }
            
            if (allStudents.isEmpty()) {
                throw new IllegalArgumentException("File Excel không chứa dữ liệu học sinh hợp lệ");
            }
            
            System.out.println("DEBUG: Total students parsed: " + allStudents.size());
            System.out.println("DEBUG: Total unique fathers: " + uniqueFathers.size());
            System.out.println("DEBUG: Total unique mothers: " + uniqueMothers.size());
            System.out.println("DEBUG: Total student-parent mappings: " + studentParentMappings.size());
            
            // Process in groups by parent combination to use existing service efficiently
            return processStudentsByParentGroups(allStudents, uniqueFathers, uniqueMothers, studentParentMappings);
            
        } catch (IOException e) {
            throw new IllegalArgumentException("Không thể đọc file Excel: " + e.getMessage(), e);
        }
    }
    
    /**
     * Process students by grouping them by parent combinations
     */
    private StudentWithParentsCreationResponseDTO processStudentsByParentGroups(
            List<StudentCreationDTO> allStudents,
            Map<String, ParentCreationDTO> uniqueFathers,
            Map<String, ParentCreationDTO> uniqueMothers,
            List<StudentParentMapping> mappings) {
        
        // Group students by parent combination
        Map<String, List<Integer>> parentGroupings = new HashMap<>();
        for (StudentParentMapping mapping : mappings) {
            String groupKey = (mapping.fatherPhone != null ? mapping.fatherPhone : "null") 
                            + "|" + (mapping.motherPhone != null ? mapping.motherPhone : "null");
            parentGroupings.computeIfAbsent(groupKey, k -> new ArrayList<>()).add(mapping.studentIndex);
        }
        
        // Collect all responses
        List<StudentDTO> allCreatedStudents = new ArrayList<>();
        Set<String> processedParentPhones = new HashSet<>();
        ParentDTO responseFather = null;
        ParentDTO responseMother = null;
        int totalStudents = 0;
        int totalParents = 0;
        
        // Process each parent group
        for (Map.Entry<String, List<Integer>> group : parentGroupings.entrySet()) {
            String[] phones = group.getKey().split("\\|");
            String fatherPhone = "null".equals(phones[0]) ? null : phones[0];
            String motherPhone = "null".equals(phones[1]) ? null : phones[1];
            
            // Get students for this group
            List<StudentCreationDTO> groupStudents = new ArrayList<>();
            for (Integer studentIndex : group.getValue()) {
                groupStudents.add(allStudents.get(studentIndex));
            }
            
            // Create request for this group
            StudentWithParentsCreationDTO request = new StudentWithParentsCreationDTO();
            request.setStudents(groupStudents);
            
            if (fatherPhone != null) {
                request.setFather(uniqueFathers.get(fatherPhone));
            }
            if (motherPhone != null) {
                request.setMother(uniqueMothers.get(motherPhone));
            }
            
            // Process this group
            StudentWithParentsCreationResponseDTO groupResponse = studentService.createStudentWithParents(request);
            
            // Collect results
            allCreatedStudents.addAll(groupResponse.getStudents());
            totalStudents += groupResponse.getStudents().size();
            
            // Track parents (avoid duplicates in response)
            if (groupResponse.getFather() != null && !processedParentPhones.contains(groupResponse.getFather().getPhone())) {
                if (responseFather == null) {
                    responseFather = groupResponse.getFather();
                }
                processedParentPhones.add(groupResponse.getFather().getPhone());
                totalParents++;
            }
            
            if (groupResponse.getMother() != null && !processedParentPhones.contains(groupResponse.getMother().getPhone())) {
                if (responseMother == null) {
                    responseMother = groupResponse.getMother();
                }
                processedParentPhones.add(groupResponse.getMother().getPhone());
                totalParents++;
            }
        }
        
        // Build final response
        StudentWithParentsCreationResponseDTO finalResponse = new StudentWithParentsCreationResponseDTO();
        finalResponse.setStudents(allCreatedStudents);
        finalResponse.setFather(responseFather);
        finalResponse.setMother(responseMother);
        
        // Create comprehensive message
        String message = String.format("Import thành công từ Excel: %d học sinh, %d phụ huynh (%d nhóm gia đình)", 
                                      totalStudents, totalParents, parentGroupings.size());
        finalResponse.setMessage(message);
        
        return finalResponse;
    }
    
    /**
     * Helper class to map students to their parents
     */
    private static class StudentParentMapping {
        final int studentIndex;
        final String fatherPhone;
        final String motherPhone;
        
        StudentParentMapping(int studentIndex, String fatherPhone, String motherPhone) {
            this.studentIndex = studentIndex;
            this.fatherPhone = fatherPhone;
            this.motherPhone = motherPhone;
        }
    }
    
    @Override
    public byte[] generateExcelTemplate() {
        try (XSSFWorkbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            
            Sheet sheet = workbook.createSheet("Template Import Học Sinh");



            // Create header row
            Row headerRow = sheet.createRow(0);
            createHeaderCell(headerRow, COL_STUDENT_FIRST_NAME, "Tên học sinh *");
            createHeaderCell(headerRow, COL_STUDENT_LAST_NAME, "Họ học sinh *");
            createHeaderCell(headerRow, COL_STUDENT_DOB, "Ngày sinh học sinh * (dd/MM/yyyy)");
            createHeaderCell(headerRow, COL_STUDENT_GENDER, "Giới tính học sinh * (M/F)");
            createHeaderCell(headerRow, COL_STUDENT_CLASS, "Lớp *");
            createHeaderCell(headerRow, COL_STUDENT_SCHOOL_YEAR, "Năm học *");
            createHeaderCell(headerRow, COL_STUDENT_BIRTH_PLACE, "Nơi sinh *");
            createHeaderCell(headerRow, COL_STUDENT_ADDRESS, "Địa chỉ học sinh *");
            
            createHeaderCell(headerRow, COL_FATHER_FIRST_NAME, "Tên cha");
            createHeaderCell(headerRow, COL_FATHER_LAST_NAME, "Họ cha");
            createHeaderCell(headerRow, COL_FATHER_PHONE, "SĐT cha * (nếu có cha)");
            createHeaderCell(headerRow, COL_FATHER_GENDER, "Giới tính cha (M)");
            createHeaderCell(headerRow, COL_FATHER_JOB_TITLE, "Nghề nghiệp cha");
            createHeaderCell(headerRow, COL_FATHER_ADDRESS, "Địa chỉ cha");
            createHeaderCell(headerRow, COL_FATHER_DOB, "Ngày sinh cha (dd/MM/yyyy)");
            createHeaderCell(headerRow, COL_FATHER_ENABLED, "Cho phép truy cập hệ thống (có/không) *");
            
            createHeaderCell(headerRow, COL_MOTHER_FIRST_NAME, "Tên mẹ");
            createHeaderCell(headerRow, COL_MOTHER_LAST_NAME, "Họ mẹ");
            createHeaderCell(headerRow, COL_MOTHER_PHONE, "SĐT mẹ * (nếu có mẹ)");
            createHeaderCell(headerRow, COL_MOTHER_GENDER, "Giới tính mẹ (F)");
            createHeaderCell(headerRow, COL_MOTHER_JOB_TITLE, "Nghề nghiệp mẹ");
            createHeaderCell(headerRow, COL_MOTHER_ADDRESS, "Địa chỉ mẹ");
            createHeaderCell(headerRow, COL_MOTHER_DOB, "Ngày sinh mẹ (dd/MM/yyyy)");
            createHeaderCell(headerRow, COL_MOTHER_ENABLED, "Cho phép truy cập hệ thống (có/không) *");
              // Create sample data rows - Multiple students with same parents
            Row sampleRow1 = sheet.createRow(1);
            sampleRow1.createCell(COL_STUDENT_FIRST_NAME).setCellValue("An");
            sampleRow1.createCell(COL_STUDENT_LAST_NAME).setCellValue("Nguyễn Văn");
            sampleRow1.createCell(COL_STUDENT_DOB).setCellValue("15/05/2015");
            sampleRow1.createCell(COL_STUDENT_GENDER).setCellValue("M");
            sampleRow1.createCell(COL_STUDENT_CLASS).setCellValue("5A");
            sampleRow1.createCell(COL_STUDENT_SCHOOL_YEAR).setCellValue("2023-2024");
            sampleRow1.createCell(COL_STUDENT_BIRTH_PLACE).setCellValue("Hà Nội");
            sampleRow1.createCell(COL_STUDENT_ADDRESS).setCellValue("123 Đường ABC, Hà Nội");
            
            sampleRow1.createCell(COL_FATHER_FIRST_NAME).setCellValue("Bình");
            sampleRow1.createCell(COL_FATHER_LAST_NAME).setCellValue("Nguyễn Văn");
            sampleRow1.createCell(COL_FATHER_PHONE).setCellValue("0912345678");
            sampleRow1.createCell(COL_FATHER_GENDER).setCellValue("M");
            sampleRow1.createCell(COL_FATHER_JOB_TITLE).setCellValue("Kỹ sư");
            sampleRow1.createCell(COL_FATHER_ADDRESS).setCellValue("123 Đường ABC, Hà Nội");
            sampleRow1.createCell(COL_FATHER_DOB).setCellValue("20/03/1985");
            sampleRow1.createCell(COL_FATHER_ENABLED).setCellValue("Có");
            
            sampleRow1.createCell(COL_MOTHER_FIRST_NAME).setCellValue("Cẩm");
            sampleRow1.createCell(COL_MOTHER_LAST_NAME).setCellValue("Trần Thị");
            sampleRow1.createCell(COL_MOTHER_PHONE).setCellValue("0987654321");
            sampleRow1.createCell(COL_MOTHER_GENDER).setCellValue("F");
            sampleRow1.createCell(COL_MOTHER_JOB_TITLE).setCellValue("Giáo viên");
            sampleRow1.createCell(COL_MOTHER_ADDRESS).setCellValue("123 Đường ABC, Hà Nội");
            sampleRow1.createCell(COL_MOTHER_DOB).setCellValue("10/08/1987");
            sampleRow1.createCell(COL_MOTHER_ENABLED).setCellValue("Không");
            
            // Second student with SAME parents (same phone numbers)
            Row sampleRow2 = sheet.createRow(2);
            sampleRow2.createCell(COL_STUDENT_FIRST_NAME).setCellValue("Bảo");
            sampleRow2.createCell(COL_STUDENT_LAST_NAME).setCellValue("Nguyễn Văn");
            sampleRow2.createCell(COL_STUDENT_DOB).setCellValue("10/08/2020");
            sampleRow2.createCell(COL_STUDENT_GENDER).setCellValue("M");
            sampleRow2.createCell(COL_STUDENT_CLASS).setCellValue("Mầm non");
            sampleRow2.createCell(COL_STUDENT_SCHOOL_YEAR).setCellValue("2023-2024");
            sampleRow2.createCell(COL_STUDENT_BIRTH_PLACE).setCellValue("Hà Nội");
            sampleRow2.createCell(COL_STUDENT_ADDRESS).setCellValue("123 Đường ABC, Hà Nội");
            
            // SAME FATHER (same phone) - system will reuse
            sampleRow2.createCell(COL_FATHER_FIRST_NAME).setCellValue("Bình");
            sampleRow2.createCell(COL_FATHER_LAST_NAME).setCellValue("Nguyễn Văn");
            sampleRow2.createCell(COL_FATHER_PHONE).setCellValue("0912345678"); // SAME PHONE
            sampleRow2.createCell(COL_FATHER_GENDER).setCellValue("M");
            sampleRow2.createCell(COL_FATHER_JOB_TITLE).setCellValue("Kỹ sư");
            sampleRow2.createCell(COL_FATHER_ADDRESS).setCellValue("123 Đường ABC, Hà Nội");
            sampleRow2.createCell(COL_FATHER_DOB).setCellValue("20/03/1985");
            sampleRow2.createCell(COL_FATHER_ENABLED).setCellValue("Có");
            
            // SAME MOTHER (same phone) - system will reuse
            sampleRow2.createCell(COL_MOTHER_FIRST_NAME).setCellValue("Cẩm");
            sampleRow2.createCell(COL_MOTHER_LAST_NAME).setCellValue("Trần Thị");
            sampleRow2.createCell(COL_MOTHER_PHONE).setCellValue("0987654321"); // SAME PHONE
            sampleRow2.createCell(COL_MOTHER_GENDER).setCellValue("F");
            sampleRow2.createCell(COL_MOTHER_JOB_TITLE).setCellValue("Giáo viên");
            sampleRow2.createCell(COL_MOTHER_ADDRESS).setCellValue("123 Đường ABC, Hà Nội");
            sampleRow2.createCell(COL_MOTHER_DOB).setCellValue("10/08/1987");
            sampleRow2.createCell(COL_MOTHER_ENABLED).setCellValue("Không");
            
            // Third student with DIFFERENT parents
            Row sampleRow3 = sheet.createRow(3);
            sampleRow3.createCell(COL_STUDENT_FIRST_NAME).setCellValue("Mai");
            sampleRow3.createCell(COL_STUDENT_LAST_NAME).setCellValue("Lê Thị");
            sampleRow3.createCell(COL_STUDENT_DOB).setCellValue("20/02/2016");
            sampleRow3.createCell(COL_STUDENT_GENDER).setCellValue("F");
            sampleRow3.createCell(COL_STUDENT_CLASS).setCellValue("3A");
            sampleRow3.createCell(COL_STUDENT_SCHOOL_YEAR).setCellValue("2023-2024");
            sampleRow3.createCell(COL_STUDENT_BIRTH_PLACE).setCellValue("TP.HCM");
            sampleRow3.createCell(COL_STUDENT_ADDRESS).setCellValue("456 Đường XYZ, TP.HCM");
            
            // Only mother for this student (different family)
            // Leave father cells empty
            sampleRow3.createCell(COL_MOTHER_FIRST_NAME).setCellValue("Lan");
            sampleRow3.createCell(COL_MOTHER_LAST_NAME).setCellValue("Phạm Thị");
            sampleRow3.createCell(COL_MOTHER_PHONE).setCellValue("0909123456"); // DIFFERENT PHONE
            sampleRow3.createCell(COL_MOTHER_GENDER).setCellValue("F");
            sampleRow3.createCell(COL_MOTHER_JOB_TITLE).setCellValue("Bác sĩ");
            sampleRow3.createCell(COL_MOTHER_ADDRESS).setCellValue("456 Đường XYZ, TP.HCM");
            sampleRow3.createCell(COL_MOTHER_DOB).setCellValue("15/01/1990");
            sampleRow3.createCell(COL_MOTHER_ENABLED).setCellValue("Có");
            
            // Auto-size columns
            for (int i = 0; i <= COL_MOTHER_DOB; i++) {
                sheet.autoSizeColumn(i);
            }
            
            workbook.write(outputStream);
            return outputStream.toByteArray();
            
        } catch (IOException e) {
            throw new RuntimeException("Không thể tạo file template Excel: " + e.getMessage(), e);
        }
    }
    
    @Override
    public boolean validateExcelFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File không được để trống");
        }
        
        String fileName = file.getOriginalFilename();
        if (fileName == null || (!fileName.endsWith(".xlsx") && !fileName.endsWith(".xls"))) {
            throw new IllegalArgumentException("File phải có định dạng .xlsx hoặc .xls");
        }
        
        // Check file size (max 10MB)
        if (file.getSize() > 10 * 1024 * 1024) {
            throw new IllegalArgumentException("Kích thước file không được vượt quá 10MB");
        }
        
        return true;
    }
    
    private void createHeaderCell(Row row, int columnIndex, String value) {
        Cell cell = row.createCell(columnIndex);
        cell.setCellValue(value);
        
        // Style header cells
        Workbook workbook = row.getSheet().getWorkbook();
        CellStyle headerStyle = workbook.createCellStyle();
        Font headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerStyle.setFont(headerFont);
        headerStyle.setFillForegroundColor(IndexedColors.LIGHT_BLUE.getIndex());
        headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        cell.setCellStyle(headerStyle);
    }
    
    private boolean isRowEmpty(Row row) {
        for (int cellIndex = 0; cellIndex <= COL_MOTHER_DOB; cellIndex++) {
            Cell cell = row.getCell(cellIndex);
            if (cell != null && cell.getCellType() != CellType.BLANK) {
                String cellValue = getCellValueAsString(cell).trim();
                if (!cellValue.isEmpty()) {
                    return false;
                }
            }
        }
        return true;
    }
    
    private StudentCreationDTO parseStudentFromRow(Row row, int rowIndex) {
        StudentCreationDTO student = new StudentCreationDTO();
        
        // Required fields
        student.setFirstName(getRequiredStringValue(row, COL_STUDENT_FIRST_NAME, "Tên học sinh"));
        student.setLastName(getRequiredStringValue(row, COL_STUDENT_LAST_NAME, "Họ học sinh"));
        student.setDob(getRequiredDateValue(row, COL_STUDENT_DOB, "Ngày sinh học sinh"));
        student.setGender(getRequiredStringValue(row, COL_STUDENT_GENDER, "Giới tính học sinh"));
        student.setClassName(getRequiredStringValue(row, COL_STUDENT_CLASS, "Lớp"));
        student.setBirthPlace(getRequiredStringValue(row, COL_STUDENT_BIRTH_PLACE, "Nơi sinh"));
        student.setSchoolYear(getRequiredStringValue(row, COL_STUDENT_SCHOOL_YEAR, "Năm học"));
        student.setAddress(getRequiredStringValue(row, COL_STUDENT_ADDRESS, "Địa chỉ học sinh"));
        student.setIsDisabled(false);
        // Set citizenship to "Việt Nam" automatically
        student.setCitizenship("Việt Nam");
        
        // Validate gender
        if (!student.getGender().equals("M") && !student.getGender().equals("F")) {
            throw new IllegalArgumentException("Giới tính học sinh phải là 'M' hoặc 'F'");
        }
        
        // Validate age (must be <= 12 years old)
        validateStudentAge(student.getDob());
        
        // Auto-set className based on age (2-5 years old -> "Mầm non")
        autoSetClassNameForAge(student);
        
        return student;
    }
    
    private ParentCreationDTO parseFatherFromRow(Row row, int rowIndex) {
        String firstName = getStringValue(row, COL_FATHER_FIRST_NAME);
        String lastName = getStringValue(row, COL_FATHER_LAST_NAME);
        String phone = getStringValue(row, COL_FATHER_PHONE);
        
        // If no father info provided, return null
        if (isEmpty(firstName) && isEmpty(lastName) && isEmpty(phone)) {
            return null;
        }
        
        // If some father info provided, validate required fields
        if (isEmpty(phone)) {
            throw new IllegalArgumentException("Số điện thoại cha là bắt buộc khi có thông tin cha");
        }
        
        // Validate name is provided when phone is provided
        if (isEmpty(firstName) || isEmpty(lastName)) {
            throw new IllegalArgumentException("Họ và tên cha là bắt buộc khi có số điện thoại cha");
        }
        
        // Validate phone number format
        String phoneError = PhoneValidator.validatePhone(phone);
        if (phoneError != null) {
            throw new IllegalArgumentException(phoneError + " (Dòng " + (rowIndex + 1) + ")");
        }
        
        ParentCreationDTO father = new ParentCreationDTO();
        father.setFirstName(firstName);
        father.setLastName(lastName);
        father.setPhone(phone);
        father.setGender(getStringValue(row, COL_FATHER_GENDER, "M"));
        father.setJobTitle(getStringValue(row, COL_FATHER_JOB_TITLE));
        father.setAddress(getStringValue(row, COL_FATHER_ADDRESS));
        father.setDob(getDateValue(row, COL_FATHER_DOB));
        
        // Validate parent age if DOB is provided
        if (father.getDob() != null) {
            validateParentAge(father.getDob());
        }
        
        // Enable will be set later in importStudentsFromExcel for validation
        father.setEnabled(null);
        
        return father;
    }
    
    private ParentCreationDTO parseMotherFromRow(Row row, int rowIndex) {
        String firstName = getStringValue(row, COL_MOTHER_FIRST_NAME);
        String lastName = getStringValue(row, COL_MOTHER_LAST_NAME);
        String phone = getStringValue(row, COL_MOTHER_PHONE);
        
        // If no mother info provided, return null
        if (isEmpty(firstName) && isEmpty(lastName) && isEmpty(phone)) {
            return null;
        }
        
        // If some mother info provided, validate required fields
        if (isEmpty(phone)) {
            throw new IllegalArgumentException("Số điện thoại mẹ là bắt buộc khi có thông tin mẹ");
        }
        
        // Validate name is provided when phone is provided
        if (isEmpty(firstName) || isEmpty(lastName)) {
            throw new IllegalArgumentException("Họ và tên mẹ là bắt buộc khi có số điện thoại mẹ");
        }
        
        // Validate phone number format
        String phoneError = PhoneValidator.validatePhone(phone);
        if (phoneError != null) {
            throw new IllegalArgumentException(phoneError + " (Dòng " + (rowIndex + 1) + ")");
        }
        
        ParentCreationDTO mother = new ParentCreationDTO();
        mother.setFirstName(firstName);
        mother.setLastName(lastName);
        mother.setPhone(phone);
        mother.setGender(getStringValue(row, COL_MOTHER_GENDER, "F"));
        mother.setJobTitle(getStringValue(row, COL_MOTHER_JOB_TITLE));
        mother.setAddress(getStringValue(row, COL_MOTHER_ADDRESS));
        mother.setDob(getDateValue(row, COL_MOTHER_DOB));
        
        // Validate parent age if DOB is provided
        if (mother.getDob() != null) {
            validateParentAge(mother.getDob());
        }
        
        // Enable will be set later in importStudentsFromExcel for validation
        mother.setEnabled(null);
        
        return mother;
    }
    
    private String getRequiredStringValue(Row row, int columnIndex, String fieldName) {
        String value = getStringValue(row, columnIndex);
        if (isEmpty(value)) {
            throw new IllegalArgumentException(fieldName + " là bắt buộc");
        }
        return value;
    }
    
    private LocalDate getRequiredDateValue(Row row, int columnIndex, String fieldName) {
        LocalDate value = getDateValue(row, columnIndex);
        if (value == null) {
            throw new IllegalArgumentException(fieldName + " là bắt buộc");
        }
        return value;
    }
    
    private String getStringValue(Row row, int columnIndex) {
        return getStringValue(row, columnIndex, null);
    }
    
    private String getStringValue(Row row, int columnIndex, String defaultValue) {
        Cell cell = row.getCell(columnIndex);
        if (cell == null) {
            return defaultValue;
        }
        
        String value = getCellValueAsString(cell).trim();
        return value.isEmpty() ? defaultValue : value;
    }
    
    private LocalDate getDateValue(Row row, int columnIndex) {
        Cell cell = row.getCell(columnIndex);
        if (cell == null) {
            return null;
        }
        
        String dateString = getCellValueAsString(cell).trim();
        if (dateString.isEmpty()) {
            return null;
        }
        
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
            return LocalDate.parse(dateString, formatter);
        } catch (DateTimeParseException e) {
            throw new IllegalArgumentException("Định dạng ngày không hợp lệ: " + dateString + ". Vui lòng sử dụng định dạng dd/MM/yyyy");
        }
    }
    
    private Boolean getBooleanValue(Row row, int columnIndex, Boolean defaultValue) {
        Cell cell = row.getCell(columnIndex);
        if (cell == null) {
            return defaultValue;
        }
        
        String value = getCellValueAsString(cell).trim().toLowerCase();
        if (value.isEmpty()) {
            return defaultValue;
        }
        
        if (value.equals("true") || value.equals("1") || value.equals("có")) {
            return true;
        } else if (value.equals("false") || value.equals("0") || value.equals("không")) {
            return false;
        } else {
            throw new IllegalArgumentException("Giá trị boolean không hợp lệ: " + value + ". Vui lòng sử dụng 'true/false' hoặc 'có/không'");
        }
    }
    
    private String getCellValueAsString(Cell cell) {
        if (cell == null) {
            return "";
        }
        
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    return DateTimeFormatter.ofPattern("dd/MM/yyyy").format(
                        cell.getLocalDateTimeCellValue().toLocalDate());
                } else {
                    // Format as integer if it's a whole number
                    double numericValue = cell.getNumericCellValue();
                    if (numericValue == (long) numericValue) {
                        return String.valueOf((long) numericValue);
                    } else {
                        return String.valueOf(numericValue);
                    }
                }
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case FORMULA:
                return cell.getCellFormula();
            default:
                return "";
        }
    }
    
    private boolean isEmpty(String str) {
        return str == null || str.trim().isEmpty();
    }
    
    private void validateStudentAge(LocalDate dateOfBirth) {
        if (dateOfBirth == null) {
            throw new IllegalArgumentException("Ngày sinh học sinh không được để trống");
        }
        
        LocalDate currentDate = LocalDate.now();
        int age = currentDate.getYear() - dateOfBirth.getYear();
        
        if (age > 12) {
            throw new IllegalArgumentException("Học sinh phải dưới hoặc bằng 12 tuổi. Tuổi hiện tại: " + age);
        }
        
        // Check for minimum age (at least 2 years old for kindergarten)
        if (age < 2) {
            throw new IllegalArgumentException("Học sinh phải ít nhất 2 tuổi. Tuổi hiện tại: " + age);
        }
    }
    
    /**
     * Validate parent age - must be at least 18 years old
     * Age calculation is based on year only, not specific birth date
     */
    private void validateParentAge(LocalDate dateOfBirth) {
        if (dateOfBirth == null) {
            return; // DOB is optional for parents
        }
        
        LocalDate currentDate = LocalDate.now();
        int age = currentDate.getYear() - dateOfBirth.getYear();
        
        if (age < 18) {
            throw new IllegalArgumentException("Phụ huynh phải ít nhất 18 tuổi. Tuổi hiện tại: " + age);
        }
        
        if (age > 100) {
            throw new IllegalArgumentException("Tuổi phụ huynh không hợp lệ. Tuổi hiện tại: " + age);
        }
    }
    
    /**
     * Validate that parent with same phone number has consistent name
     */
    private void validateParentNameConsistency(ParentCreationDTO existing, ParentCreationDTO current, String parentType, int rowIndex) {
        String existingFullName = (existing.getLastName() + " " + existing.getFirstName()).trim();
        String currentFullName = (current.getLastName() + " " + current.getFirstName()).trim();
        
        if (!existingFullName.equalsIgnoreCase(currentFullName)) {
            throw new IllegalArgumentException("Số điện thoại " + current.getPhone() + 
                " của " + parentType + " ở dòng " + (rowIndex + 1) + 
                " đã được sử dụng bởi phụ huynh khác với tên: " + existingFullName + 
                ". Vui lòng kiểm tra lại thông tin họ tên phụ huynh.");
        }
    }    /**
     * Auto-set className based on student's age
     * 2-5 years old: "Mầm non"
     * 6-12 years old: Keep existing className unchanged
     * Age calculation is based on year only, not specific birth date
     */
    private void autoSetClassNameForAge(StudentCreationDTO student) {
        if (student.getDob() == null) {
            return; // Age validation will catch this
        }
        
        LocalDate currentDate = LocalDate.now();
        int age = currentDate.getYear() - student.getDob().getYear();
        
        if (age >= 2 && age <= 5) {
            // For kindergarten age (2-5), always set to "Mầm non"
            student.setClassName("Mầm non");
        }
        // For age 6-12, keep existing className unchanged - no automatic setting
    }
}
