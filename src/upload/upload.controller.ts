import {
  Controller,
  Post,
  Delete,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  Query,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { UploadService } from './upload.service';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const multerOptions = {
  storage: memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req: any, file: Express.Multer.File, cb: any) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(new BadRequestException('Only JPEG, PNG and WebP images are allowed'), false);
    }
    cb(null, true);
  },
};

@ApiTags('upload')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @ApiOperation({ summary: 'Upload a single image (for categories)' })
  @ApiConsumes('multipart/form-data')
  @ApiQuery({ name: 'folder', required: false, example: 'categories', description: 'Storage folder: categories | products | general' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async uploadOne(
    @UploadedFile() file: Express.Multer.File,
    @Query('folder') folder = 'general',
  ) {
    if (!file) throw new BadRequestException('No file provided');
    const url = await this.uploadService.uploadImage(file, folder);
    return { url };
  }

  @Post('images')
  @ApiOperation({ summary: 'Upload multiple images (for products, max 10)' })
  @ApiConsumes('multipart/form-data')
  @ApiQuery({ name: 'folder', required: false, example: 'products', description: 'Storage folder: categories | products | general' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('files', 10, multerOptions))
  async uploadMany(
    @UploadedFiles() files: Express.Multer.File[],
    @Query('folder') folder = 'general',
  ) {
    if (!files || files.length === 0) throw new BadRequestException('No files provided');
    const urls = await this.uploadService.uploadImages(files, folder);
    return { urls };
  }

  @Delete('image')
  @ApiOperation({ summary: 'Delete an image by URL' })
  async deleteImage(@Body('url') url: string) {
    if (!url) throw new BadRequestException('No URL provided');
    await this.uploadService.deleteImage(url);
    return { message: 'Image deleted successfully' };
  }
}
