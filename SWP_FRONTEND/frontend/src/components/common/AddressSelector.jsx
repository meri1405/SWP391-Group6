import React, { useState, useEffect } from "react";
import { Select, Space, Row, Col } from "antd";
import { EnvironmentOutlined } from "@ant-design/icons";

const { Option } = Select;

const AddressSelector = ({ 
  value, 
  onChange, 
  provinceLabel = "Tỉnh/Thành phố",
  wardLabel = "Phường/Xã",
  disabled = false,
  size = "middle"
}) => {
  const [provinces, setProvinces] = useState({});
  const [wards, setWards] = useState({});
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedWard, setSelectedWard] = useState(null);
  const [filteredWards, setFilteredWards] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load data from JSON files
  useEffect(() => {
    const loadAddressData = async () => {
      setLoading(true);
      try {
        const [provinceResponse, wardResponse] = await Promise.all([
          fetch('/content/province.json'),
          fetch('/content/ward.json')
        ]);

        if (provinceResponse.ok && wardResponse.ok) {
          const provinceData = await provinceResponse.json();
          const wardData = await wardResponse.json();
          
          setProvinces(provinceData);
          setWards(wardData);
        } else {
          console.error('Failed to load address data');
        }
      } catch (error) {
        console.error('Error loading address data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAddressData();
  }, []);

  // Handle province selection
  const handleProvinceChange = (provinceCode) => {
    setSelectedProvince(provinceCode);
    setSelectedWard(null);
    
    // Filter wards based on selected province
    const filteredWardsArray = Object.values(wards).filter(
      ward => ward.parent_code === provinceCode
    );
    setFilteredWards(filteredWardsArray);
    
    // Clear current address since province changed
    if (onChange) {
      onChange(null);
    }
  };

  // Handle ward selection
  const handleWardChange = (wardCode) => {
    setSelectedWard(wardCode);
    
    // Find the selected ward and province
    const selectedWardData = wards[wardCode];
    const selectedProvinceData = provinces[selectedProvince];
    
    if (selectedWardData && selectedProvinceData) {
      // Combine ward and province names into final address string
      const finalAddress = `${selectedWardData.name_with_type}, ${selectedProvinceData.name_with_type}`;
      
      if (onChange) {
        onChange(finalAddress);
      }
    }
  };

  // Parse existing value to set initial selections
  useEffect(() => {
    if (value && typeof value === 'string' && Object.keys(provinces).length > 0 && Object.keys(wards).length > 0) {
      // Try to parse the address string to find matching province and ward
      const provinceCodes = Object.keys(provinces);
      const wardCodes = Object.keys(wards);
      
      let foundProvince = null;
      let foundWard = null;
      
      // Find province by checking if province name is in the address string
      for (const code of provinceCodes) {
        const province = provinces[code];
        if (value.includes(province.name_with_type)) {
          foundProvince = code;
          break;
        }
      }
      
      // Find ward by checking if ward name is in the address string
      for (const code of wardCodes) {
        const ward = wards[code];
        if (value.includes(ward.name_with_type) && ward.parent_code === foundProvince) {
          foundWard = code;
          break;
        }
      }
      
      if (foundProvince && foundWard) {
        setSelectedProvince(foundProvince);
        setSelectedWard(foundWard);
        
        // Set filtered wards for the found province
        const filteredWardsArray = Object.values(wards).filter(
          ward => ward.parent_code === foundProvince
        );
        setFilteredWards(filteredWardsArray);
      }
    }
  }, [value, provinces, wards]);

  // Reset selections when value is cleared
  useEffect(() => {
    if (!value) {
      setSelectedProvince(null);
      setSelectedWard(null);
      setFilteredWards([]);
    }
  }, [value]);

  return (
    <Row gutter={16}>
      <Col span={12}>
        <Select
          placeholder={`Chọn ${provinceLabel.toLowerCase()}`}
          value={selectedProvince}
          onChange={handleProvinceChange}
          style={{ width: '100%' }}
          loading={loading}
          disabled={disabled}
          size={size}
          showSearch
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        >
          {Object.values(provinces).map((province) => (
            <Option key={province.code} value={province.code}>
              {province.name_with_type}
            </Option>
          ))}
        </Select>
      </Col>
      
      <Col span={12}>
        <Select
          placeholder={`Chọn ${wardLabel.toLowerCase()}`}
          value={selectedWard}
          onChange={handleWardChange}
          style={{ width: '100%' }}
          disabled={disabled || !selectedProvince}
          size={size}
          showSearch
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        >
          {filteredWards.map((ward) => (
            <Option key={ward.code} value={ward.code}>
              {ward.name_with_type}
            </Option>
          ))}
        </Select>
      </Col>
    </Row>
  );
};

export default AddressSelector;
