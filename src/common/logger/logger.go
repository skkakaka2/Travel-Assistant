package logger

import (
	"os"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"gopkg.in/natefinch/lumberjack.v2"
)

var Logger *zap.Logger
var Sugar *zap.SugaredLogger

func InitLogger() {

	lumberWriter := &lumberjack.Logger{
		Filename:   "logs/app.log", // 日志文件路径
		MaxSize:    10,             // 单文件最大 MB
		MaxBackups: 5,              // 保留旧文件最大数量
		MaxAge:     7,              // 保留旧文件最大天数
		Compress:   false,          // 是否压缩旧文件
		LocalTime:  true,           // 使用本地时间
	}

	// 编码器配置
	encoderConfig := zapcore.EncoderConfig{
		TimeKey:        "timestamp",
		LevelKey:       "level",
		NameKey:        "logger",
		CallerKey:      "caller",
		FunctionKey:    zapcore.OmitKey,
		MessageKey:     "message",
		StacktraceKey:  "stacktrace",
		LineEnding:     zapcore.DefaultLineEnding,
		EncodeLevel:    zapcore.LowercaseLevelEncoder,
		EncodeTime:     zapcore.ISO8601TimeEncoder,
		EncodeDuration: zapcore.SecondsDurationEncoder,
		EncodeCaller:   zapcore.ShortCallerEncoder,
	}

	// 同时输出到控制台和文件
	core := zapcore.NewTee(
		// 控制台输出（开发友好）
		zapcore.NewCore(
			zapcore.NewConsoleEncoder(encoderConfig),
			zapcore.AddSync(os.Stdout),
			zap.DebugLevel,
		),
		// 文件输出（JSON 格式）
		zapcore.NewCore(
			zapcore.NewJSONEncoder(encoderConfig),
			zapcore.AddSync(lumberWriter),
			zap.InfoLevel,
		),
	)

	Logger = zap.New(core, zap.AddCaller())
	Sugar = Logger.Sugar()

	Sugar.Info("Logger初始化成功")
}
