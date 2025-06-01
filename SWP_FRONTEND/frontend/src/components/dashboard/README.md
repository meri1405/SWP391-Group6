# Nurse Medication Management System

## Tổng quan
Hệ thống quản lý thuốc cho y tá trường học, cho phép y tá duyệt yêu cầu thuốc từ phụ huynh và quản lý lịch uống thuốc của học sinh.

## Các tính năng đã triển khai

### 1. Duyệt yêu cầu thuốc từ phụ huynh
- **Component**: `NurseMedicationRequests.jsx`
- **API**: `nurseApi.js`
- **Đường dẫn**: `/school-nurse-dashboard?tab=medication-requests`

#### Chức năng:
- Xem danh sách yêu cầu thuốc chờ duyệt
- Xem chi tiết yêu cầu bao gồm thông tin học sinh và danh sách thuốc
- Duyệt yêu cầu thuốc
- Từ chối yêu cầu với ghi chú lý do
- Làm mới danh sách

#### API endpoints được sử dụng:
- `GET /api/nurse/medications/requests/pending` - Lấy danh sách yêu cầu chờ duyệt
- `PUT /api/nurse/medications/requests/{requestId}/approve` - Duyệt yêu cầu
- `PUT /api/nurse/medications/requests/{requestId}/reject` - Từ chối yêu cầu

### 2. Quản lý lịch uống thuốc
- **Component**: `NurseMedicationSchedules.jsx`
- **API**: `nurseApi.js`
- **Đường dẫn**: `/school-nurse-dashboard?tab=medication-schedules`

#### Chức năng:
- Xem lịch uống thuốc theo ngày
- Lọc theo trạng thái (Chưa uống, Đã uống, Bỏ lỡ, Bỏ qua)
- Lọc theo học sinh cụ thể
- Cập nhật trạng thái uống thuốc
- Xem chi tiết lịch uống thuốc
- Thống kê tổng quan theo trạng thái

#### API endpoints được sử dụng:
- `GET /api/nurse/medications/schedules` - Lấy lịch uống thuốc theo ngày/trạng thái
- `GET /api/nurse/medications/schedules/student/{studentId}` - Lấy lịch của học sinh cụ thể
- `PUT /api/nurse/medications/schedules/{scheduleId}/status` - Cập nhật trạng thái

## Cấu trúc File

### Frontend Components
```
src/
├── components/
│   └── dashboard/
│       ├── NurseMedicationRequests.jsx    # Component duyệt yêu cầu thuốc
│       └── NurseMedicationSchedules.jsx   # Component quản lý lịch uống thuốc
├── api/
│   └── nurseApi.js                        # API service layer
├── styles/
│   └── NurseMedicationComponents.css      # CSS styling cho components
└── pages/
    └── SchoolNurseDashboard.jsx           # Dashboard chính (đã cập nhật)
```

### Backend APIs (đã có sẵn)
```
src/main/java/group6/Swp391/Se1861/SchoolMedicalManagementSystem/
├── controller/
│   └── NurseMedicationController.java     # REST API endpoints
└── service/
    ├── MedicationRequestService.java      # Business logic cho requests
    └── MedicationScheduleService.java     # Business logic cho schedules
```

## Hướng dẫn sử dụng

### 1. Truy cập tính năng
1. Đăng nhập với tài khoản School Nurse
2. Vào School Nurse Dashboard
3. Chọn tab "Duyệt yêu cầu thuốc" hoặc "Quản lý lịch uống thuốc"

### 2. Duyệt yêu cầu thuốc
1. Xem danh sách yêu cầu chờ duyệt
2. Click "Xem chi tiết" để xem thông tin đầy đủ
3. Click nút "Duyệt" (✓) để phê duyệt
4. Click nút "Từ chối" (✗) và nhập lý do để từ chối

### 3. Quản lý lịch uống thuốc
1. Chọn ngày muốn xem lịch
2. Lọc theo trạng thái hoặc học sinh nếu cần
3. Cập nhật trạng thái uống thuốc:
   - "Đã uống" cho thuốc đã được uống
   - "Bỏ lỡ" cho thuốc không được uống đúng giờ
   - "Đặt lại" để trở về trạng thái chưa uống

## Tính năng UI/UX

### 1. Responsive Design
- Hỗ trợ desktop, tablet và mobile
- Layout linh hoạt với CSS Grid và Flexbox

### 2. Real-time Updates
- Optimistic UI updates
- Loading states và feedback người dùng

### 3. User Experience
- Confirmation dialogs cho các hành động quan trọng
- Toast notifications cho feedback
- Detailed modal views
- Intuitive filtering và searching

### 4. Accessibility
- Keyboard navigation
- Screen reader support
- Color contrast compliance
- Semantic HTML structure

## Styling và Theming

### CSS Classes chính:
- `.nurse-medication-container` - Container chính
- `.medication-requests-table` - Bảng yêu cầu thuốc
- `.schedules-table` - Bảng lịch uống thuốc
- `.status-summary-card` - Card thống kê trạng thái
- `.medication-item` - Item thuốc trong chi tiết

### Color Scheme:
- Primary: `#1890ff` (Blue)
- Success: `#52c41a` (Green)
- Warning: `#faad14` (Orange)
- Error: `#ff4d4f` (Red)

## Error Handling

### Frontend:
- Try-catch blocks cho tất cả API calls
- User-friendly error messages
- Fallback UI states

### Backend Integration:
- Proper HTTP status code handling
- Token-based authentication
- Request/Response validation

## Performance Optimizations

### Frontend:
- Lazy loading components
- Memoized callbacks với useCallback
- Optimistic UI updates
- Efficient re-rendering với proper dependency arrays

### Data Management:
- Local state caching
- Debounced search inputs
- Pagination support

## Testing Considerations

### Unit Tests cần thêm:
- Component rendering tests
- User interaction tests
- API service tests
- Error handling tests

### Integration Tests:
- End-to-end workflow tests
- API integration tests
- Authentication flow tests

## Future Enhancements

### 1. Advanced Features:
- Bulk operations (approve/reject multiple requests)
- Advanced filtering và sorting
- Export functionality (PDF, Excel)
- Print layouts cho reports

### 2. Notifications:
- Real-time notifications
- Email alerts
- Push notifications

### 3. Analytics:
- Usage statistics
- Medication adherence tracking
- Reporting dashboard

### 4. Mobile App:
- React Native version
- Offline capabilities
- Push notifications

## Security Considerations

### 1. Authentication:
- JWT token validation
- Role-based access control
- Session timeout handling

### 2. Data Protection:
- Input sanitization
- XSS protection
- CSRF protection

### 3. Privacy:
- Medical data encryption
- Audit logging
- GDPR compliance

## Deployment

### Development:
```bash
# Frontend
cd SWP_FRONTEND/frontend
npm install
npm run dev

# Backend
cd SWP_BACKEND/SchoolMedicalManagementSystem/SchoolMedicalManagementSystem
mvn spring-boot:run
```

### Production:
- Build optimizations
- Environment configurations
- Database migrations
- Security hardening

## Troubleshooting

### Common Issues:
1. **API không kết nối được**: Kiểm tra backend server và CORS settings
2. **Authentication errors**: Verify JWT token và user roles
3. **Styling issues**: Clear browser cache và kiểm tra CSS imports
4. **Performance issues**: Check browser dev tools và optimize renders

### Debug Tools:
- Browser DevTools
- React Developer Tools
- Network tab cho API debugging
- Console logs cho error tracking
