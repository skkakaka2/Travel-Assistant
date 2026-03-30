# 数据库初始化脚本
-- 创建数据库
CREATE DATABASE IF NOT EXISTS travel_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- 使用数据库
USE travel_db;
-- ==================== 用户表 ====================
CREATE TABLE IF NOT EXISTS t_user (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(255) NOT NULL COMMENT '密码（加密存储）',
    nickname VARCHAR(50) COMMENT '昵称',
    avatar VARCHAR(255) COMMENT '头像URL',
    phone VARCHAR(20) COMMENT '手机号',
    email VARCHAR(100) COMMENT '邮箱',
    status TINYINT DEFAULT 1 COMMENT '状态：0禁用 1正常',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记：0正常 1已删除',
    INDEX idx_username (username),
    INDEX idx_phone (phone)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '用户表';
-- ==================== 家庭位置表 ====================
CREATE TABLE IF NOT EXISTS t_home_location (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '位置ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    name VARCHAR(100) COMMENT '位置名称',
    address VARCHAR(255) COMMENT '详细地址',
    longitude DECIMAL(10, 7) COMMENT '经度',
    latitude DECIMAL(10, 7) COMMENT '纬度',
    is_default TINYINT DEFAULT 0 COMMENT '是否默认：0否 1是',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_user_id (user_id),
    FOREIGN KEY (user_id) REFERENCES t_user(id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '家庭位置表';
-- ==================== 车辆表 ====================
CREATE TABLE IF NOT EXISTS t_vehicle (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '车辆ID',
    model VARCHAR(100) NOT NULL COMMENT '车辆型号',
    fuel_consumption DECIMAL(5, 2) COMMENT '百公里油耗(L)',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记'
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '车辆表';
-- ==================== 用户车辆绑定表 ====================
CREATE TABLE IF NOT EXISTS t_user_vehicle (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '绑定ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    vehicle_id BIGINT NOT NULL COMMENT '车辆ID',
    is_default TINYINT DEFAULT 0 COMMENT '是否默认车辆：0否 1是',
    bind_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '绑定时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    UNIQUE KEY uk_user_vehicle (user_id, vehicle_id),
    INDEX idx_user_id (user_id),
    INDEX idx_vehicle_id (vehicle_id),
    FOREIGN KEY (user_id) REFERENCES t_user(id),
    FOREIGN KEY (vehicle_id) REFERENCES t_vehicle(id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '用户车辆绑定表';
-- ==================== 行程表 ====================
CREATE TABLE IF NOT EXISTS t_trip (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '行程ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    vehicle_id BIGINT COMMENT '车辆ID',
    title VARCHAR(100) COMMENT '行程标题',
    start_location VARCHAR(255) COMMENT '起点名称',
    end_location VARCHAR(255) COMMENT '终点名称',
    status TINYINT DEFAULT 0 COMMENT '状态：0未开始 1进行中 2已完成 3已取消',
    start_time DATETIME COMMENT '实际开始时间',
    end_time DATETIME COMMENT '实际结束时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_user_id (user_id),
    INDEX idx_vehicle_id (vehicle_id),
    INDEX idx_status (status),
    FOREIGN KEY (user_id) REFERENCES t_user(id),
    FOREIGN KEY (vehicle_id) REFERENCES t_vehicle(id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '行程表';
-- ==================== 活动表 ====================
CREATE TABLE IF NOT EXISTS t_activity (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '活动ID',
    creator_id BIGINT NOT NULL COMMENT '创建者ID',
    title VARCHAR(100) NOT NULL COMMENT '活动标题',
    description TEXT COMMENT '活动描述',
    location VARCHAR(255) COMMENT '活动地点',
    longitude DECIMAL(10, 7) COMMENT '经度',
    latitude DECIMAL(10, 7) COMMENT '纬度',
    start_time DATETIME COMMENT '开始时间',
    end_time DATETIME COMMENT '结束时间',
    max_participants INT COMMENT '最大参与人数',
    current_participants INT DEFAULT 0 COMMENT '当前参与人数',
    status TINYINT DEFAULT 1 COMMENT '状态：0已取消 1进行中 2已结束',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_creator_id (creator_id),
    INDEX idx_status (status),
    FOREIGN KEY (creator_id) REFERENCES t_user(id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '活动表';
-- ==================== 活动参与表 ====================
CREATE TABLE IF NOT EXISTS t_activity_participant (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '参与ID',
    activity_id BIGINT NOT NULL COMMENT '活动ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    join_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '参与时间',
    status TINYINT DEFAULT 1 COMMENT '状态：0已退出 1已参与',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    UNIQUE KEY uk_activity_user (activity_id, user_id),
    INDEX idx_activity_id (activity_id),
    INDEX idx_user_id (user_id),
    FOREIGN KEY (activity_id) REFERENCES t_activity(id),
    FOREIGN KEY (user_id) REFERENCES t_user(id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '活动参与表';
-- ==================== 费用表 ====================
CREATE TABLE IF NOT EXISTS t_expense (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '费用ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    trip_id BIGINT COMMENT '关联行程ID',
    type TINYINT NOT NULL COMMENT '费用类型：1油费 2过路费 3停车费 4维修费 5其他',
    amount DECIMAL(10, 2) NOT NULL COMMENT '金额',
    description VARCHAR(255) COMMENT '描述',
    expense_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '费用时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_user_id (user_id),
    INDEX idx_trip_id (trip_id),
    INDEX idx_type (type),
    FOREIGN KEY (user_id) REFERENCES t_user(id),
    FOREIGN KEY (trip_id) REFERENCES t_trip(id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '费用表';
-- ==================== 站内信表 ====================
CREATE TABLE IF NOT EXISTS t_message (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '消息ID',
    user_id BIGINT NOT NULL COMMENT '接收用户ID',
    title VARCHAR(100) NOT NULL COMMENT '消息标题',
    content TEXT COMMENT '消息内容',
    type TINYINT DEFAULT 1 COMMENT '消息类型：1系统通知 2活动通知 3其他',
    is_read TINYINT DEFAULT 0 COMMENT '是否已读：0未读 1已读',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记',
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read),
    FOREIGN KEY (user_id) REFERENCES t_user(id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '站内信表';
-- 插入测试数据（可选）
-- 测试用户（密码是 123456 加密后的值）
INSERT INTO t_user (username, password, nickname, phone)
VALUES (
        'test',
        '$2b$10$FQ0fLsq42.azu2YtUTFP4e9j1GmfnTDMV1MrhUkrRGxvRjMlVXhY6',
        '测试用户',
        '13800138000'
    );