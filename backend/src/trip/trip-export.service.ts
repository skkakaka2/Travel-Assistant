import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trip } from './entities/trip.entity';
import puppeteer from 'puppeteer';
import { join } from 'path';
import { readFile } from 'fs/promises';
import { formatDistance, formatDuration, formatCurrency } from 'src/utils/format';

@Injectable()
export class TripExportService {
  private readonly logger = new Logger(TripExportService.name);

  constructor(
    @InjectRepository(Trip)
    private readonly tripRepository: Repository<Trip>,
  ) {}

  /**
   * 获取完整的行程数据（包含所有关联数据）
   */
  async getTripWithDetails(id: number) {
    const trip = await this.tripRepository.findOne({
      where: { id },
      relations: {
        dayPlans: {
          dayPlanItems: true,
        },
      },
      order: {
        dayPlans: {
          dayNumber: 'ASC',
          dayPlanItems: {
            startTime: 'ASC',
          },
        },
      },
    });

    if (!trip) {
      throw new Error('Trip not found');
    }

    // 对每个 dayPlan 的 dayPlanItems 按 startTime 排序
    trip.dayPlans.forEach((dayPlan) => {
      dayPlan.dayPlanItems.sort((a, b) => {
        if (a.startTime && b.startTime) {
          return a.startTime.localeCompare(b.startTime);
        }
        if (a.startTime) return -1;
        if (b.startTime) return 1;
        return a.order - b.order;
      });
    });

    return trip;
  }

  /**
   * 生成行程 HTML 内容
   */
  private async generateTripHTML(trip: Trip): Promise<string> {
    const templatePath = join(process.cwd(), 'src', 'trip', 'templates', 'trip-export.html');
    let htmlTemplate: string;

    try {
      htmlTemplate = await readFile(templatePath, 'utf-8');
    } catch (error) {
      // 如果模板文件不存在，使用内联模板
      htmlTemplate = this.getDefaultTemplate();
    }

    // 计算总里程和总时间
    const totalDistance = trip.dayPlans.reduce(
      (sum, dayPlan) => sum + (dayPlan.distance || 0),
      0,
    );
    const totalDuration = trip.dayPlans.reduce(
      (sum, dayPlan) => sum + (dayPlan.duration || 0),
      0,
    );

    // 替换模板变量
    const html = htmlTemplate
      .replace('{{TRIP_NAME}}', trip.name || '未命名行程')
      .replace('{{TRIP_DESCRIPTION}}', trip.description || '暂无描述')
      .replace('{{START_DATE}}', trip.startDate || '')
      .replace('{{END_DATE}}', trip.endDate || '')
      .replace('{{USER_COUNT}}', String(trip.userCount || 0))
      .replace('{{BUDGET}}', formatCurrency(trip.budget || 0))
      .replace('{{TOTAL_DISTANCE}}', formatDistance(totalDistance))
      .replace('{{TOTAL_DURATION}}', formatDuration(totalDuration))
      .replace('{{DAYS_COUNT}}', String(trip.dayPlans.length))
      .replace('{{DAY_PLANS_CONTENT}}', this.generateDayPlansHTML(trip));

    return html;
  }

