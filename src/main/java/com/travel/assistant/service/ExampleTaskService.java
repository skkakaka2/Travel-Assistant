package com.travel.assistant.service;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.stereotype.Service;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Future;

@Service
public class ExampleTaskService {
    
    private final ExecutorService businessThreadPool;
    private final ThreadPoolTaskExecutor springThreadPool;
    
    public ExampleTaskService(
            @Qualifier("businessThreadPool") ExecutorService businessThreadPool,
            @Qualifier("springThreadPool") ThreadPoolTaskExecutor springThreadPool) {
        this.businessThreadPool = businessThreadPool;
        this.springThreadPool = springThreadPool;
    }
    
    /**
     * 使用自定义线程池执行异步任务
     */
    public void executeAsyncTask() {
        businessThreadPool.submit(() -> {
            try {
                // 模拟业务处理
                System.out.println("业务线程池执行任务: " + Thread.currentThread().getName());
                Thread.sleep(2000);
                System.out.println("业务任务完成");
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                System.err.println("任务被中断");
            }
        });
    }
    
    /**
     * 使用Spring线程池执行异步任务并获取结果
     */
    public Future<String> executeTaskWithResult() {
        return springThreadPool.submit(() -> {
            System.out.println("Spring线程池执行任务: " + Thread.currentThread().getName());
            Thread.sleep(1000);
            return "任务执行成功";
        });
    }
    
    /**
     * 执行IO密集型任务
     */
    public void executeIoTask() {
        // 这里可以注入ioThreadPool来执行IO密集型任务
        System.out.println("IO密集型任务示例");
    }
}