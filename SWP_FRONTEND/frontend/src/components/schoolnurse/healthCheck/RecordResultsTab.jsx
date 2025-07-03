import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import healthCheckApi from '../../../api/healthCheckApi';

const RecordResultsTab = ({ campaign, campaignId, onRefreshData }) => {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedStudents, setConfirmedStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(true);

  // Fetch confirmed students when component mounts
  useEffect(() => {
    const fetchConfirmedStudents = async () => {
      if (!campaignId) return;
      
      setLoadingStudents(true);
      console.log('Making API call to getConfirmedStudents with campaignId:', campaignId);
      try {
        const students = await healthCheckApi.getConfirmedStudents(campaignId);
        console.log('API call successful - confirmed students response:', students);
        console.log('API call successful - students type:', typeof students);
        console.log('API call successful - students is array:', Array.isArray(students));
        console.log('API call successful - students length:', students?.length);
        setConfirmedStudents(students || []);
      } catch (error) {
        console.error('Error fetching confirmed students:', error);
        console.error('Error response:', error.response);
        console.error('Error status:', error.response?.status);
        console.error('Error data:', error.response?.data);
        toast.error('Không thể tải danh sách học sinh đã xác nhận');
        setConfirmedStudents([]);
      } finally {
        setLoadingStudents(false);
      }
    };

    fetchConfirmedStudents();
  }, [campaignId]);

  // Initialize form data when student is selected
  useEffect(() => {
    if (selectedStudent && campaign?.categories) {
      const initialData = {};
      campaign.categories.forEach(category => {
        initialData[category] = getInitialCategoryData(category);
      });
      setFormData(initialData);
    }
  }, [selectedStudent, campaign]);

  const getInitialCategoryData = (category) => {
    switch (category) {
      case 'VISION':
        return {
          visionLeft: '',
          visionRight: '',
          visionLeftWithGlass: '',
          visionRightWithGlass: '',
          visionDescription: '',
          dateOfExamination: new Date().toISOString().split('T')[0]
        };
      case 'HEARING':
        return {
          leftEar: '',
          rightEar: '',
          description: '',
          dateOfExamination: new Date().toISOString().split('T')[0]
        };
      case 'ORAL':
        return {
          teethCondition: '',
          gumsCondition: '',
          tongueCondition: '',
          description: '',
          dateOfExamination: new Date().toISOString().split('T')[0],
          isAbnormal: false
        };
      case 'SKIN':
        return {
          skinColor: '',
          rashes: false,
          lesions: false,
          dryness: false,
          eczema: false,
          psoriasis: false,
          skinInfection: false,
          allergies: false,
          description: '',
          treatment: '',
          dateOfExamination: new Date().toISOString().split('T')[0],
          isAbnormal: false,
          followUpDate: ''
        };
      case 'RESPIRATORY':
        return {
          breathingRate: '',
          breathingSound: '',
          wheezing: false,
          cough: false,
          breathingDifficulty: false,
          oxygenSaturation: '',
          treatment: '',
          description: '',
          dateOfExamination: new Date().toISOString().split('T')[0],
          isAbnormal: false,
          followUpDate: ''
        };
      default:
        return {};
    }
  };

  const handleInputChange = (category, field, value) => {
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  const renderVisionForm = (categoryData) => (
    <div className="category-form">
      <h4 className="text-lg font-semibold mb-4 text-blue-600">Thị lực (Vision)</h4>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Thị lực mắt trái (không kính) *
          </label>
          <input
            type="number"
            min="0"
            max="20"
            step="0.1"
            value={categoryData.visionLeft}
            onChange={(e) => handleInputChange('VISION', 'visionLeft', parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Thị lực mắt phải (không kính) *
          </label>
          <input
            type="number"
            min="0"
            max="20"
            step="0.1"
            value={categoryData.visionRight}
            onChange={(e) => handleInputChange('VISION', 'visionRight', parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Thị lực mắt trái (có kính)
          </label>
          <input
            type="number"
            min="0"
            max="20"
            step="0.1"
            value={categoryData.visionLeftWithGlass}
            onChange={(e) => handleInputChange('VISION', 'visionLeftWithGlass', parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Thị lực mắt phải (có kính)
          </label>
          <input
            type="number"
            min="0"
            max="20"
            step="0.1"
            value={categoryData.visionRightWithGlass}
            onChange={(e) => handleInputChange('VISION', 'visionRightWithGlass', parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mô tả
          </label>
          <textarea
            value={categoryData.visionDescription}
            onChange={(e) => handleInputChange('VISION', 'visionDescription', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
          />
        </div>
      </div>
    </div>
  );

  const renderHearingForm = (categoryData) => (
    <div className="category-form">
      <h4 className="text-lg font-semibold mb-4 text-green-600">Thính lực (Hearing)</h4>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tai trái (dB) *
          </label>
          <input
            type="number"
            min="0"
            max="120"
            value={categoryData.leftEar}
            onChange={(e) => handleInputChange('HEARING', 'leftEar', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tai phải (dB) *
          </label>
          <input
            type="number"
            min="0"
            max="120"
            value={categoryData.rightEar}
            onChange={(e) => handleInputChange('HEARING', 'rightEar', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mô tả
          </label>
          <textarea
            value={categoryData.description}
            onChange={(e) => handleInputChange('HEARING', 'description', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            rows="3"
          />
        </div>
      </div>
    </div>
  );

  const renderOralForm = (categoryData) => (
    <div className="category-form">
      <h4 className="text-lg font-semibold mb-4 text-purple-600">Răng miệng (Oral)</h4>
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tình trạng răng *
          </label>
          <input
            type="text"
            value={categoryData.teethCondition}
            onChange={(e) => handleInputChange('ORAL', 'teethCondition', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tình trạng nướu *
          </label>
          <input
            type="text"
            value={categoryData.gumsCondition}
            onChange={(e) => handleInputChange('ORAL', 'gumsCondition', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tình trạng lưỡi *
          </label>
          <input
            type="text"
            value={categoryData.tongueCondition}
            onChange={(e) => handleInputChange('ORAL', 'tongueCondition', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={categoryData.isAbnormal}
              onChange={(e) => handleInputChange('ORAL', 'isAbnormal', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm font-medium text-gray-700">Bất thường</span>
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mô tả
          </label>
          <textarea
            value={categoryData.description}
            onChange={(e) => handleInputChange('ORAL', 'description', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            rows="3"
          />
        </div>
      </div>
    </div>
  );

  const renderSkinForm = (categoryData) => (
    <div className="category-form">
      <h4 className="text-lg font-semibold mb-4 text-orange-600">Da (Skin)</h4>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Màu da *
          </label>
          <input
            type="text"
            value={categoryData.skinColor}
            onChange={(e) => handleInputChange('SKIN', 'skinColor', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Điều trị
          </label>
          <input
            type="text"
            value={categoryData.treatment}
            onChange={(e) => handleInputChange('SKIN', 'treatment', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tình trạng da
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: 'rashes', label: 'Phát ban' },
              { key: 'lesions', label: 'Tổn thương' },
              { key: 'dryness', label: 'Khô da' },
              { key: 'eczema', label: 'Chàm' },
              { key: 'psoriasis', label: 'Vảy nến' },
              { key: 'skinInfection', label: 'Nhiễm trùng da' },
              { key: 'allergies', label: 'Dị ứng' },
              { key: 'isAbnormal', label: 'Bất thường' }
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center">
                <input
                  type="checkbox"
                  checked={categoryData[key]}
                  onChange={(e) => handleInputChange('SKIN', key, e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ngày tái khám
          </label>
          <input
            type="date"
            value={categoryData.followUpDate}
            onChange={(e) => handleInputChange('SKIN', 'followUpDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mô tả
          </label>
          <textarea
            value={categoryData.description}
            onChange={(e) => handleInputChange('SKIN', 'description', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            rows="3"
          />
        </div>
      </div>
    </div>
  );

  const renderRespiratoryForm = (categoryData) => (
    <div className="category-form">
      <h4 className="text-lg font-semibold mb-4 text-red-600">Hô hấp (Respiratory)</h4>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nhịp thở (lần/phút) *
          </label>
          <input
            type="number"
            min="0"
            max="200"
            value={categoryData.breathingRate}
            onChange={(e) => handleInputChange('RESPIRATORY', 'breathingRate', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Âm thở *
          </label>
          <input
            type="text"
            value={categoryData.breathingSound}
            onChange={(e) => handleInputChange('RESPIRATORY', 'breathingSound', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            SpO2 (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={categoryData.oxygenSaturation}
            onChange={(e) => handleInputChange('RESPIRATORY', 'oxygenSaturation', parseInt(e.target.value) || null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Điều trị
          </label>
          <input
            type="text"
            value={categoryData.treatment}
            onChange={(e) => handleInputChange('RESPIRATORY', 'treatment', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Triệu chứng
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: 'wheezing', label: 'Thở khò khè' },
              { key: 'cough', label: 'Ho' },
              { key: 'breathingDifficulty', label: 'Khó thở' },
              { key: 'isAbnormal', label: 'Bất thường' }
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center">
                <input
                  type="checkbox"
                  checked={categoryData[key]}
                  onChange={(e) => handleInputChange('RESPIRATORY', key, e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ngày tái khám
          </label>
          <input
            type="date"
            value={categoryData.followUpDate}
            onChange={(e) => handleInputChange('RESPIRATORY', 'followUpDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mô tả
          </label>
          <textarea
            value={categoryData.description}
            onChange={(e) => handleInputChange('RESPIRATORY', 'description', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            rows="3"
          />
        </div>
      </div>
    </div>
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudent) {
      toast.error('Vui lòng chọn học sinh');
      return;
    }

    setIsSubmitting(true);
    try {
      // Transform form data to match backend DTO structure
      const categoryResults = campaign.categories.map(category => {
        const categoryData = formData[category];
        let status = 'NORMAL';
        
        // Determine status based on category-specific abnormal flags
        if (category === 'ORAL' || category === 'SKIN' || category === 'RESPIRATORY') {
          if (categoryData.isAbnormal) {
            status = categoryData.treatment ? 'NEEDS_TREATMENT' : 'ABNORMAL';
          }
        } else if (category === 'VISION') {
          // Consider abnormal if vision is below normal threshold
          if (categoryData.visionLeft < 1.0 || categoryData.visionRight < 1.0) {
            status = 'ABNORMAL';
          }
        } else if (category === 'HEARING') {
          // Consider abnormal if hearing threshold is above normal
          if (categoryData.leftEar > 25 || categoryData.rightEar > 25) {
            status = 'ABNORMAL';
          }
        }

        return {
          category,
          status,
          notes: categoryData.description || categoryData.visionDescription || ''
        };
      });

      const resultData = {
        studentId: selectedStudent.studentID,
        campaignId: campaign.id,
        categories: categoryResults,
        detailedResults: formData // Include detailed form data for backend processing
      };

      await healthCheckApi.recordHealthCheckResult(resultData);
      toast.success('Ghi nhận kết quả khám sức khỏe thành công!');
      
      // Reset form
      setSelectedStudent(null);
      setFormData({});
      
      // Refresh data if callback provided
      if (onRefreshData) {
        onRefreshData();
      }
    } catch (error) {
      console.error('Error recording health check result:', error);
      toast.error('Có lỗi xảy ra khi ghi nhận kết quả. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Debug logging
  console.log('RecordResultsTab - confirmedStudents from state:', confirmedStudents);
  console.log('RecordResultsTab - confirmedStudents length:', confirmedStudents.length);

  if (loadingStudents) {
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Đang tải danh sách học sinh...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">Ghi nhận kết quả khám sức khỏe</h3>
        
        {/* Student Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chọn học sinh để ghi nhận kết quả
          </label>
          <select
            value={selectedStudent?.studentID || ''}
            onChange={(e) => {
              const studentId = e.target.value;
              const student = confirmedStudents.find(s => s.studentID.toString() === studentId);
              setSelectedStudent(student || null);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Chọn học sinh --</option>
            {confirmedStudents.map(student => (
              <option key={student.studentID} value={student.studentID}>
                {student.fullName} - {student.className}
              </option>
            ))}
          </select>
        </div>

        {/* Results Form */}
        {selectedStudent && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800">
                Học sinh: {selectedStudent.fullName}
              </h4>
              <p className="text-blue-600">Lớp: {selectedStudent.className}</p>
            </div>

            {/* Dynamic Category Forms */}
            <div className="space-y-8">
              {campaign.categories?.map(category => (
                <div key={category} className="border border-gray-200 p-6 rounded-lg">
                  {category === 'VISION' && formData.VISION && renderVisionForm(formData.VISION)}
                  {category === 'HEARING' && formData.HEARING && renderHearingForm(formData.HEARING)}
                  {category === 'ORAL' && formData.ORAL && renderOralForm(formData.ORAL)}
                  {category === 'SKIN' && formData.SKIN && renderSkinForm(formData.SKIN)}
                  {category === 'RESPIRATORY' && formData.RESPIRATORY && renderRespiratoryForm(formData.RESPIRATORY)}
                </div>
              ))}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Đang lưu...' : 'Lưu kết quả'}
              </button>
            </div>
          </form>
        )}

        {confirmedStudents.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>Chưa có học sinh nào xác nhận tham gia khám sức khỏe.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecordResultsTab;