  /**
   * 生成每日计划的 HTML
   */
  private generateDayPlansHTML(trip: Trip): string {
    return trip.dayPlans
      .map((dayPlan) => {
        const dayDistance = formatDistance(dayPlan.distance || 0);
        const dayDuration = formatDuration(dayPlan.duration || 0);

        const itemsHTML = dayPlan.dayPlanItems
          .map((item) => {
            const itemDistance = item.distance ? formatDistance(item.distance) : '-';
            const itemDuration = item.duration ? formatDuration(item.duration) : '-';
            const itemCost = item.cost ? formatCurrency(item.cost) : '-';
            const timeRange =
              item.startTime && item.endTime
                ? `${item.startTime} - ${item.endTime}`
                : item.startTime || item.endTime || '-';

            return `
              <div class="item-card">
                <div class="item-header">
                  <span class="item-type">${this.getItemTypeLabel(item.type)}</span>
                  <h4 class="item-name">${item.name}</h4>
                </div>
                <div class="item-details">
                  ${item.address ? `<p class="item-address">📍 ${item.address}</p>` : ''}
                  <div class="item-meta">
                    ${timeRange !== '-' ? `<span>🕐 ${timeRange}</span>` : ''}
                    ${itemDistance !== '-' ? `<span>🚗 ${itemDistance}</span>` : ''}
                    ${itemDuration !== '-' ? `<span>⏱️ ${itemDuration}</span>` : ''}
                    ${itemCost !== '-' ? `<span>💰 ${itemCost}</span>` : ''}
                  </div>
                  ${item.notes ? `<p class="item-notes">${item.notes}</p>` : ''}
                </div>
              </div>
            `;
          })
          .join('');

        return `
          <div class="day-plan">
            <div class="day-header">
              <h2 class="day-title">第 ${dayPlan.dayNumber} 天</h2>
              <span class="day-date">${dayPlan.date}</span>
            </div>
            <div class="day-stats">
              <span>总里程: ${dayDistance}</span>
              <span>总时长: ${dayDuration}</span>
            </div>
            ${dayPlan.notes ? `<div class="day-notes">${dayPlan.notes}</div>` : ''}
            <div class="items-container">
              ${itemsHTML}
            </div>
          </div>
        `;
      })
      .join('');
  }

