// ==================== STUDENT FORM CONSTANTS ====================
// Static data and configuration for student form

import dayjs from "dayjs";

// Gender options for students and parents
export const genderOptions = [
  { value: "M", label: "Nam" },
  { value: "F", label: "Nữ" },
];

// Birth place options (Vietnamese provinces/cities)
export const birthPlaceOptions = [
  "Thành phố Hà Nội",
  "Thành phố Huế",
  "Tỉnh Lai Châu",
  "Tỉnh Điện Biên",
  "Tỉnh Sơn La",
  "Tỉnh Lạng Sơn",
  "Tỉnh Quảng Ninh",
  "Tỉnh Thanh Hoá",
  "Tỉnh Nghệ An",
  "Tỉnh Hà Tĩnh",
  "Tỉnh Cao Bằng",
  "Tỉnh Tuyên Quang",
  "Tỉnh Lào Cai",
  "Tỉnh Thái Nguyên",
  "Tỉnh Phú Thọ",
  "Tỉnh Bắc Ninh",
  "Tỉnh Hưng Yên",
  "Thành phố Hải Phòng",
  "Tỉnh Ninh Bình",
  "Tỉnh Quảng Trị",
  "Thành phố Đà Nẵng",
  "Tỉnh Quảng Ngãi",
  "Tỉnh Gia Lai",
  "Tỉnh Khánh Hoà",
  "Tỉnh Lâm Đồng",
  "Tỉnh Đắk Lắk",
  "Thành phố Hồ Chí Minh",
  "Tỉnh Đồng Nai",
  "Tỉnh Tây Ninh",
  "Thành phố Cần Thơ",
  "Tỉnh Vĩnh Long",
  "Tỉnh Đồng Tháp",
  "Tỉnh Cà Mau",
  "Tỉnh An Giang",
];

// Age constraints for different user types
export const AGE_CONSTRAINTS = {
  STUDENT: {
    MIN_AGE: 2,
    MAX_AGE: 12,
  },
  PARENT: {
    MIN_AGE: 18,
    MAX_AGE: 100,
  },
};

// Default date values
export const DEFAULT_DATES = {
  STUDENT_DOB: dayjs().year(2023).month(0).date(1),
  PARENT_DOB: dayjs().year(2006).startOf("year"),
};

// Grade calculation mapping based on age
export const GRADE_MAPPING = {
  2: "Mầm non",
  3: "Mầm non",
  4: "Mầm non",
  5: "Mầm non",
  6: "1",
  7: "2",
  8: "3",
  9: "4",
  10: "5",
  11: "6",
};

// Form field names for easier maintenance
export const FORM_FIELDS = {
  STUDENT: {
    FIRST_NAME: "student_firstName",
    LAST_NAME: "student_lastName",
    DOB: "student_dob",
    GENDER: "student_gender",
    CLASS_NAME: "student_className",
    SCHOOL_YEAR: "student_schoolYear",
    BIRTH_PLACE: "student_birthPlace",
    ADDRESS: "student_address",
  },
  FATHER: {
    FIRST_NAME: "father_firstName",
    LAST_NAME: "father_lastName",
    PHONE: "father_phone",
    DOB: "father_dob",
    JOB_TITLE: "father_jobTitle",
    ADDRESS: "father_address",
    ENABLED: "father_enabled",
  },
  MOTHER: {
    FIRST_NAME: "mother_firstName",
    LAST_NAME: "mother_lastName",
    PHONE: "mother_phone",
    DOB: "mother_dob",
    JOB_TITLE: "mother_jobTitle",
    ADDRESS: "mother_address",
    ENABLED: "mother_enabled",
  },
};

// Parent types
export const PARENT_TYPES = {
  FATHER: "father",
  MOTHER: "mother",
};

// Default citizenship
export const DEFAULT_CITIZENSHIP = "Việt Nam";

// Form validation messages
export const VALIDATION_MESSAGES = {
  STUDENT: {
    FIRST_NAME_REQUIRED: "Vui lòng nhập tên học sinh",
    LAST_NAME_REQUIRED: "Vui lòng nhập họ học sinh",
    DOB_REQUIRED: "Vui lòng chọn ngày sinh",
    GENDER_REQUIRED: "Vui lòng chọn giới tính",
    CLASS_NAME_REQUIRED: "Vui lòng nhập lớp học",
    SCHOOL_YEAR_REQUIRED: "Vui lòng nhập năm học",
    BIRTH_PLACE_REQUIRED: "Vui lòng chọn nơi sinh",
    ADDRESS_REQUIRED: "Vui lòng chọn địa chỉ",
  },
  PARENT: {
    PHONE_REQUIRED_WITH_INFO: "Số điện thoại là bắt buộc khi có họ tên",
    FIRST_NAME_REQUIRED_WITH_PHONE: "Tên là bắt buộc khi có số điện thoại",
    LAST_NAME_REQUIRED_WITH_PHONE: "Họ là bắt buộc khi có số điện thoại",
    DOB_REQUIRED_WITH_PHONE: "Ngày sinh là bắt buộc khi có số điện thoại",
    JOB_TITLE_REQUIRED_WITH_PHONE: "Nghề nghiệp là bắt buộc khi có số điện thoại",
  },
  GENERAL: {
    AT_LEAST_ONE_PARENT: "Vui lòng nhập thông tin ít nhất một phụ huynh (số điện thoại)",
    COMPLETE_FATHER_INFO: "Vui lòng nhập đầy đủ thông tin bắt buộc của cha: họ, tên, nghề nghiệp, ngày sinh",
    COMPLETE_MOTHER_INFO: "Vui lòng nhập đầy đủ thông tin bắt buộc của mẹ: họ, tên, nghề nghiệp, ngày sinh",
    ONLY_ONE_PARENT_ACCESS: "Chỉ một phụ huynh được phép truy cập hệ thống",
  },
};
