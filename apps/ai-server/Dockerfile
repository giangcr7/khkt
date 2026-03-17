# Dùng bản Python 3.12 y hệt như trên máy tính của bạn
FROM python:3.12-slim

# Đặt thư mục làm việc
WORKDIR /app

# Copy file requirements.txt vào trước để cài thư viện
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy toàn bộ code và mô hình của bạn vào
COPY . .

# Hugging Face bắt buộc ứng dụng phải chạy ở cổng 7860
EXPOSE 7860

# Lệnh khởi chạy Server AI
CMD ["gunicorn", "app:app", "--bind", "0.0.0.0:7860", "--workers", "1", "--threads", "2", "--timeout", "120"]