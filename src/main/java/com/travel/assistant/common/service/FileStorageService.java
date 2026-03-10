package com.travel.assistant.common.service;

import org.springframework.web.multipart.MultipartFile;

/**
 * 文件存储服务接口
 */
public interface FileStorageService {

    /**
     * 存储文件
     * @param file 文件
     * @param directory 子目录
     * @return 文件访问URL
     */
    String store(MultipartFile file, String directory);

    /**
     * 存储头像
     * @param file 头像文件
     * @return 头像URL
     */
    String storeAvatar(MultipartFile file);

    /**
     * 删除文件
     * @param fileUrl 文件URL
     */
    void delete(String fileUrl);
}