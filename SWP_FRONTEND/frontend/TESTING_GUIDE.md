# Hướng dẫn Test Tính năng Quản lý Thuốc cho Y tá

## Cách truy cập và test tính năng

### 1. Khởi chạy ứng dụng
```powershell
# Terminal 1: Backend
cd "d:\SWP391-Group6\SWP_BACKEND\SchoolMedicalManagementSystem\SchoolMedicalManagementSystem"
mvn spring-boot:run

# Terminal 2: Frontend  
cd "d:\SWP391-Group6\SWP_FRONTEND\frontend"
npm run dev
```

### 2. Đăng nhập và truy cập
1. Mở browser và truy cập `http://localhost:5173`
2. Đăng nhập với tài khoản School Nurse
3. Vào School Nurse Dashboard
4. Sẽ thấy 2 menu mới:
   - **Duyệt yêu cầu thuốc** (`/school-nurse-dashboard?tab=medication-requests`)
   - **Quản lý lịch uống thuốc** (`/school-nurse-dashboard?tab=medication-schedules`)

### 3. Test Duyệt yêu cầu thuốc

#### Trường hợp có dữ liệu:
- Bảng hiển thị danh sách yêu cầu chờ duyệt
- Click "Xem chi tiết" để xem thông tin đầy đủ
- Click nút "✓" để duyệt yêu cầu
- Click nút "✗" để từ chối với lý do

#### Trường hợp không có dữ liệu:
- Bảng hiển thị "Không có yêu cầu thuốc nào chờ duyệt"
- Có thể click "Làm mới" để reload

#### Test các tính năng:
1. **View Details Modal**: 
   - Hiển thị thông tin học sinh, ngày yêu cầu, thời gian sử dụng
   - Danh sách thuốc với chi tiết dosage, frequency, purpose
   
2. **Approve Request**:
   - Confirmation dialog xuất hiện
   - Sau khi approve, request biến mất khỏi danh sách
   - Toast notification "Đã duyệt yêu cầu thuốc thành công"

3. **Reject Request**:
   - Modal yêu cầu nhập lý do từ chối
   - Không cho submit nếu không có lý do
   - Sau khi reject, request biến mất khỏi danh sách
   - Toast notification "Đã từ chối yêu cầu thuốc"

### 4. Test Quản lý lịch uống thuốc

#### Filter Controls:
1. **Date Picker**: Chọn ngày để xem lịch
2. **Status Filter**: 
   - Tất cả
   - Chưa uống (PENDING)
   - Đã uống (TAKEN) 
   - Bỏ lỡ (MISSED)
   - Bỏ qua (SKIPPED)
3. **Student Filter**: Chọn học sinh cụ thể

#### Status Summary Cards:
- Hiển thị số lượng theo từng trạng thái
- Update real-time khi có thay đổi

#### Schedules Table:
1. **View Details**: Click "Chi tiết" để xem thông tin đầy đủ
2. **Update Status** (cho PENDING schedules):
   - "Đã uống" → chuyển status thành TAKEN
   - "Bỏ lỡ" → chuyển status thành MISSED
3. **Reset Status** (cho non-PENDING schedules):
   - "Đặt lại" → chuyển về PENDING

#### Test Cases:
1. **Filter by Date**: Chọn ngày khác nhau, data thay đổi accordingly
2. **Filter by Status**: Chọn status khác nhau, chỉ hiện schedules phù hợp
3. **Filter by Student**: Chọn học sinh, reset date filter, hiện all schedules của student đó
4. **Status Updates**: 
   - Click "Đã uống" → status chuyển thành green "Đã uống" tag
   - Click "Bỏ lỡ" → status chuyển thành red "Bỏ lỡ" tag
   - Click "Đặt lại" → status trở về orange "Chưa uống" tag

### 5. Error Handling Test

#### Network Errors:
1. Tắt backend server
2. Thử các thao tác → sẽ thấy error messages
3. Bật lại backend → functionality hoạt động trở lại

#### Authentication Errors:
1. Token expire hoặc invalid
2. API calls sẽ fail với appropriate error messages

#### Validation Errors:
1. Reject request mà không nhập lý do
2. Error message hiển thị

### 6. UI/UX Test

#### Responsive Design:
1. Resize browser window
2. Test trên mobile viewport
3. Tables và modals adapt accordingly

#### Loading States:
1. Thấy loading spinners khi fetch data
2. Buttons show loading state khi processing

#### User Feedback:
1. Success/Error toast notifications
2. Confirmation dialogs cho destructive actions
3. Proper error messages cho failed operations

### 7. Performance Test

#### Data Loading:
1. Large datasets load reasonably fast
2. Pagination works correctly
3. Filters don't cause lag

#### Memory Usage:
1. No memory leaks when navigating between tabs
2. Components cleanup properly

## Expected API Responses

### GET /api/nurse/medications/requests/pending
```json
[
  {
    "id": 1,
    "studentName": "Nguyễn Văn A",
    "studentId": "ST001",
    "className": "10A1",
    "requestDate": "2025-06-01",
    "startDate": "2025-06-02",
    "endDate": "2025-06-15",
    "status": "PENDING",
    "note": "Cần uống thuốc đúng giờ",
    "itemRequests": [
      {
        "id": 1,
        "itemName": "Paracetamol",
        "itemType": "TABLET",
        "dosage": "500",
        "frequency": "2",
        "purpose": "Giảm đau, hạ sốt",
        "note": "Uống sau ăn"
      }
    ]
  }
]
```

### GET /api/nurse/medications/schedules
```json
[
  {
    "id": 1,
    "studentId": "ST001",
    "studentName": "Nguyễn Văn A",
    "className": "10A1",
    "medicationName": "Paracetamol",
    "dosage": "500",
    "unit": "mg",
    "scheduledDate": "2025-06-01",
    "scheduledTime": "08:00",
    "status": "PENDING",
    "notes": "Uống sau ăn",
    "instructions": "Uống với nhiều nước"
  }
]
```

## Troubleshooting

### Frontend không kết nối được Backend:
1. Kiểm tra backend server đang chạy trên port đúng
2. Kiểm tra CORS settings
3. Kiểm tra network tab trong browser devtools

### Components không hiển thị:
1. Check console cho JavaScript errors
2. Verify imports paths đúng
3. Check CSS files được load

### Authentication issues:
1. Verify user có role SCHOOL_NURSE
2. Check JWT token còn valid
3. Check AuthContext implementation

### Styling issues:
1. Clear browser cache
2. Check CSS files imported đúng thứ tự
3. Verify CSS class names match

Chúc bạn test thành công! 🎉
