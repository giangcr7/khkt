from flask import Flask, request, jsonify
import json
import pickle
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.sequence import pad_sequences
from pyvi import ViTokenizer
import random
import os

# Tắt cảnh báo của TensorFlow cho Terminal gọn gàng
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

app = Flask(__name__)

# --- 1. TẢI CÁC FILE ĐÃ HUẤN LUYỆN LÊN BỘ NHỚ ---
print("Đang tải mô hình AI... Vui lòng đợi...")
model = load_model('chatbot_nckh_model.h5')

with open('tokenizer.pkl', 'rb') as f:
    tokenizer = pickle.load(f)

with open('label_encoder.pkl', 'rb') as f:
    le = pickle.load(f)

with open('nckh_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)
print("✅ Tải mô hình thành công! AI đã sẵn sàng.")

# --- 2. HÀM XỬ LÝ CÂU HỎI ---
@app.route('/api/chat', methods=['POST'])
def chat():
    # Nhận tin nhắn từ NestJS gửi sang
    req_data = request.get_json()
    user_message = req_data.get('message', '')
    
    if not user_message:
        return jsonify({'reply': 'Bạn chưa nhập nội dung.'})

    # Toàn bộ khối try phải lùi vào trong so với def chat()
    try:
        # 1. In thường câu hỏi
        text_lower = user_message.lower()
        
        # 2. Tokenize
        tokens = ViTokenizer.tokenize(text_lower)
        
        # 3. Chuyển thành số
        seq = tokenizer.texts_to_sequences([tokens])
        
        # 4. CHỖ NÀY QUAN TRỌNG NHẤT: Bắt buộc phải có 'post'
        padded = pad_sequences(seq, maxlen=30, padding='post', truncating='post')

        # 5. Dự đoán
        pred = model.predict(padded, verbose=0) # verbose=0 để đỡ in log loằng ngoằng
        tag = le.inverse_transform([np.argmax(pred)])[0]
        prob = np.max(pred)
        
        # In ra terminal để theo dõi xem AI có đang đoán đúng tủ không
        print(f"👉 Câu hỏi: {user_message}")
        print(f"🤖 AI đoán Tag: {tag} | Độ tự tin: {prob:.2f}")

        # Nếu độ tự tin dưới 50% -> Báo không hiểu
        if prob < 0.5:
            return jsonify({'reply': 'Xin lỗi, mình chưa hiểu ý bạn lắm. Bạn có thể nói rõ hơn về vấn đề NCKH bạn đang quan tâm không?'})

        # Tìm câu trả lời ngẫu nhiên trong JSON
        for intent in data['intents']:
            if intent['tag'] == tag:
                reply = random.choice(intent['responses'])
                return jsonify({'reply': reply})
                
    except Exception as e:
        print("Lỗi trong quá trình AI suy nghĩ:", e)
        return jsonify({'reply': 'Hệ thống AI đang gặp sự cố nhỏ, bạn thử lại sau nhé!'})

# --- 3. KHỞI CHẠY SERVER ---
if __name__ == '__main__':
    # Chạy trên http://127.0.0.1:5000
    app.run(host='0.0.0.0', port=5000, debug=True)