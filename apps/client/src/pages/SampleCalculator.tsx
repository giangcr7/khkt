import React, { useState } from 'react';
import { Card, Tabs, Form, InputNumber, Button, Alert, Typography, Tooltip, Space, Divider, Collapse, Tag } from 'antd';
import { InfoCircleOutlined, CalculatorOutlined, BarChartOutlined, BookOutlined, FireOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

const SampleCalculator: React.FC = () => {
  const [result, setResult] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<string>("Yamane");

  // 1. Yamane: n = N / (1 + N * e^2)
  const calculateYamane = (values: any) => {
    const { population, errorMargin } = values;
    const n = population / (1 + population * Math.pow(errorMargin, 2));
    setResult(Math.ceil(n)); 
    setActiveTab("Yamane");
  };

  // 2. Cochran: n = (Z^2 * p * q) / e^2
  const calculateCochran = (values: any) => {
    const { zScore, pValue, errorMargin } = values;
    const qValue = 1 - pValue;
    const n = (Math.pow(zScore, 2) * pValue * qValue) / Math.pow(errorMargin, 2);
    setResult(Math.ceil(n));
    setActiveTab("Cochran");
  };

  // 3. Tabachnick: n >= 50 + 8m (Hồi quy) hoặc n >= 104 + m (Kiểm định hệ số)
  const calculateTabachnick = (values: any) => {
    const { ivCount } = values;
    const n = 104 + ivCount; 
    setResult(n);
    setActiveTab("Tabachnick & Fidell");
  };

  // 4. Hair et al.: n = 5 * số biến quan sát (Tối thiểu)
  const calculateHair = (values: any) => {
    const { itemCount } = values;
    const n = 5 * itemCount;
    setResult(n);
    setActiveTab("Quy tắc Hair et al.");
  };

  const handleTabChange = () => {
    setResult(null);
  };

  return (
    <div style={{ background: '#f0f2f5', minHeight: '100vh', padding: '40px 24px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        
        {/* Header Section */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={2} style={{ color: '#1890ff' }}>
            <BarChartOutlined /> CÔNG CỤ TÍNH TOÁN & TRA CỨU THỐNG KÊ
          </Title>
          <Text type="secondary">Dựa trên các tiêu chuẩn học thuật quốc tế dành cho Nghiên cứu khoa học</Text>
        </div>

        {/* Calculator Card */}
        <Card style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: 24 }}>
          <Tabs defaultActiveKey="1" onChange={handleTabChange} type="line" size="large">
            
            {/* CÔNG THỨC 1: YAMANE */}
            <Tabs.TabPane tab="Yamane (Biết N)" key="1">
              <div style={{ padding: '16px 0' }}>
                <Paragraph><Tag color="blue">Ứng dụng:</Tag> Khi biết rõ tổng số lượng đơn vị quần thể (N).</Paragraph>
                <Form layout="vertical" onFinish={calculateYamane} initialValues={{ errorMargin: 0.05 }}>
                  <Form.Item label="Kích thước tổng thể (N)" name="population" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} size="large" /></Form.Item>
                  <Form.Item label="Sai số cho phép (e)" name="errorMargin"><InputNumber step={0.01} style={{ width: '100%' }} size="large" /></Form.Item>
                  <Button type="primary" htmlType="submit" icon={<CalculatorOutlined />} block size="large">Tính toán</Button>
                </Form>
              </div>
            </Tabs.TabPane>

            {/* CÔNG THỨC 2: COCHRAN */}
            <Tabs.TabPane tab="Cochran (Vô hạn)" key="2">
              <div style={{ padding: '16px 0' }}>
                <Paragraph><Tag color="cyan">Ứng dụng:</Tag> Quần thể quá lớn hoặc chưa rõ số lượng (Điều tra diện rộng).</Paragraph>
                <Form layout="vertical" onFinish={calculateCochran} initialValues={{ zScore: 1.96, pValue: 0.5, errorMargin: 0.05 }}>
                  <Form.Item label="Giá trị Z (Độ tin cậy 95% = 1.96)" name="zScore"><InputNumber style={{ width: '100%' }} size="large" /></Form.Item>
                  <Form.Item label="Tỷ lệ ước lượng (p)" name="pValue"><InputNumber step={0.1} style={{ width: '100%' }} size="large" /></Form.Item>
                  <Form.Item label="Sai số cho phép (e)" name="errorMargin"><InputNumber step={0.01} style={{ width: '100%' }} size="large" /></Form.Item>
                  <Button type="primary" htmlType="submit" icon={<CalculatorOutlined />} block size="large">Tính toán</Button>
                </Form>
              </div>
            </Tabs.TabPane>

            {/* CÔNG THỨC 3: TABACHNICK */}
            <Tabs.TabPane tab="Tabachnick (Hồi quy)" key="3">
              <div style={{ padding: '16px 0' }}>
                <Paragraph><Tag color="purple">Ứng dụng:</Tag> Dành cho mô hình Hồi quy tuyến tính bội để đảm bảo độ nhạy thống kê.</Paragraph>
                <Form layout="vertical" onFinish={calculateTabachnick}>
                  <Form.Item label="Số lượng biến độc lập (m)" name="ivCount" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} size="large" /></Form.Item>
                  <Button type="primary" htmlType="submit" icon={<CalculatorOutlined />} block size="large">Tính toán</Button>
                </Form>
              </div>
            </Tabs.TabPane>

            {/* CÔNG THỨC 4: HAIR */}
            <Tabs.TabPane tab="Quy tắc Hair (EFA)" key="4">
              <div style={{ padding: '16px 0' }}>
                <Paragraph><Tag color="orange">Ứng dụng:</Tag> Phân tích nhân tố khám phá (EFA). Tỷ lệ vàng 5:1 giữa biến và mẫu.</Paragraph>
                <Form layout="vertical" onFinish={calculateHair}>
                  <Form.Item label="Tổng số biến quan sát (Item/Câu hỏi Likert)" name="itemCount" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} size="large" /></Form.Item>
                  <Button type="primary" htmlType="submit" icon={<CalculatorOutlined />} block size="large">Tính toán</Button>
                </Form>
              </div>
            </Tabs.TabPane>
          </Tabs>

          {result !== null && (
            <Alert
              style={{ marginTop: 24, borderRadius: 8 }}
              type="success"
              message={<Text strong>Kết quả theo {activeTab}: Mẫu tối thiểu cần là {result} phiếu hợp lệ.</Text>}
            />
          )}
        </Card>

        {/* GLOSSARY SECTION - DỰA TRÊN TÀI LIỆU CỦA SẾP */}
        <div style={{ marginTop: 40 }}>
          <Title level={4}><BookOutlined /> Từ điển giải thích thuật ngữ & Chỉ số</Title>
          <Paragraph type="secondary">Tra cứu nhanh ý nghĩa các chỉ số khi đọc kết quả từ phần mềm SPSS/AMOS</Paragraph>
          
          <Collapse ghost expandIconPosition="right" style={{ background: '#fff', borderRadius: 12, padding: '8px' }}>
            
            <Panel header={<Text strong style={{color: '#d4380d'}}><FireOutlined /> Hệ số xác định (R-Squared / R²)</Text>} key="r2">
              <Paragraph>
                <strong>Ý nghĩa:</strong> Đo lường mức độ phù hợp của mô hình hồi quy. Ví dụ R² = 0.6 có nghĩa là các biến độc lập giải thích được 60% sự biến thiên của biến phụ thuộc.
              </Paragraph>
              <Paragraph>
                <Tag color="error">Lưu ý từ tài liệu:</Tag> R² thường bị "lạm phát" khi thêm nhiều biến ngẫu nhiên. Hãy ưu tiên đọc <strong>Adjusted R-Square</strong> (R bình phương hiệu chỉnh) để có kết quả khách quan hơn, tránh hiện tượng "khớp thừa" (overfitting).
              </Paragraph>
            </Panel>

            <Panel header={<Text strong style={{color: '#096dd9'}}>Thống kê F (F-Statistic)</Text>} key="fstat">
              <Paragraph>
                <strong>Vai trò:</strong> Kiểm định tính phù hợp của toàn bộ mô hình hồi quy. 
              </Paragraph>
              <Paragraph>
                {/* Đã thay dấu > thành &gt; để tránh lỗi JSX */}
                <strong>Cách đọc:</strong> Nếu giá trị Sig. (p-value) của kiểm định F nhỏ hơn 0.05, mô hình có ý nghĩa thống kê (các biến độc lập thực sự có tác động đến biến phụ thuộc). Nếu Sig. F &gt; 0.05, mô hình bị coi là vô nghĩa.
              </Paragraph>
            </Panel>

            <Panel header={<Text strong>Mức ý nghĩa Alpha (α)</Text>} key="alpha">
              <Paragraph>
                <strong>Khái niệm:</strong> Là xác suất mắc <strong>Sai lầm Loại I</strong> (Dương tính giả) - tức là bác bỏ giả thuyết khi nó thực sự đúng.
              </Paragraph>
              <Paragraph>
                Trong nghiên cứu kinh tế - xã hội, mức Alpha mặc định thường được chọn là <strong>0.05 (5%)</strong>, tương đương với độ tin cậy của kết quả là 95%.
              </Paragraph>
            </Panel>

            <Panel header={<Text strong>Sai lầm loại II (Beta - β) & Lực kiểm định</Text>} key="beta">
              <Paragraph>
                <strong>Khái niệm:</strong> Xảy ra khi mô hình thất bại trong việc phát hiện một tác động thực sự tồn tại (Âm tính giả).
              </Paragraph>
              <Paragraph>
                <strong>Lực kiểm định (Statistical Power = 1 - β):</strong> Các nghiên cứu hiện đại thường nhắm đến lực kiểm định tối thiểu là <strong>0.80</strong>. Cỡ mẫu càng lớn thì lực kiểm định càng mạnh.
              </Paragraph>
            </Panel>

            <Panel header={<Text strong>Bậc tự do (Degrees of Freedom - df)</Text>} key="df">
              <Paragraph>
                Số lượng các giá trị có thể tự do biến thiên trong một phép tính thống kê. Trong hồi quy, df phụ thuộc vào số lượng quan sát (n) và số lượng biến độc lập (m). 
              </Paragraph>
            </Panel>

          </Collapse>
        </div>

        <div style={{ textAlign: 'center', marginTop: 48, paddingBottom: 24 }}>
          <Text type="secondary" italic>Hệ thống hỗ trợ Nghiên cứu khoa học - Phiên bản v2.0</Text>
        </div>
      </div>
    </div>
  );
};

export default SampleCalculator;