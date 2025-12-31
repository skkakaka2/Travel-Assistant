import { IsNumber, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export interface Pagination {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginationQuery {
  page: number;
  pageSize: number;
}

export class PaginationQuery implements PaginationQuery {
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(999)
  page: number = 1;
  
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  pageSize: number = 10;
}

export interface PaginationResponse<T> {
  data: T[];
  pagination: Pagination;
}

export class Pagination implements Pagination {
  public total: number;
  public page: number;
  public pageSize: number;
  public totalPages: number;

  public constructor(total: number, page: number, pageSize: number) {
    this.total = total;
    this.page = page;
    this.pageSize = pageSize;
    this.totalPages = Math.ceil(total / pageSize);
  }
}

export class PaginationResponse<T> implements PaginationResponse<T> {
  public list: T[];
  public pagination: Pagination;

  public constructor(data: T[], total: number, page: number, pageSize: number) {
    this.list = data;
    this.pagination = new Pagination(total, page, pageSize);
  }
}

