import { PrismaClient } from '@prisma/client';
import { readdirSync, lstatSync, readFileSync } from 'fs';
import { resolve } from 'path';

export class Migrations {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly querys: string[] = [],
  ) {}

  async exec() {
    const defaultPath = resolve(__dirname, '..', '..', 'prisma', 'migrations');
    const files = [];
    this.getListFiles(files, defaultPath);
    this.readListFiles(files);
    await this.execQuerys();
  }

  private async execQuerys() {
    for (const query of this.querys) {
      await this.prisma.$executeRawUnsafe(`${query}`);
    }
  }

  private readListFiles(files: string[]) {
    for (const filePath of files) {
      this.readFiles(filePath);
    }
  }

  private getListFiles(list: string[], path: string): void {
    const files = readdirSync(path);
    for (const file of files) {
      this.checkPathIsDirectory(list, path, file);
    }
  }

  private checkPathIsDirectory(
    list: string[],
    path: string,
    file: string,
  ): void {
    if (lstatSync(`${path}/${file}`).isDirectory()) {
      this.getListFiles(list, `${path}/${file}`);
      return;
    }
    this.addFileToList(list, path, file);
  }

  private addFileToList(list: string[], path: string, file: string): void {
    if (!file.endsWith('.sql')) {
      return;
    }
    list.push(`${path}/${file}`);
  }

  private readFiles(path: string) {
    const content = readFileSync(path, { encoding: 'utf-8' });
    let query = '';
    for (const line of content.split('\n')) {
      if (line.indexOf('--') !== -1) {
        if (query !== '') {
          this.querys.push(query);
          query = '';
        }
      } else {
        if (line.trim()) {
          query += line.replaceAll('    ', ' ');
        }
      }
    }
    this.querys.push(query);
    this.querys.filter((n) => n);
  }
}
