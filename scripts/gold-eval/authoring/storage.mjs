/* global process */

import fs from 'node:fs/promises';
import path from 'node:path';

export async function pathExists(filePath) {
    try {
        await fs.access(filePath);
        return true;
    } catch (error) {
        if (error?.code === 'ENOENT') return false;
        throw error;
    }
}

export async function readJson(filePath) {
    return JSON.parse(await fs.readFile(filePath, 'utf8'));
}

export async function readJsonl(filePath) {
    const text = await fs.readFile(filePath, 'utf8');
    return text.split(/\r?\n/).filter(line => line.trim()).map((line, index) => {
        try {
            return JSON.parse(line);
        } catch (error) {
            throw new Error(`${filePath} 第 ${index + 1} 行解析失败: ${error?.message || error}`);
        }
    });
}

async function atomicWrite(filePath, content) {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    const tempPath = path.join(
        path.dirname(filePath),
        `.${path.basename(filePath)}.${process.pid}.${Date.now()}.tmp`,
    );
    await fs.writeFile(tempPath, content, 'utf8');
    await fs.rename(tempPath, filePath);
}

export async function writeJson(filePath, value) {
    await atomicWrite(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

export async function writeJsonl(filePath, rows) {
    const content = rows.map(row => JSON.stringify(row)).join('\n');
    await atomicWrite(filePath, content ? `${content}\n` : '');
}

export async function writeText(filePath, content) {
    await atomicWrite(filePath, String(content));
}
