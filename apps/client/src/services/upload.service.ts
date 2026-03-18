import api from './api';

export const uploadService = {
  /**
   * @param file File từ máy tính (originFileObj của Ant Design)
   * @param folder Thư mục đích (posts, users, events)
   */
  uploadFile: async (file: File, folder: string): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file); 

    // Gửi kèm tham số folder qua query string
    const response = await api.post(`/upload?folder=${folder}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data', 
      },
    });

    return response.data.url; 
  },
};