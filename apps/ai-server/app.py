import os
from google import genai
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from flask_cors import CORS

# --- 1. LOAD BIẾN MÔI TRƯỜNG ---
load_dotenv()

app = Flask(__name__)
CORS(app) # Cho phép NestJS gọi vào

# --- 2. CẤU HÌNH GEMINI CLIENT MỚI ---
GENAI_API_KEY = os.getenv("GENAI_API_KEY") 

if not GENAI_API_KEY:
    raise ValueError("LỖI: Chưa tìm thấy GENAI_API_KEY trong biến môi trường!")

# Khởi tạo Client theo chuẩn SDK mới nhất
client = genai.Client(api_key=GENAI_API_KEY)

# --- 3. NỘI DUNG TÀI LIỆU NCKH TLU ---
# Đây là nội dung từ tài liệu Cô Xuân [cite: 1]
DOCUMENT_CONTEXT = """
* Nhóm câu hỏi thường gặp về NCKH:
Câu 1. NCKH sinh viên là gì?
Nghiên cứu khoa học sinh viên (NCKH SV) là hoạt động học thuật mà trong đó, sinh viên (cá nhân hoặc nhóm) vận dụng các kiến thức đã học và phương pháp luận khoa học để tiến hành tìm tòi, khám phá, thử nghiệm hoặc giải quyết một vấn đề cụ thể trong chuyên ngành học hoặc trong thực tiễn xã hội.
Quá trình này thường được thực hiện dưới sự hướng dẫn trực tiếp của một giảng viên có chuyên môn. Kết quả của nghiên cứu thường được trình bày dưới dạng báo cáo khoa học, bài báo, mô hình, hoặc sản phẩm ứng dụng.
Câu 2. Tham gia NCKH có bắt buộc không?
Theo quy định về hoạt động nghiên cứu khoa học sinh viên của Trường Đại học Thủy Lợi (Quyết định 3784/QĐ-ĐHTL năm 2023), việc tham gia NCKH không phải là hoạt động bắt buộc đối với sinh viên. Tuy nhiên, nhà trường luôn khuyến khích sinh viên tích cực tham gia nghiên cứu khoa học nhằm phát triển tư duy nghiên cứu, nâng cao kiến thức chuyên môn và rèn luyện các kỹ năng học thuật; qua đó giúp sinh viên gắn kết lý luận với thực tiễn, đồng thời nâng cao kỹ năng viết và trình bày học thuật.
Câu 3. Một đề tài NCKH tối đa bao nhiêu thành viên?
Mỗi đề tài NCKH sinh viên không quá 05 sinh viên tham gia, trong đó phải có 01 sinh viên chịu trách nhiệm chính và 01 hoặc 2 giảng viên hướng dẫn (Theo điều 6, mục 1b Xác định danh mục đề tài, giao đề tài và triển khai thực hiện đề tài nghiên cứu khoa học của sinh viên, Số 3784/ QĐ-ĐHTL)
Câu 4. Sinh viên năm nhất có được tham gia NCKH không?
Tất cả sinh viên đang học tại trường đều có thể tham gia hoạt động NCKH nếu có nhu cầu và được giảng viên hướng dẫn đồng ý. Vì vậy, sinh viên năm nhất hoàn toàn có thể tham gia nghiên cứu khoa học, tuy nhiên do chưa có nhiều kiến thức chuyên ngành và kinh nghiệm nghiên cứu, sinh viên năm nhất thường tham gia với vai trò thành viên trong nhóm để học hỏi và tích lũy kinh nghiệm
(Điều 2 – Quyết định 3784/QĐ-ĐHTL về hoạt động nghiên cứu khoa học sinh viên của Trường Đại học Thủy Lợi)
Câu 5. Làm NCKH có lợi ích gì cho sinh viên?
Tham gia nghiên cứu khoa học (NCKH) mang lại nhiều lợi ích thiết thực cho sinh viên:
(1) Nâng cao giá trị hồ sơ cá nhân (CV)
Hoạt động NCKH giúp sinh viên thể hiện khả năng tư duy logic, phân tích và giải quyết vấn đề thực tế, từ đó tạo ấn tượng tốt với nhà tuyển dụng.
(2) Hỗ trợ định hướng học thuật
NCKH là bước đệm quan trọng để sinh viên thực hiện khóa luận tốt nghiệp hoặc tiếp tục theo đuổi các bậc học cao hơn như Thạc sĩ, Tiến sĩ trong tương lai.
(3) Phát triển kỹ năng toàn diện
Thông qua quá trình thực hiện đề tài, sinh viên được rèn luyện nhiều kỹ năng quan trọng như làm việc nhóm, thuyết trình, phân tích dữ liệu và viết báo cáo khoa học.
(4). Quyền lợi theo quy định của nhà trường
Theo khoản 2, Điều 10, Quyết định 3784/QĐ-ĐHTL của Trường Đại học Thủy Lợi, sinh viên tham gia NCKH còn có thể được:
•	Hỗ trợ kinh phí thực hiện đề tài và chi phí phục vụ nghiên cứu
•	Nhận giấy chứng nhận, giải thưởng NCKH cấp khoa hoặc cấp trường
•	Được ghi nhận thành tích trong hồ sơ học tập và cộng điểm rèn luyện
•	Sinh viên được nhà trường khen thưởng, trao giấy khen và tiền thưởng theo quy định
•	Đề tài được giải nhất cấp Phân hiệu sẽ được tham gia báo cáo cấp Trường Đại học Thủy lợi
* Nhóm câu hỏi định hướng lựa chọn đề tài NCKH:
Câu 1. Làm sao để chọn được đề tài NCKH phù hợp?
Để chọn được đề tài NCKH phù hợp, sinh viên nên ưu tiên những vấn đề:
•	Liên quan đến chuyên ngành đang học
•	Có nguồn tài liệu tham khảo
•	Có khả năng thu thập dữ liệu thực tế
•	Có tính mới và tính ứng dụng
Ngoài ra, sinh viên nên trao đổi với giảng viên hướng dẫn để xác định phạm vi nghiên cứu phù hợp
Câu 2. làm sao để tìm ý tưởng đề tài NCKH khi chưa có định hướng rõ ràng?
Sinh viên có thể tìm ý tưởng đề tài bằng cách:
•	Đọc các bài báo khoa học và tham khảo các đề tài nghiên cứu khoa học đã thực hiện trước đó.
•	Quan sát, phát hiện những vấn đề thực tiễn phát sinh trong lĩnh vực ngành học.
•	Tham khảo ý kiến, gợi ý định hướng từ giảng viên hướng dẫn.
•	Tìm kiếm và tra cứu tài liệu trên các nguồn học thuật như Google Scholar
Câu 3. Nếu đề tài ban đầu quá khó thì có thể thay đổi trong quá trình nghiên cứu không?
Quy định về hoạt động NCKH sinh viên của Trường Đại học Thủy Lợi không nêu rõ việc thay đổi đề tài trong quá trình nghiên cứu. Tuy nhiên, theo Điều 6 của quy định này, đề tài NCKH được thực hiện dưới sự hướng dẫn của giảng viên và sinh viên phải báo cáo tiến độ với đơn vị chuyên môn. Vì vậy, nếu đề tài quá khó hoặc cần điều chỉnh phạm vi nghiên cứu, sinh viên nên trao đổi với giảng viên hướng dẫn để được xem xét và điều chỉnh phù hợp. 
Câu 4. Có thể tham khảo đề tài của các anh chị khóa trước không?
Sinh viên hoàn toàn có thể tham khảo các đề tài nghiên cứu khoa học của các khóa trước để hiểu cách xây dựng đề tài, phương pháp nghiên cứu và cách trình bày báo cáo. Tuy nhiên, theo Điều 10 của Quy định về hoạt động NCKH sinh viên của Trường Đại học Thủy Lợi, sinh viên phải đảm bảo tính trung thực trong nghiên cứu và không sao chép nội dung của các công trình trước đó.
Câu 5. Một đề tài NCKH sinh viên nên giới hạn phạm vi nghiên cứu như thế nào?
Quy định NCKH sinh viên của Trường Đại học Thủy Lợi không nêu cụ thể cách giới hạn phạm vi nghiên cứu. Tuy nhiên, theo Điều 6 của quy định, đề tài NCKH được thực hiện dưới sự hướng dẫn của giảng viên và có kế hoạch triển khai cụ thể. Vì vậy, sinh viên nên trao đổi với giảng viên hướng dẫn để xác định phạm vi nghiên cứu phù hợp và khả thi
Câu 6. "Làm sao để biết đề tài của em có tính sáng tạo và ứng dụng thực tế?"
 	Theo Điều 1 của Quy định NCKH sinh viên Trường Đại học Thủy Lợi, hoạt động nghiên cứu khoa học nhằm phát huy tính sáng tạo và tạo ra các sản phẩm khoa học mới. Vì vậy, một đề tài được xem là có tính sáng tạo và ứng dụng khi nó giải quyết một vấn đề mới hoặc đề xuất giải pháp có thể áp dụng trong thực tế.
* Nhóm câu hỏi về quy trình thực hiện đề tài NCKH 
Câu 1. Nên bắt đầu đề tài nghiên cứu khoa học từ bước nào đầu tiên?
Bước đầu tiên là xác định ý tưởng và lựa chọn đề tài nghiên cứu phù hợp với lĩnh vực học tập và khả năng của sinh viên. Sau đó, sinh viên cần tìm hiểu tổng quan tài liệu liên quan để xác định mục tiêu, phạm vi và hướng nghiên cứu của đề tài.
 Tiếp theo: Theo Điều 6 của Quy định NCKH sinh viên Trường Đại học Thủy Lợi, bước đầu tiên khi thực hiện một đề tài nghiên cứu khoa học là xác định và đăng ký đề tài nghiên cứu với giảng viên hướng dẫn và đơn vị chuyên môn của khoa.
Câu 2. Một đề tài NCKH thường trải qua những giai đoạn nào?
(Theo Điều 6, Điều 7 và Điều 8 của Quyết định số 3784/QĐ-ĐHTL năm 2023), quá trình thực hiện một đề tài nghiên cứu khoa học của sinh viên thường trải qua các giai đoạn chính sau:
(1)	Đăng ký và giao đề tài: Sinh viên đăng ký đề tài nghiên cứu; sau khi được khoa hoặc nhà trường xét duyệt, đề tài được giao cho sinh viên thực hiện.
(2)	Triển khai thực hiện đề tài: Sinh viên tiến hành nghiên cứu dưới sự hướng dẫn của giảng viên, bao gồm xây dựng kế hoạch nghiên cứu, thu thập và xử lý tài liệu, đồng thời báo cáo tiến độ thực hiện theo quy định.
(3)	Hoàn thiện báo cáo tổng kết: Sau khi kết thúc quá trình nghiên cứu, sinh viên hoàn thiện báo cáo tổng kết đề tài và các sản phẩm nghiên cứu liên quan.
(4)	Đánh giá và nghiệm thu đề tài: Đề tài được hội đồng chuyên môn tổ chức đánh giá và nghiệm thu ở cấp khoa hoặc cấp trường theo quy định.
Câu 3. Các bước cơ bản để thực hiện một đề tài nghiên cứu khoa học là gì?
Quy trình thực hiện đề tài NCKH thường gồm các bước:
(1)	Lựa chọn đề tài nghiên cứu;
(2)	 Xây dựng đề cương nghiên cứu;
(3)	 Thu thập và xử lý tài liệu, dữ liệu;
(4)	Phân tích, đánh giá kết quả nghiên cứu;
(5)	 Viết báo cáo tổng kết đề tài và hoàn thiện sản phẩm nghiên cứu.
Câu 4. Làm sao để xây dựng đề cương nghiên cứu khoa học?
Theo Quy định về hoạt động NCKH sinh viên của Trường Đại học Thủy Lợi (Quyết định 3784/QĐ-ĐHTL năm 2023), sau khi đề tài được đăng ký và giao thực hiện, sinh viên cần xây dựng kế hoạch và nội dung nghiên cứu dưới sự hướng dẫn của giảng viên để triển khai đề tài. Vì vậy, việc xây dựng đề cương nghiên cứu cần được thực hiện thông qua trao đổi và hướng dẫn của giảng viên phụ trách đề tài.
Câu 5. Khi thực hiện đề tài nghiên cứu khoa học, sinh viên cần lưu ý những vấn đề gì?
Sinh viên cần bảo đảm tính trung thực trong nghiên cứu, tránh sao chép tài liệu, tuân thủ quy định về trích dẫn và tài liệu tham khảo, đồng thời thường xuyên trao đổi với giảng viên hướng dẫn để kịp thời điều chỉnh và hoàn thiện đề tài.
* Nhóm câu hỏi về cách viết báo cáo và bảo vệ đề tài: 
Câu 1. Cấu trúc của một bài NCKH gồm những phần nào?
Báo cáo nghiên cứu cần được trình bày logic, rõ ràng, tuân thủ cấu trúc khoa học. Thông thường, một bài nghiên cứu khoa học sinh viên sẽ gồm các phần chính sau:
(1)	Phần mở đầu
Trình bày lý do chọn đề tài, mục tiêu nghiên cứu và ý nghĩa của đề tài.
(2)	Tổng quan nghiên cứu (cơ sở lý thuyết)
Tổng hợp các nghiên cứu trước đây và các lý thuyết liên quan đến đề tài.
(3)	 Phương pháp nghiên cứu
Trình bày các phương pháp được sử dụng để thu thập và phân tích dữ liệu.
(4)	Kết quả nghiên cứu và thảo luận
Trình bày kết quả thu được và phân tích, đánh giá các kết quả đó.
(5)	Kết luận và kiến nghị
Tóm tắt những kết quả chính của nghiên cứu và đề xuất hướng phát triển hoặc giải pháp.
(6)	Tài liệu tham khảo
Liệt kê các tài liệu đã sử dụng trong quá trình nghiên cứu.

Câu 2. Làm sao để viết phần mở đầu của bài NCKH rõ ràng và thuyết phục?
Để viết phần mở đầu rõ ràng và thuyết phục, sinh viên nên trình bày: lý do chọn đề tài, mục tiêu nghiên cứu, câu hỏi nghiên cứu, đối tượng và phạm vi nghiên cứu, ý nghĩa của đề tài. Phần mở đầu cần ngắn gọn, tập trung vào vấn đề nghiên cứu chính.
Câu 3. Sinh viên cần thu thập và xử lý tài liệu phục vụ nghiên cứu bằng những phương pháp nào? Làm sao để trích dẫn tài liệu đúng chuẩn?
 	Sinh viên có thể thu thập tài liệu từ sách chuyên khảo, bài báo khoa học, văn bản pháp luật, báo cáo nghiên cứu và các cơ sở dữ liệu học thuật. Sau khi thu thập, cần tiến hành phân loại, tổng hợp, phân tích và đánh giá thông tin để phục vụ cho nội dung nghiên cứu.
Để trích dẫn tài liệu đúng chuẩn, sinh viên cần ghi rõ nguồn khi sử dụng thông tin, áp dụng một chuẩn trích dẫn thống nhất (như APA hoặc IEEE), trích dẫn trong nội dung bài viết và liệt kê đầy đủ trong phần tài liệu tham khảo. Điều này giúp tránh đạo văn và nâng cao tính học thuật của bài nghiên cứu.
Câu 4. Quy trình chuẩn bị cho buổi bảo vệ đề tài gồm những bước nào?
Theo Quy định về hoạt động NCKH sinh viên của Trường Đại học Thủy Lợi (Quyết định 3784/QĐ-ĐHTL năm 2023), sau khi hoàn thành quá trình nghiên cứu, đề tài sẽ được đánh giá và nghiệm thu tại khoa hoặc cấp trường. Vì vậy, trước khi bảo vệ đề tài, sinh viên cần thực hiện một số bước chuẩn bị sau:
(1)	Hoàn thiện báo cáo tổng kết đề tài NCKH theo yêu cầu của đơn vị chuyên môn.
(2)	Nộp báo cáo và hồ sơ đề tài để được xem xét đưa vào đánh giá tại cấp khoa hoặc cấp trường.
(3)	Chuẩn bị bài thuyết trình (slide) tóm tắt các nội dung chính của đề tài như mục tiêu, phương pháp nghiên cứu, kết quả và kết luận.
(4)	Tham gia buổi đánh giá và trình bày kết quả nghiên cứu trước hội đồng khoa học theo kế hoạch của khoa hoặc nhà trường.
Câu 5. Làm sao để trả lời câu hỏi phản biện của giám khảo một cách thuyết phục?
Để trả lời câu hỏi phản biện một cách thuyết phục, sinh viên nên:
(1)	Lắng nghe kỹ câu hỏi của giám khảo
Hiểu rõ nội dung câu hỏi trước khi trả lời để tránh trả lời sai trọng tâm.
(2)	Trả lời ngắn gọn và đúng trọng tâm
Tập trung vào vấn đề chính và giải thích dựa trên kết quả nghiên cứu của đề tài.
(3)	 Dựa vào số liệu và kết quả nghiên cứu
Sử dụng các kết quả, bảng số liệu hoặc phân tích trong đề tài để minh chứng cho câu trả lời.
(4)	 Giữ thái độ bình tĩnh và tự tin
Trình bày rõ ràng, tránh tranh luận cảm tính với hội đồng.
(5)	 Thừa nhận hạn chế nếu cần thiết
Nếu câu hỏi liên quan đến hạn chế của đề tài, sinh viên có thể thừa nhận và đề xuất hướng nghiên cứu tiếp theo.
"""

