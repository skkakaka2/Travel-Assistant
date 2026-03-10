package com.travel.assistant.common.service.impl;

import com.travel.assistant.common.config.LocalStorageConfig;
import com.travel.assistant.common.enums.ErrorCode;
import com.travel.assistant.common.exception.BusinessException;
import com.travel.assistant.common.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

/**
 * 本地文件存储服务实现类
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class LocalFileStorageServiceImpl implements FileStorageService {

    private final LocalStorageConfig localStorageConfig;

    @Value("${app.storage.max-size:10485760}")
    private long maxSize;

    /**
     * 允许的图片类型
     */
    private static final List<String> ALLOWED_IMAGE_TYPES = Arrays.asList(
            "image/jpeg", "image/png", "image/gif", "image/webp"
    );

    @Override
    public String store(MultipartFile file, String directory) {
        // 验证文件
        validateFile(file);

        // 生成文件名
        String originalFilename = file.getOriginalFilename();
        String extension = getFileExtension(originalFilename);
        String newFilename = UUID.randomUUID().toString() + extension;

        // 构建存储路径：uploads/directory/2024-01-01/filename.jpg
        String dateDir = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        Path targetDir = localStorageConfig.getStoragePath()
                .resolve(directory)
                .resolve(dateDir);

        try {
            // 创建目录
            Files.createDirectories(targetDir);

            // 保存文件
            Path targetPath = targetDir.resolve(newFilename);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            log.info("文件保存成功: {}", targetPath);

            // 返回访问URL
            return localStorageConfig.getUrlPrefix() + directory + "/" + dateDir + "/" + newFilename;
        } catch (IOException e) {
            log.error("文件保存失败", e);
            throw new BusinessException(ErrorCode.FILE_UPLOAD_ERROR, "文件上传失败");
        }
    }

    @Override
    public String storeAvatar(MultipartFile file) {
        // 验证是否为图片
        if (!ALLOWED_IMAGE_TYPES.contains(file.getContentType())) {
            throw new BusinessException(ErrorCode.FILE_TYPE_ERROR, "只支持 jpg、png、gif、webp 格式的图片");
        }
        return store(file, "avatars");
    }

    @Override
    public void delete(String fileUrl) {
        if (fileUrl == null || fileUrl.isEmpty()) {
            return;
        }

        // 从URL提取文件路径
        String urlPrefix = localStorageConfig.getUrlPrefix();
        if (!fileUrl.startsWith(urlPrefix)) {
            return;
        }

        String relativePath = fileUrl.substring(urlPrefix.length());
        Path filePath = localStorageConfig.getStoragePath().resolve(relativePath);

        try {
            Files.deleteIfExists(filePath);
            log.info("删除文件: {}", filePath);
        } catch (IOException e) {
            log.warn("删除文件失败: {}", filePath, e);
        }
    }

    /**
     * 验证文件
     */
    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException(ErrorCode.FILE_EMPTY);
        }

        if (file.getSize() > maxSize) {
            throw new BusinessException(ErrorCode.FILE_TOO_LARGE, 
                    "文件大小超过限制，最大允许 " + (maxSize / 1024 / 1024) + "MB");
        }
    }

    /**
     * 获取文件扩展名
     */
    private String getFileExtension(String filename) {
        if (filename == null || filename.isEmpty()) {
            return "";
        }
        int dotIndex = filename.lastIndexOf('.');
        if (dotIndex > 0) {
            return filename.substring(dotIndex);
        }
        return "";
    }
}