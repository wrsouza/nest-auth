import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { randomUUID } from 'node:crypto';

export type PaymentStatusType = 'PENDING' | 'PAID' | 'PARTIAL' | 'CANCELLED';

class OrderItemCreateDto {
  @ApiProperty({
    type: String,
    example: '92736512',
  })
  @IsString()
  productId: string;

  @ApiProperty({
    type: String,
    example: 'ABC-1242455',
  })
  @IsString()
  productSku: string;

  @ApiProperty({
    type: Number,
    example: 1,
  })
  @IsInt()
  quantity: number;

  @ApiProperty({
    type: Number,
    example: 187.53,
  })
  @IsNumber()
  price: number;
}

export class OrderCreateDto {
  @ApiProperty({
    type: String,
    example: randomUUID(),
  })
  @IsUUID()
  userId: string;

  @ApiProperty({
    type: Number,
    example: 187.53,
  })
  @IsNumber()
  total: number;

  @ApiProperty({
    type: String,
    example: 'Others',
  })
  @IsString()
  paymentType: string;

  @ApiProperty({
    type: String,
    example: 'PENDING',
  })
  @IsIn(['PENDING', 'PAID', 'PARTIAL', 'CANCELLED'])
  paymentStatus: PaymentStatusType;

  @ApiProperty({
    type: [OrderItemCreateDto],
  })
  @Type(() => OrderItemCreateDto)
  @IsArray()
  @ValidateNested({ each: true })
  items: OrderItemCreateDto[];
}