# --- 4. SYSTEM PROMPT ---
SYSTEM_INSTRUCTION = f"""
Bạn là trợ lý ảo của hệ thống Quản lý NCKH - Đại học Thủy Lợi (TLU).
Nhiệm vụ: Giải đáp thắc mắc dựa trên tài liệu cung cấp.
Ràng buộc:
1. CHỈ sử dụng thông tin trong <TÀI LIỆU>.
2. Nếu không có thông tin, hãy trả lời: "Xin lỗi, thông tin này hiện chưa có trong cơ sở dữ liệu của mình. Bạn vui lòng liên hệ Giảng viên hướng dẫn hoặc phòng Khoa học Công nghệ nhé!"
3. Trả lời ngắn gọn, thân thiện.

<TÀI LIỆU>
{DOCUMENT_CONTEXT}
</TÀI LIỆU>
"""

# --- 5. ROUTES ---
@app.route('/', methods=['GET'])
def health_check():
    return "AI Server (New SDK) is Running!", 200

@app.route('/api/chat', methods=['POST'])
def chat():
    req_data = request.get_json()
    user_message = req_data.get('message', '')

    if not user_message:
        return jsonify({'reply': 'Bạn chưa nhập nội dung.'})

    try:
        # Đã đổi sang gemini-2.0-flash (Mới nhất, thông minh nhất)
        response = client.models.generate_content(
            model='gemini-2.0-flash', 
            contents=f"{SYSTEM_INSTRUCTION}\n\nCâu hỏi sinh viên: {user_message}"
        )
        
        reply = response.text

        print(f"👉 Q: {user_message} | 🤖 A: {reply[:50]}...") 
        return jsonify({'reply': reply})

    except Exception as e:
        print(f"🔥 Lỗi Gemini SDK Mới: {str(e)}")
        return jsonify({'reply': 'Hệ thống AI đang bận, bạn thử lại sau nhé!'})

if __name__ == '__main__':
    # Render yêu cầu lấy Port từ môi trường
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)