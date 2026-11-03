import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, '../data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'ai_platform.db');
export const db = new DatabaseSync(dbPath);

// 初始化数据表结构
db.exec(`
  CREATE TABLE IF NOT EXISTS custom_templates (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    prompt TEXT NOT NULL,
    category TEXT DEFAULT '我的模版',
    ratio TEXT DEFAULT '3:4',
    svg_type TEXT,
    palette TEXT,
    custom_image_url TEXT,
    hook TEXT,
    source_link TEXT,
    is_custom INTEGER DEFAULT 1,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS custom_products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT DEFAULT '3C数码',
    selling_points TEXT,
    price TEXT,
    svg_type TEXT,
    palette TEXT,
    custom_image_url TEXT,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS slicer_cases (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    video_file TEXT NOT NULL,
    duration INTEGER,
    product_count INTEGER DEFAULT 0,
    clip_count INTEGER DEFAULT 0,
    result_json TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
`);

console.log(`📦 [SQLite DB] 数据库已就绪: ${dbPath}`);

export interface CustomTemplateRow {
  id: string;
  title: string;
  prompt: string;
  category?: string;
  ratio?: string;
  svg_type?: string;
  palette?: string;
  custom_image_url?: string;
  hook?: string;
  source_link?: string;
  is_custom?: number;
  created_at: number;
  updated_at: number;
}

export const TemplateDao = {
  getAll() {
    const stmt = db.prepare('SELECT * FROM custom_templates ORDER BY created_at DESC');
    const rows = stmt.all() as unknown as CustomTemplateRow[];
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      prompt: r.prompt,
      category: r.category || '我的模版',
      ratio: r.ratio || '3:4',
      svgType: r.svg_type || undefined,
      palette: r.palette ? JSON.parse(r.palette) : undefined,
      customImageUrl: r.custom_image_url || undefined,
      hook: r.hook || undefined,
      sourceLink: r.source_link || undefined,
      isCustom: Boolean(r.is_custom ?? 1),
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
  },

  getById(id: string) {
    const stmt = db.prepare('SELECT * FROM custom_templates WHERE id = ?');
    const r = stmt.get(id) as unknown as CustomTemplateRow | undefined;
    if (!r) return null;
    return {
      id: r.id,
      title: r.title,
      prompt: r.prompt,
      category: r.category || '我的模版',
      ratio: r.ratio || '3:4',
      svgType: r.svg_type || undefined,
      palette: r.palette ? JSON.parse(r.palette) : undefined,
      customImageUrl: r.custom_image_url || undefined,
      hook: r.hook || undefined,
      sourceLink: r.source_link || undefined,
      isCustom: Boolean(r.is_custom ?? 1),
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };
  },

  upsert(tpl: {
    id: string;
    title: string;
    prompt: string;
    category?: string;
    ratio?: string;
    svgType?: string;
    palette?: any;
    customImageUrl?: string;
    hook?: string;
    sourceLink?: string;
  }) {
    const now = Date.now();
    const stmt = db.prepare(`
      INSERT INTO custom_templates (
        id, title, prompt, category, ratio, svg_type, palette, custom_image_url, hook, source_link, is_custom, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        prompt = excluded.prompt,
        category = excluded.category,
        ratio = excluded.ratio,
        svg_type = excluded.svg_type,
        palette = excluded.palette,
        custom_image_url = excluded.custom_image_url,
        hook = excluded.hook,
        source_link = excluded.source_link,
        updated_at = excluded.updated_at
    `);

    stmt.run(
      tpl.id,
      tpl.title,
      tpl.prompt,
      tpl.category || '我的模版',
      tpl.ratio || '3:4',
      tpl.svgType || null,
      tpl.palette ? JSON.stringify(tpl.palette) : null,
      tpl.customImageUrl || null,
      tpl.hook || null,
      tpl.sourceLink || null,
      now,
      now
    );

    return this.getById(tpl.id);
  },

  delete(id: string) {
    const stmt = db.prepare('DELETE FROM custom_templates WHERE id = ?');
    stmt.run(id);
    return true;
  },
};

export interface CustomProductRow {
  id: string;
  name: string;
  category?: string;
  selling_points?: string;
  price?: string;
  svg_type?: string;
  palette?: string;
  custom_image_url?: string;
  created_at: number;
}

export const ProductDao = {
  getAll() {
    const stmt = db.prepare('SELECT * FROM custom_products ORDER BY created_at DESC');
    const rows = stmt.all() as unknown as CustomProductRow[];
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      category: r.category || '3C数码',
      sellingPoints: r.selling_points ? JSON.parse(r.selling_points) : [],
      price: r.price || '',
      svgType: r.svg_type || undefined,
      palette: r.palette ? JSON.parse(r.palette) : undefined,
      customImageUrl: r.custom_image_url || undefined,
      createdAt: r.created_at,
    }));
  },

  upsert(prod: {
    id: string;
    name: string;
    category?: string;
    sellingPoints?: any;
    price?: string;
    svgType?: string;
    palette?: any;
    customImageUrl?: string;
  }) {
    const now = Date.now();
    const stmt = db.prepare(`
      INSERT INTO custom_products (
        id, name, category, selling_points, price, svg_type, palette, custom_image_url, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        category = excluded.category,
        selling_points = excluded.selling_points,
        price = excluded.price,
        svg_type = excluded.svg_type,
        palette = excluded.palette,
        custom_image_url = excluded.custom_image_url
    `);

    stmt.run(
      prod.id,
      prod.name,
      prod.category || '3C数码',
      prod.sellingPoints ? JSON.stringify(prod.sellingPoints) : null,
      prod.price || '',
      prod.svgType || null,
      prod.palette ? JSON.stringify(prod.palette) : null,
      prod.customImageUrl || null,
      now
    );

    return prod;
  },

  delete(id: string) {
    const stmt = db.prepare('DELETE FROM custom_products WHERE id = ?');
    stmt.run(id);
    return true;
  },
};


export interface SlicerCaseRow {
  id: string;
  name: string;
  video_file: string;
  duration: number;
  product_count: number;
  clip_count: number;
  result_json: string;
  created_at: number;
}

export const SlicerCaseDao = {
  save(row: { id: string; name: string; videoFile: string; result: any }) {
    db.prepare(
      `INSERT OR REPLACE INTO slicer_cases
       (id, name, video_file, duration, product_count, clip_count, result_json, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      row.id,
      row.name,
      row.videoFile,
      row.result.durationSeconds ?? 0,
      row.result.products?.length ?? 0,
      row.result.clips?.length ?? 0,
      JSON.stringify(row.result),
      Date.now()
    );
  },
  list(): Omit<SlicerCaseRow, 'result_json'>[] {
    return db
      .prepare(
        `SELECT id, name, video_file, duration, product_count, clip_count, created_at
         FROM slicer_cases ORDER BY created_at DESC`
      )
      .all() as any;
  },
  get(id: string): SlicerCaseRow | undefined {
    return db.prepare(`SELECT * FROM slicer_cases WHERE id = ?`).get(id) as any;
  },
  remove(id: string) {
    db.prepare(`DELETE FROM slicer_cases WHERE id = ?`).run(id);
  },
};
