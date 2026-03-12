package com.travel.assistant.common.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

@Configuration
public class ThreadPoolConfig {

    /**
     * 创建通用业务线程池
     */
    @Bean("businessThreadPool")
    public ExecutorService businessThreadPool() {
        ThreadPoolExecutor executor = new ThreadPoolExecutor(
            10,                           // 核心线程数：CPU核心数 * 2
            20,                           // 最大线程数：核心线程数的2倍
            60L,                          // 空闲线程存活时间：60秒
            TimeUnit.SECONDS,             // 时间单位
            new LinkedBlockingQueue<>(100), // 有界队列，防止内存溢出
            new CustomThreadFactory("business-pool"), // 自定义线程工厂
            new ThreadPoolExecutor.CallerRunsPolicy() // 调用者运行策略
        );
        
        // 允许核心线程超时回收（可选）
        executor.allowCoreThreadTimeOut(true);
        return executor;
    }

    /**
     * 创建IO密集型线程池（适用于网络请求、文件读写等）
     */
    @Bean("ioThreadPool")
    public ExecutorService ioThreadPool() {
        ThreadPoolExecutor executor = new ThreadPoolExecutor(
            20,                           // IO密集型任务可以设置更多线程
            50,                           // 最大线程数更高
            30L,                          // 空闲时间较短
            TimeUnit.SECONDS,
            new ArrayBlockingQueue<>(200), // 有界队列
            new CustomThreadFactory("io-pool"),
            new ThreadPoolExecutor.AbortPolicy() // 抛出异常策略
        );
        return executor;
    }

    /**
     * 创建CPU密集型线程池（适用于计算密集型任务）
     */
    @Bean("cpuThreadPool")
    public ExecutorService cpuThreadPool() {
        int cpuCores = Runtime.getRuntime().availableProcessors();
        ThreadPoolExecutor executor = new ThreadPoolExecutor(
            cpuCores,                     // CPU密集型任务线程数 ≈ CPU核心数
            cpuCores + 1,                 // 最大线程数略高于核心数
            120L,                         // 空闲时间较长
            TimeUnit.SECONDS,
            new LinkedBlockingQueue<>(50),
            new CustomThreadFactory("cpu-pool"),
            new ThreadPoolExecutor.DiscardPolicy() // 丢弃策略
        );
        return executor;
    }

    /**
     * 使用Spring的ThreadPoolTaskExecutor（推荐用于Spring项目）
     */
    @Bean("springThreadPool")
    public ThreadPoolTaskExecutor springThreadPool() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(10);
        executor.setMaxPoolSize(20);
        executor.setQueueCapacity(100);
        executor.setKeepAliveSeconds(60);
        executor.setThreadNamePrefix("spring-task-");
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.initialize();
        return executor;
    }

    /**
     * 自定义线程工厂，便于线程命名和监控
     */
    public static class CustomThreadFactory implements ThreadFactory {
        private final String namePrefix;
        private final AtomicInteger threadNumber = new AtomicInteger(1);

        public CustomThreadFactory(String namePrefix) {
            this.namePrefix = namePrefix;
        }

        @Override
        public Thread newThread(Runnable r) {
            Thread thread = new Thread(r, namePrefix + "-thread-" + threadNumber.getAndIncrement());
            thread.setDaemon(false); // 非守护线程
            thread.setPriority(Thread.NORM_PRIORITY); // 正常优先级
            return thread;
        }
    }
}