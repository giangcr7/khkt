import api from './api';

export const uploadService = {
  /**
   * @param file File từ máy tính (originFileObj của Ant Design)
   * @param folder Thư mục đích (posts, users, events)
   */
  uploadFile: async (file: File, folder: string): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file); // 'file' phải khớp với FileInterceptor ở Backend

    // Gửi kèm tham số folder qua query string
    const response = await api.post(`/upload?folder=${folder}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // Ghi đè header mặc định để gửi file
      },
    });

    return response.data.url; // Trả về duy nhất chuỗi URL
  },
};