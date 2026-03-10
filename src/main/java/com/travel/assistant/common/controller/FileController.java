package com.travel.assistant.common.controller;

import com.travel.assistant.common.result.Result;
import com.travel.assistant.common.service.FileStorageService;
import com.travel.assistant.modules.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

/**
 * 文件上传控制器
 */
@Tag(name = "文件接口", description = "文件上传相关接口")
@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {

    private final FileStorageService fileStorageService;
    private final UserService userService;

    /**
     * 上传头像
     */
    @PostMapping("/avatar")
    @Operation(summary = "上传头像", description = "上传用户头像图片")
    public Result<Map<String, String>> uploadAvatar(@RequestParam("file") MultipartFile file) {
        // 存储头像
        String avatarUrl = fileStorageService.storeAvatar(file);
        
        // 更新用户头像
        userService.updateAvatar(avatarUrl);

        Map<String, String> result = new HashMap<>();
        result.put("url", avatarUrl);
        return Result.success(result);
    }

    /**
     * 上传文件
     */
    @PostMapping("/upload")
    @Operation(summary = "上传文件", description = "通用文件上传接口")
    public Result<Map<String, String>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "directory", defaultValue = "files") String directory) {
        String fileUrl = fileStorageService.store(file, directory);

        Map<String, String> result = new HashMap<>();
        result.put("url", fileUrl);
        return Result.success(result);
    }
}