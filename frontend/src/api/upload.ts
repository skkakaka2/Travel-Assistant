import axios from "@/utils/request";

export const uploadApi = {
  /**
   * 上传图片到指定的 item
   * @param itemId - 关联的 DayPlanItem ID
   * @param file - 要上传的文件
   */
  uploadImage(itemId: number, file: File) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("itemId", String(itemId));

    return axios.post("/upload-file/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  /**
   * 批量上传图片
   * @param itemId - 关联的 DayPlanItem ID
   * @param files - 要上传的文件列表
   */
  async uploadImages(itemId: number, files: File[]) {
    const results = [];
    for (const file of files) {
      const result = await this.uploadImage(itemId, file);
      results.push(result);
    }
    return results;
  },

  /**
   * 删除图片
   * @param itemId - 关联的 DayPlanItem ID
   * @param filepath - 图片路径
   */
  deleteImage(itemId: number, filepath: string) {
    return axios.delete("/upload-file/delete", {
      data: { itemId, filepath },
    });
  },

  getImage(filepath: string) {
    return axios.post("/upload-file/get", { path: filepath });
  },
};
