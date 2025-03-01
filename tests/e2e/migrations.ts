import { PrismaClient } from '@prisma/client';
import { readdirSync, lstatSync, readFileSync } from 'fs';
import { resolve } from 'path';

export class Migrations {
  private readonly querys: string[] = [];
  private newquery: string;

  constructor(private readonly prisma: PrismaClient) {}

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

  private closeQuery() {
    if (this.newquery !== '') {
      this.querys.push(this.newquery);
      this.newquery = '';
    }
  }

  private addLineToQuery(line: string) {
    if (line.replaceAll('    ', ' ').trim()) {
      this.newquery += line;
    }
  }

  private readFiles(path: string) {
    this.newquery = '';
    const content = readFileSync(path, { encoding: 'utf-8' });
    for (const line of content.split('\n')) {
      if (line.indexOf('--') !== -1) {
        this.closeQuery();
      } else {
        this.addLineToQuery(line);
      }
    }
    this.querys.push(this.newquery);
    this.querys.filter((n) => n);
  }
}
