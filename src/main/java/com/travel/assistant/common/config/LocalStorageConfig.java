package com.travel.assistant.common.config;

import com.travel.assistant.common.exception.BusinessException;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * 本地存储配置
 * 
 * 配置文件上传目录和静态资源访问
 */
@Slf4j
@Configuration
public class LocalStorageConfig implements WebMvcConfigurer {

    @Value("${app.storage.location:./uploads}")
    private String storageLocation;

    @Value("${app.storage.url-prefix:/uploads/}")
    private String urlPrefix;

    /**
     * 初始化存储目录
     */
    @PostConstruct
    public void init() {
        try {
            Path path = Paths.get(storageLocation);
            if (!Files.exists(path)) {
                Files.createDirectories(path);
                log.info("创建文件存储目录: {}", path.toAbsolutePath());
            }
        } catch (IOException e) {
            log.error("创建文件存储目录失败", e);
            throw new RuntimeException("无法创建文件存储目录", e);
        }
    }

    /**
     * 配置静态资源访问
     * 
     * 访问 /uploads/** 时映射到本地文件目录
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path path = Paths.get(storageLocation).toAbsolutePath().normalize();
        registry.addResourceHandler(urlPrefix + "**")
                .addResourceLocations("file:" + path + "/");
        log.info("配置静态资源映射: {} -> {}", urlPrefix, path);
    }

    /**
     * 获取存储路径
     */
    public Path getStoragePath() {
        return Paths.get(storageLocation).toAbsolutePath().normalize();
    }

    /**
     * 获取 URL 前缀
     */
    public String getUrlPrefix() {
        return urlPrefix;
    }
}