  /**
   * 获取项目类型标签
   */
  private getItemTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      HOTEL: '🏨 酒店',
      ATTRACTION: '🎯 景点',
      RESTAURANT: '🍽️ 餐厅',
      TRANSPORT: '🚗 交通',
      ACTIVITY: '🎪 活动',
      OTHER: '📌 其他',
    };
    return labels[type] || type;
  }

  /**
   * 获取默认 HTML 模板
   */
  private getDefaultTemplate(): string {
    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>行程导出</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
      line-height: 1.6;
      color: #333;
      background: #f5f5f5;
      padding: 20px;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      padding: 40px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      border-radius: 8px;
    }
    .trip-header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 30px;
      border-bottom: 2px solid #e0e0e0;
    }
    .trip-title {
      font-size: 32px;
      font-weight: bold;
      color: #1890ff;
      margin-bottom: 10px;
    }
    .trip-meta {
      display: flex;
      justify-content: center;
      gap: 20px;
      flex-wrap: wrap;
      margin-top: 15px;
      color: #666;
      font-size: 14px;
    }
    .trip-stats {
      display: flex;
      justify-content: space-around;
      background: #f0f7ff;
      padding: 20px;
      border-radius: 8px;
      margin: 30px 0;
    }
    .stat-item {
      text-align: center;
    }
    .stat-label {
      font-size: 12px;
      color: #999;
      margin-bottom: 5px;
    }
    .stat-value {
      font-size: 20px;
      font-weight: bold;
      color: #1890ff;
    }
    .day-plan {
      margin-bottom: 40px;
      padding: 25px;
      background: #fafafa;
      border-radius: 8px;
      border-left: 4px solid #1890ff;
    }
    .day-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }
    .day-title {
      font-size: 24px;
      color: #1890ff;
    }
    .day-date {
      color: #999;
      font-size: 14px;
    }
    .day-stats {
      display: flex;
      gap: 20px;
      margin-bottom: 15px;
      font-size: 14px;
      color: #666;
    }
    .day-notes {
      background: #fff;
      padding: 15px;
      border-radius: 6px;
      margin-bottom: 20px;
      color: #666;
      border-left: 3px solid #52c41a;
    }
    .items-container {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }
    .item-card {
      background: white;
      padding: 20px;
      border-radius: 6px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      border-left: 3px solid #1890ff;
    }
    .item-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 10px;
    }
    .item-type {
      background: #e6f7ff;
      color: #1890ff;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
    }
    .item-name {
      font-size: 18px;
      font-weight: bold;
      color: #333;
    }
    .item-address {
      color: #666;
      margin: 8px 0;
      font-size: 14px;
    }
    .item-meta {
      display: flex;
      gap: 15px;
      flex-wrap: wrap;
      margin: 10px 0;
      font-size: 13px;
      color: #999;
    }
    .item-notes {
      margin-top: 10px;
      padding-top: 10px;
      border-top: 1px solid #f0f0f0;
      color: #666;
      font-size: 14px;
    }
    @media print {
      body {
        background: white;
        padding: 0;
      }
      .container {
        box-shadow: none;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="trip-header">
      <h1 class="trip-title">{{TRIP_NAME}}</h1>
      <p style="color: #666; margin-top: 10px;">{{TRIP_DESCRIPTION}}</p>
      <div class="trip-meta">
        <span>📅 {{START_DATE}} 至 {{END_DATE}}</span>
        <span>👥 {{USER_COUNT}} 人</span>
        <span>💰 预算: {{BUDGET}}</span>
      </div>
    </div>
    
    <div class="trip-stats">
      <div class="stat-item">
        <div class="stat-label">总里程</div>
        <div class="stat-value">{{TOTAL_DISTANCE}}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">总时长</div>
        <div class="stat-value">{{TOTAL_DURATION}}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">行程天数</div>
        <div class="stat-value">{{DAYS_COUNT}} 天</div>
      </div>
    </div>

    {{DAY_PLANS_CONTENT}}
  </div>
</body>
</html>
    `;
  }

  /**
   * 获取浏览器可执行文件路径
   */
  private getBrowserExecutablePath(): string | undefined {
    // 优先使用环境变量指定的 Chrome 路径
    if (process.env.CHROME_PATH) {
      this.logger.log(`Using Chrome from environment variable: ${process.env.CHROME_PATH}`);
      return process.env.CHROME_PATH;
    }

    // 尝试常见的系统 Chrome 路径
    const commonPaths = [
      '/usr/bin/google-chrome',
      '/usr/bin/google-chrome-stable',
      '/usr/bin/chromium',
      '/usr/bin/chromium-browser',
      '/snap/bin/chromium',
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    ];

    const fs = require('fs');
    for (const path of commonPaths) {
      try {
        if (fs.existsSync(path)) {
          this.logger.log(`Using system Chrome: ${path}`);
          return path;
        }
      } catch {
        // 忽略错误，继续尝试下一个路径
      }
    }

    // 如果找不到系统 Chrome，返回 undefined，让 puppeteer 使用自带的 Chromium
    this.logger.warn('No system Chrome found, will use Puppeteer bundled Chromium');
    return undefined;
  }

  /**
   * 导出为 PDF
   */
  async exportToPDF(tripId: number): Promise<Buffer> {
    this.logger.log(`Exporting trip ${tripId} to PDF`);

    const trip = await this.getTripWithDetails(tripId);
    const html = await this.generateTripHTML(trip);

    const executablePath = this.getBrowserExecutablePath();
    const launchOptions: any = {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    };

    if (executablePath) {
      launchOptions.executablePath = executablePath;
    }

    const browser = await puppeteer.launch(launchOptions);

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm',
        },
      });

      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  }

  /**
   * 导出为图片 (PNG)
   */
  async exportToImage(tripId: number): Promise<Buffer> {
    this.logger.log(`Exporting trip ${tripId} to image`);

    const trip = await this.getTripWithDetails(tripId);
    const html = await this.generateTripHTML(trip);

    const executablePath = this.getBrowserExecutablePath();
    const launchOptions: any = {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    };

    if (executablePath) {
      launchOptions.executablePath = executablePath;
    }

    const browser = await puppeteer.launch(launchOptions);

    try {
      const page = await browser.newPage();
      await page.setViewport({ width: 1200, height: 0 });
      await page.setContent(html, { waitUntil: 'networkidle0' });

      // 等待内容渲染完成
      await new Promise((resolve) => setTimeout(resolve, 500));

      const imageBuffer = await page.screenshot({
        type: 'png',
        fullPage: true,
      });

      return Buffer.from(imageBuffer);
    } finally {
      await browser.close();
    }
  }
}

