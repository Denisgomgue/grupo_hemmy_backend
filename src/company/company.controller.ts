import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';

@Controller('company')
@UseGuards(JwtAuthGuard)
export class CompanyController {
    constructor(private readonly companyService: CompanyService) { }

    @Post()
    create(@Body() createCompanyDto: CreateCompanyDto) {
        return this.companyService.create(createCompanyDto);
    }

    @Get()
    @Public()
    findAll() {
        return this.companyService.findAll();
    }

    @Get('info')
    @Public()
    getCompanyInfo() {
        return this.companyService.getCompanyInfo();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.companyService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto) {
        return this.companyService.update(+id, updateCompanyDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.companyService.remove(+id);
    }

    @Post(':id/logo/:type')
    @UseInterceptors(FileInterceptor('logo'))
    uploadLogo(
        @Param('id') id: string,
        @Param('type') type: string,
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
                    new FileTypeValidator({ fileType: '.(png|jpeg|jpg|svg)' }),
                ],
            }),
        )
        logo: Express.Multer.File,
    ) {
        // Guardar la ruta completa sin la barra inicial para consistencia
        const logoPath = `uploads/logos/${logo.filename}`;
        return this.companyService.uploadLogo(+id, type, logoPath);
    }

    // Endpoints adicionales para gestión de logos
    @Get(':id/logos')
    getLogos(@Param('id') id: string) {
        return this.companyService.findOne(+id).then(company => ({
            normal: company.logoNormal,
            horizontal: company.logoHorizontal,
            reduced: company.logoReduced,
            negative: company.logoNegative
        }));
    }

    @Delete(':id/logo/:type')
    removeLogo(@Param('id') id: string, @Param('type') type: string) {
        return this.companyService.uploadLogo(+id, type, null);
    }
} 