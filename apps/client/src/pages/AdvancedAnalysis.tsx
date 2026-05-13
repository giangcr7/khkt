import React, { useState } from 'react';
import { Upload, Button, Card, Table, Select, Space, Typography, Alert, message, Steps } from 'antd';
import { InboxOutlined, BarChartOutlined, RocketOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import api from '../services/api';

const { Dragger } = Upload;
const { Title, Text } = Typography;

const AdvancedAnalysis: React.FC = () => {
  const [file, setFile] = useState<any>(null);
  const [columns, setColumns] = useState<string[]>([]);
  const [yVar, setYVar] = useState<string>("");
  const [xVars, setXVars] = useState<string[]>([]);
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // 1. Xử lý khi upload file để lấy danh sách tên cột
  const handleFileUpload = (info: any) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(sheet);
      if (json.length > 0) {
        setColumns(Object.keys(json[0] as any));
        setFile(info.file);
        message.success("Đã đọc file thành công!");
      }
    };
    reader.readAsBinaryString(info.file);
    return false; // Ngăn upload tự động
  };

  const runAnalysis = async () => {
    if (!yVar || xVars.length === 0) return message.error("Vui lòng chọn đủ biến!");
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('dependentVar', yVar);
    formData.append('independentVars', xVars.join(','));

    try {
      const res = await api.post('/regression/analyze', formData);
      setResults(res.data);
    } catch (error) {
      message.error("Lỗi phân tích số liệu!");
    } finally {
      setLoading(false);
    }
  };

return (
  <div style={{ padding: 40, maxWidth: 1000, margin: '0 auto' }}>
    <Title level={2}><BarChartOutlined /> Phân tích Hồi quy Tự động (SPSS Style)</Title>
    
    <Steps
      direction="vertical"
      current={results ? 2 : (file ? 1 : 0)}
      items={[
        {
          title: 'Tải lên dữ liệu Excel',
          description: (
            <Dragger beforeUpload={handleFileUpload} maxCount={1} showUploadList={false}>
              <p className="ant-upload-drag-icon"><InboxOutlined /></p>
              <p>Kéo thả file .xlsx hoặc .csv vào đây</p>
            </Dragger>
          ),
        },
        {
          title: 'Thiết lập mô hình',
          description: file && (
            <Card style={{ marginTop: 20 }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text strong>Chọn biến Phụ thuộc (Y):</Text>
                <Select 
                  style={{ width: '100%' }} 
                  onChange={setYVar} 
                  options={columns.map(c => ({ label: c, value: c }))} 
                />
                
                <Text strong>Chọn các biến Độc lập (X):</Text>
                <Select 
                  mode="multiple" 
                  style={{ width: '100%' }} 
                  onChange={setXVars} 
                  options={columns.map(c => ({ label: c, value: c }))} 
                />
                
                <Button 
                  type="primary" 
                  icon={<RocketOutlined />} 
                  onClick={runAnalysis} 
                  loading={loading}
                >
                  Chạy phân tích
                </Button>
              </Space>
            </Card>
          ),
        },
        {
          title: 'Kết quả phân tích',
          description: results && (
            <div style={{ marginTop: 20 }}>
              <Title level={4}>1. Model Summary</Title>
              <Table 
                pagination={false} 
                dataSource={[results.modelSummary]} 
                columns={[
                  { title: 'R', dataIndex: 'r' },
                  { title: 'R Square', dataIndex: 'rSquare' },
                  { title: 'Adj. R Square', dataIndex: 'adjRSquare' },
                ]} 
              />

              <Title level={4} style={{ marginTop: 20 }}>2. Coefficients (Hệ số hồi quy)</Title>
              <Table 
                pagination={false} 
                dataSource={results.coefficients} 
                columns={[
                  { title: 'Biến', dataIndex: 'var' },
                  { title: 'B (Unstandardized)', dataIndex: 'b' },
                  { 
                    title: 'Sig.', 
                    dataIndex: 'sig', 
                    render: (s) => <Text style={{ color: parseFloat(s) < 0.05 ? 'red' : 'black' }}>{s}</Text> 
                  },
                ]} 
              />
            </div>
          ),
        },
      ]}
    />
  </div>
);
}

export default AdvancedAnalysis;