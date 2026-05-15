// file-proxy.controller.ts
// Đặt file này vào src/ rồi import vào AppModule

import { Controller, Get, Query, Res, HttpException, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Proxy')
@Controller('proxy')
export class FileProxyController {

  // =========================
  // DETECT CONTENT TYPE
  // =========================
  private detectContentType(url: string): string {
    if (url.match(/\.pdf$/i)) return 'application/pdf';
    if (url.match(/\.jpg$|\.jpeg$/i)) return 'image/jpeg';
    if (url.match(/\.png$/i)) return 'image/png';
    if (url.match(/\.gif$/i)) return 'image/gif';
    if (url.match(/\.webp$/i)) return 'image/webp';
    if (url.match(/\.docx$/i)) return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    if (url.match(/\.doc$/i)) return 'application/msword';
    if (url.match(/\.xlsx$/i)) return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    if (url.match(/\.pptx$/i)) return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';

    // Cloudinary raw upload không có extension -> mặc định PDF
    if (url.includes('/raw/upload/')) return 'application/pdf';

    return 'application/octet-stream';
  }

  // =========================
  // PROXY FILE
  // =========================
  @Get('file')
  @ApiOperation({ summary: 'Proxy file từ Cloudinary, trả về inline để xem trên trình duyệt' })
  @ApiQuery({ name: 'url', required: true, description: 'URL file cần preview' })
  async proxyFile(
    @Query('url') url: string,
    @Res() res: Response,
  ) {
    if (!url) {
      throw new HttpException('Thiếu tham số url', HttpStatus.BAD_REQUEST);
    }

    // Chỉ cho phép fetch từ Cloudinary để tránh bị lợi dụng làm open proxy
    const allowedDomains = ['cloudinary.com', 'res.cloudinary.com'];
    const isAllowed = allowedDomains.some((domain) => url.includes(domain));
    if (!isAllowed) {
      throw new HttpException('Domain không được phép', HttpStatus.FORBIDDEN);
    }

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new HttpException(
          `Không thể tải file: ${response.statusText}`,
          HttpStatus.BAD_GATEWAY,
        );
      }

      const rawContentType = response.headers.get('content-type') || '';

      // Nếu Cloudinary trả về application/octet-stream thì tự detect
      const contentType =
        rawContentType === 'application/octet-stream' || !rawContentType
          ? this.detectContentType(url)
          : rawContentType;

      const buffer = Buffer.from(await response.arrayBuffer());

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', 'inline');
      res.setHeader('Content-Length', buffer.length);
      res.setHeader('Cache-Control', 'public, max-age=3600');

      res.send(buffer);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Lỗi khi tải file', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}