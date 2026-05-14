import React, { useState } from 'react';
import { Upload, Button, Card, Table, Select, Space, Typography, message, Steps, Divider, Tag, Alert } from 'antd'; // <-- Đã thêm Tag và Alert ở đây
import { InboxOutlined, BarChartOutlined, RocketOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import api from '../services/api';

const { Dragger } = Upload;
const { Title, Text, Paragraph } = Typography;

const AdvancedAnalysis: React.FC = () => {
  const [file, setFile] = useState<any>(null);
  const [columns, setColumns] = useState<string[]>([]);
  const [yVar, setYVar] = useState<string>("");
  const [xVars, setXVars] = useState<string[]>([]);
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // 1. Xử lý khi người dùng chọn/kéo file vào
  const handleFileUpload = (file: any) => {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json: any[] = XLSX.utils.sheet_to_json(sheet);

        if (json.length > 0) {
          const columnNames = Object.keys(json[0]);
          setColumns(columnNames);
          setFile(file);
          message.success(`Đã nhận diện thành công ${columnNames.length} cột dữ liệu!`);
        }
      } catch (error) {
        message.error("Không thể đọc nội dung file Excel này.");
      }
    };
    reader.readAsBinaryString(file);
    return false;
  };

  // 2. Gọi API Backend để tính toán hồi quy
  const runAnalysis = async () => {
    if (!file || !yVar || xVars.length === 0) return message.error("Vui lòng thiết lập đầy đủ mô hình!");

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('dependentVar', yVar);
    formData.append('independentVars', xVars.join(','));

    try {
      const res = await api.post('/regression/analyze', formData);
      setResults(res.data);
      message.success("Phân tích hoàn tất!");
    } catch (error: any) {
      message.error(error.response?.data?.message || "Lỗi khi kết nối với máy chủ!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px 20px', maxWidth: 1100, margin: '0 auto', background: '#fff', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <Title level={2}><BarChartOutlined style={{ color: '#1677ff' }} /> Phân tích Hồi quy Tuyến tính (SPSS Online)</Title>
        <Paragraph type="secondary">Tải file Excel lên, chọn biến và nhận ngay kết quả phân tích thống kê.</Paragraph>
      </div>

      <Steps
        responsive={false}
        current={results ? 2 : (file ? 1 : 0)}
        items={[
          {
            title: 'Tải lên dữ liệu',
            content: ( // Đổi từ description sang content
              <div style={{ marginTop: 15, marginBottom: 20 }}>
                <Dragger 
                  beforeUpload={handleFileUpload} 
                  maxCount={1} 
                  showUploadList={!!file}
                  onRemove={() => { setFile(null); setColumns([]); setResults(null); }}
                >
                  <p className="ant-upload-drag-icon"><InboxOutlined /></p>
                  <p className="ant-upload-text">Kéo thả tệp Excel vào đây</p>
                </Dragger>
              </div>
            ),
          },
          {
            title: 'Thiết lập mô hình',
            content: file && ( // Đổi từ description sang content
              <Card style={{ marginTop: 15 }}>
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                  <div>
                    <Text strong><Tag color="blue">Y</Tag> Biến Phụ thuộc:</Text>
                    <Select placeholder="Chọn biến Y" style={{ width: '100%', marginTop: 8 }} onChange={setYVar} options={columns.map(c => ({ label: c, value: c }))} />
                  </div>
                  <div>
                    <Text strong><Tag color="purple">X</Tag> Biến Độc lập:</Text>
                    <Select mode="multiple" placeholder="Chọn các biến X" style={{ width: '100%', marginTop: 8 }} onChange={setXVars} options={columns.map(c => ({ label: c, value: c }))} />
                  </div>
                  <Button type="primary" size="large" icon={<RocketOutlined />} onClick={runAnalysis} loading={loading} block>Bắt đầu phân tích</Button>
                </Space>
              </Card>
            ),
          },
          {
            title: 'Kết quả phân tích',
            content: results && ( // Đổi từ description sang content
              <div style={{ marginTop: 20 }}>
                <Divider orientation="left">Model Summary</Divider>
                <Table pagination={false} bordered dataSource={[results.modelSummary]} columns={[
                    { title: 'R', dataIndex: 'r', align: 'center' },
                    { title: 'R Square', dataIndex: 'rSquare', align: 'center' },
                    { title: 'Adjusted R Square', dataIndex: 'adjRSquare', align: 'center' },
                ]} />
                <Divider orientation="left" style={{ marginTop: 30 }}>Coefficients</Divider>
                <Table pagination={false} bordered dataSource={results.coefficients} columns={[
                    { title: 'Variable', dataIndex: 'var', key: 'var', render: (text) => <Text strong>{text}</Text> },
                    { title: 'B', dataIndex: 'b', align: 'center' },
                    { title: 'Sig.', dataIndex: 'sig', align: 'center', render: (s) => <Text style={{ color: parseFloat(s) < 0.05 ? 'red' : 'black' }}>{s}</Text> },
                ]} />
              </div>
            ),
          },
        ].map(item => ({ ...item, description: item.content }))} // Map lại để Ant Design hiểu 'description' chính là content
      />
    </div>
  );
};

export default AdvancedAnalysis;