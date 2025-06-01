# Medication Schedule Logic Documentation

## Thay đổi Logic Nghiệp vụ

### Trước đây (Logic cũ):
1. **Khi tạo request**: Medication schedules được tạo ngay lập tức
2. **Khi approve**: Chỉ thay đổi status thành "APPROVED"
3. **Vấn đề**: Schedules tồn tại cho cả requests chưa được approve

### Bây giờ (Logic mới):
1. **Khi tạo request**: KHÔNG tạo schedules, chỉ lưu request với status "PENDING"
2. **Khi approve**: 
   - Thay đổi status thành "APPROVED"
   - **TẠO schedules tự động** cho tất cả item requests
3. **Khi reject**: Không tạo schedules
4. **Khi hiển thị schedules**: Chỉ hiển thị schedules từ requests đã APPROVED

## Các Thay đổi Code

### Backend Changes:

#### 1. MedicationRequestService.java
- `createMedicationRequest()`: Bỏ việc tạo schedules
- `approveMedicationRequest()`: Thêm logic tạo schedules
- `updateMedicationRequest()`: Chỉ tạo/cập nhật schedules nếu request đã approved

#### 2. MedicationScheduleService.java
- `getSchedulesByDate()`: Filter chỉ lấy schedules từ approved requests
- `getSchedulesByDateAndStatus()`: Filter chỉ lấy schedules từ approved requests
- `getSchedulesForStudent()`: Filter chỉ lấy schedules từ approved requests
- `getSchedulesForMedicationRequest()`: Filter chỉ lấy schedules từ approved requests

### Frontend Changes:

#### 1. NurseMedicationRequests.jsx
- Thêm thông báo: "Lịch uống thuốc sẽ được tạo tự động khi bạn phê duyệt yêu cầu"

#### 2. NurseMedicationSchedules.jsx  
- Thêm thông báo: "Chỉ hiển thị lịch uống thuốc từ các yêu cầu đã được phê duyệt"

## Flow Nghiệp vụ Mới

```
1. Phụ huynh tạo medication request
   ↓
2. Request được lưu với status "PENDING"
   ↓ (KHÔNG có schedules)
3. Y tá xem danh sách requests chờ duyệt
   ↓
4a. Y tá APPROVE:
    - Status → "APPROVED"
    - TẠO schedules tự động
    ↓
5a. Schedules xuất hiện trong "Quản lý lịch uống thuốc"

4b. Y tá REJECT:
    - Status → "REJECTED"  
    - KHÔNG tạo schedules
    ↓
5b. Request bị từ chối, không có schedules
```

## Lợi ích

1. **Đúng logic nghiệp vụ**: Chỉ có lịch uống thuốc khi được phê duyệt
2. **Tiết kiệm tài nguyên**: Không tạo schedules không cần thiết
3. **Rõ ràng**: Y tá biết rõ schedules chỉ từ requests đã approved
4. **Kiểm soát tốt**: Y tá có quyền kiểm soát việc tạo schedules

## Test Cases

### Test 1: Tạo request mới
1. Phụ huynh tạo medication request
2. **Kiểm tra**: Không có schedules được tạo
3. **Kiểm tra**: Request có status "PENDING"

### Test 2: Approve request
1. Y tá approve request
2. **Kiểm tra**: Status thành "APPROVED"  
3. **Kiểm tra**: Schedules được tạo tự động
4. **Kiểm tra**: Schedules xuất hiện trong danh sách

### Test 3: Reject request
1. Y tá reject request
2. **Kiểm tra**: Status thành "REJECTED"
3. **Kiểm tra**: Không có schedules được tạo

### Test 4: Hiển thị schedules
1. Truy cập "Quản lý lịch uống thuốc"
2. **Kiểm tra**: Chỉ hiển thị schedules từ approved requests
3. **Kiểm tra**: Không hiển thị schedules từ pending/rejected requests
