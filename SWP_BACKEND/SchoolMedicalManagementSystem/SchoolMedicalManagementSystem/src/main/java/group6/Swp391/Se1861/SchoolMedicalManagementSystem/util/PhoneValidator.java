package group6.Swp391.Se1861.SchoolMedicalManagementSystem.util;

/**
 * Tiện ích xác thực số điện thoại
 * Hỗ trợ kiểm tra và xác thực số điện thoại theo định dạng Việt Nam
 */
public class PhoneValidator {

    /**
     * Danh sách đầu số điện thoại di động của Việt Nam
     */
    private static final String[] VIETNAMESE_MOBILE_PREFIXES = {
            "086", "096", "097", "098", "032", "033", "034", "035", "036", "037", "038", "039", // Viettel
            "070", "079", "077", "076", "078", "089", // Mobifone
            "081", "082", "083", "084", "085", "088", // Vinaphone
            "056", "058", "059", // Vietnamobile
            "052", "099" // Gmobile
    };

    /**
     * Xác thực số điện thoại di động Việt Nam
     * - Phải bắt đầu bằng số 0
     * - Phải có 10 chữ số
     * - Phải thuộc các đầu số nhà mạng Việt Nam
     *
     * @param phone Số điện thoại cần kiểm tra
     * @return true nếu số điện thoại hợp lệ, false nếu không hợp lệ
     */
    public static boolean isValidVietnamesePhone(String phone) {
        if (phone == null || phone.isEmpty()) {
            return false;
        }

        // Loại bỏ khoảng trắng và dấu gạch ngang nếu có
        phone = phone.replaceAll("\\s+|-", "");

        // Kiểm tra độ dài và bắt đầu bằng số 0
        if (phone.length() != 10 || !phone.startsWith("0")) {
            return false;
        }

        // Kiểm tra đầu số
        String prefix = phone.substring(0, 3);
        for (String validPrefix : VIETNAMESE_MOBILE_PREFIXES) {
            if (prefix.equals(validPrefix)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Kiểm tra và trả về thông báo lỗi nếu số điện thoại không hợp lệ
     *
     * @param phone Số điện thoại cần kiểm tra
     * @return Thông báo lỗi hoặc null nếu hợp lệ
     */
    public static String validatePhone(String phone) {
        if (phone == null || phone.isEmpty()) {
            return "Số điện thoại không được để trống";
        }

        // Loại bỏ khoảng trắng và dấu gạch ngang nếu có
        String cleanPhone = phone.replaceAll("\\s+|-", "");

        if (cleanPhone.length() != 10) {
            return "Số điện thoại phải có đúng 10 chữ số";
        }

        if (!cleanPhone.startsWith("0")) {
            return "Số điện thoại phải bắt đầu bằng số 0";
        }

        // Kiểm tra đầu số
        String prefix = cleanPhone.substring(0, 3);
        boolean validPrefix = false;
        for (String validPre : VIETNAMESE_MOBILE_PREFIXES) {
            if (prefix.equals(validPre)) {
                validPrefix = true;
                break;
            }
        }

        if (!validPrefix) {
            return "Số điện thoại không đúng định dạng. Vui lòng nhập đúng đầu số điện thoại Việt Nam";
        }

        return null; // Số điện thoại hợp lệ
    }
}
